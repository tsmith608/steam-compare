// app/api/compare/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const API_KEY = process.env.STEAM_API_KEY;

/* ------------------------------ Helpers ------------------------------ */

// Resolve SteamID64 from 17-digit ID, profile URL, or vanity. Returns null for blank.
async function resolveSteamID(input) {
  if (!input || !input.trim()) return null;
  const cleaned = input.trim();

  // Direct SteamID64
  if (/^\d{17}$/.test(cleaned)) return cleaned;

  // Profile URL with numeric ID
  const profileMatch = cleaned.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profileMatch) return profileMatch[1];

  // Vanity URL or plain vanity text
  const vanityMatch = cleaned.match(/steamcommunity\.com\/id\/([^\/?#]+)/i);
  const vanity = vanityMatch
    ? vanityMatch[1]
    : cleaned
      .replace(/^https?:\/\/|www\.|steamcommunity\.com\/|id\/|profiles\//gi, "")
      .split(/[/?#]/)[0];

  // Optimization: Check DB *before* external API for vanity
  try {
    const dbRes = await query(
      "SELECT steam_id FROM users WHERE LOWER(persona_name) = LOWER($1) OR LOWER(vanity_id) = LOWER($1) LIMIT 1",
      [vanity]
    );
    if (dbRes.rows.length > 0) {
      return dbRes.rows[0].steam_id;
    }
  } catch (dbErr) {
    console.error("DB check for vanity failed:", dbErr);
  }

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${encodeURIComponent(
      vanity
    )}`
  );
  const data = await res.json();
  if (data?.response?.success === 1 && data.response.steamid) {
    return data.response.steamid;
  }

  // Fallback: Check our database for persona_name or vanity_id
  try {
    const dbRes = await query(
      "SELECT steam_id FROM users WHERE LOWER(persona_name) = LOWER($1) OR LOWER(vanity_id) = LOWER($1) LIMIT 1",
      [vanity]
    );
    if (dbRes.rows.length > 0) {
      return dbRes.rows[0].steam_id;
    }
  } catch (dbErr) {
    console.error("DB check for vanity failed:", dbErr);
  }

  throw new Error(`Could not resolve Steam vanity name: ${input}`);
}

// Blacklist of AppIDs to hide generally (Utilities, Test Servers, etc.)
const JUNK_APP_IDS = new Set([
  431960, // Wallpaper Engine
  622590, // Tom Clancy's Rainbow Six Siege - Test Server
  1040460, // Tom Clancy's Rainbow Six Siege - Technical Test Server
  654310, // For Honor - Public Test
]);

// Fetch owned games (may be empty array). Throws if response missing (likely private).
async function fetchLibrary(steamid) {
  if (!steamid) return [];
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${steamid}&include_appinfo=true&format=json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Steam API error (${r.status}) for ${steamid}`);
  const j = await r.json();
  if (!j || !j.response) {
    throw new Error(
      `Steam library not accessible for ${steamid}. Set Game Details privacy to Public.`
    );
  }

  // Filter out junk apps
  return (j.response.games || []).filter(g => {
    if (JUNK_APP_IDS.has(g.appid)) return false;
    // Name-based fallback for R6 Test Servers or similar if IDs change
    if (g.name && g.name.includes("Rainbow Six Siege") && (g.name.includes("Test") || g.name.includes("TTS"))) return false;
    if (g.name && g.name.includes("Public Test")) return false;
    return true;
  });
}

// Fetch wishlist (returns object keyed by appid)
async function fetchWishlist(steamid) {
  if (!steamid) return {};
  try {
    const url = `https://store.steampowered.com/wishlist/profiles/${steamid}/wishlistdata/`;
    const r = await fetch(url);
    if (!r.ok) return {};

    const contentType = r.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`[Wishlist] Non-JSON response for ${steamid}: ${contentType}`);
      return {};
    }

    const j = await r.json();
    return j || {};
  } catch (err) {
    console.warn(`[Wishlist] Failed to fetch for ${steamid}:`, err.message);
    return {};
  }
}

// Build a Map appid->game for quick lookups
const toMap = (lib) => new Map((lib || []).map((g) => [Number(g.appid), g]));

// Set intersection (for shared)
function intersectSets(a, b) {
  const res = new Set();
  for (const x of a) if (b.has(x)) res.add(x);
  return res;
}

// Fetch display names + avatars for provided IDs (preserve positional order)
// Updated to use DB cache first, then API for missing/stale data
async function fetchProfiles(idsInOrder) {
  const steamids = idsInOrder.filter(Boolean);
  if (steamids.length === 0) {
    return {
      usernames: idsInOrder.map(() => null),
      avatars: idsInOrder.map(() => null),
      ids: idsInOrder.map(() => null),
    };
  }

  // 1. Fetch from DB
  const dbRes = await query(
    `SELECT steam_id, persona_name, avatar_url, updated_at FROM users WHERE steam_id = ANY($1)`,
    [steamids]
  );
  const dbMap = new Map(dbRes.rows.map(r => [r.steam_id, r]));

  // 2. Identify missing or stale IDs
  const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  const missingableIds = steamids.filter(id => {
    const record = dbMap.get(id);
    if (!record) return true;
    if (!record.persona_name || !record.avatar_url) return true;

    // Check staleness
    const lastUpdate = new Date(record.updated_at).getTime();
    if (isNaN(lastUpdate) || (now - lastUpdate > STALE_THRESHOLD)) return true;

    return false;
  });

  // 3. Fetch missing/stale from API
  if (missingableIds.length > 0) {
    try {
      const res = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&steamids=${missingableIds.join(",")}`
      );
      const data = await res.json();
      const players = data?.response?.players || [];

      // 4. Upsert fresh data into DB
      await Promise.all(players.map(p =>
        query(
          `INSERT INTO users (steam_id, persona_name, avatar_url, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (steam_id) 
           DO UPDATE SET 
             persona_name = EXCLUDED.persona_name,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = NOW() RETURNING steam_id, persona_name, avatar_url, updated_at`,
          [p.steamid, p.personaname, p.avatarfull]
        ).then(r => {
          if (r.rows[0]) dbMap.set(r.rows[0].steam_id, r.rows[0]);
        }).catch(e => console.error(`Failed to cache profile ${p.steamid}:`, e))
      ));

    } catch (apiErr) {
      console.error("Failed to fetch missing profiles from Steam:", apiErr);
    }
  }

  const usernames = idsInOrder.map((id) =>
    id ? dbMap.get(String(id))?.persona_name || id : null
  );
  const avatars = idsInOrder.map((id) =>
    id ? dbMap.get(String(id))?.avatar_url || null : null
  );

  return { usernames, avatars, ids: idsInOrder };
}

/* -------------------------------- Route -------------------------------- */

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("[API /compare] Request Body:", JSON.stringify(body));

    // Support both old {user1..4} and new {users: []} format
    let inputUsers = body.users || [body.user1, body.user2, body.user3, body.user4];
    inputUsers = inputUsers.filter(u => u && u.trim()); // Remove empties

    // Hardening: Sanitize inputs
    const sanitize = (s) => (s || "").toString().trim().replace(/[<>"'%;()&+]/g, "");

    // Resolve all IDs first
    const resolvedIds = await Promise.all(
      inputUsers.map(u => resolveSteamID(sanitize(u)))
    );

    const validIds = resolvedIds.filter(Boolean);

    if (validIds.length < 2) {
      return NextResponse.json(
        { error: "At least two valid Steam profiles are required." },
        { status: 400 }
      );
    }

    // Check Premium Status/Tier
    let highestTier = 'Noob';
    let tierCheck = { rows: [] };
    if (validIds.length > 0) {
      const placeholders = validIds.map((_, i) => `$${i + 1}`).join(",");
      tierCheck = await query(
        `SELECT steam_id, tier FROM users WHERE steam_id IN (${placeholders}) AND (expires_at IS NULL OR expires_at > NOW())`,
        validIds
      );

      if (tierCheck.rows.length > 0) {
        // Find highest tier (Hacker > Pro > Noob)
        const tiersFound = tierCheck.rows.map(r => r.tier);
        if (tiersFound.includes('Hacker')) highestTier = 'Hacker';
        else if (tiersFound.includes('Pro')) highestTier = 'Pro';
      }
    }

    const tierLimits = { 'Noob': 3, 'Pro': 6, 'Hacker': 12 };
    const maxUsers = tierLimits[highestTier] || 3;

    if (validIds.length > maxUsers) {
      const nextTier = highestTier === 'Noob' ? 'Pro' : 'Hacker';
      const upgradeMsg = highestTier === 'Hacker'
        ? "Even Hacker is limited to 12 users for performance."
        : `Your highest tier (${highestTier}) is limited to ${maxUsers} users. Upgrade to ${nextTier} for more!`;

      return NextResponse.json(
        { error: upgradeMsg },
        { status: 403 }
      );
    }

    const isPremium = highestTier !== 'Noob';

    // Fetch Profiles
    const { usernames, avatars, ids } = await fetchProfiles(validIds);

    // Fetch Libraries + Wishlists
    const [libraries, wishlists] = await Promise.all([
      Promise.all(validIds.map(id => fetchLibrary(id))),
      Promise.all(validIds.map(id => fetchWishlist(id)))
    ]);

    // Create maps for libraries
    const maps = libraries.map(lib => toMap(lib));
    // Create sets for wishlists appids
    const wishlistSets = wishlists.map(w => new Set(Object.keys(w).map(Number)));

    // Calculate Shared Games
    // Start with the first user's games, then intersect with everyone else
    if (maps.length === 0) return NextResponse.json({ shared: [], unique: {}, profiles: [] });

    const appidSets = maps.map(m => new Set(m.keys()));
    let sharedSet = appidSets[0];
    for (let i = 1; i < appidSets.length; i++) {
      sharedSet = intersectSets(sharedSet, appidSets[i]);
    }

    const shared = Array.from(sharedSet).map(appid => {
      // Get metadata from first map that has it (should be all, but safe fallback)
      const gameData = maps[0].get(appid) || { name: String(appid) };

      // Collect playtime for each user
      const playtimes = {};
      validIds.forEach((id, idx) => {
        playtimes[id] = maps[idx].get(appid)?.playtime_forever || 0;
      });

      return {
        appid,
        name: gameData.name,
        playtimes
      };
    });

    // Calculate Unique Games (Only User X owns)
    // For each user, find games in their map that are NOT in the union of all other maps
    const unique = {};

    validIds.forEach((targetId, targetIdx) => {
      const targetMap = maps[targetIdx];
      const otherMaps = maps.filter((_, i) => i !== targetIdx);

      // Build union of others
      const othersUnion = new Set();
      otherMaps.forEach(m => {
        for (const k of m.keys()) othersUnion.add(k);
      });

      const uniqueGames = [];
      for (const [appid, g] of targetMap.entries()) {
        if (!othersUnion.has(Number(appid))) {
          uniqueGames.push({
            appid,
            name: g.name,
            playtime_forever: g.playtime_forever || 0
          });
        }
      }
      unique[targetId] = uniqueGames;
    });

    // Calculate Shared Wishlist (All have wishlisted it)
    let sharedWishlistSet = wishlistSets[0];
    for (let i = 1; i < wishlistSets.length; i++) {
      sharedWishlistSet = intersectSets(sharedWishlistSet, wishlistSets[i]);
    }
    const sharedWishlist = Array.from(sharedWishlistSet).map(appid => {
      // Find metadata from any wishlist that has it
      let name = String(appid);
      for (const w of wishlists) {
        if (w[appid]?.name) {
          name = w[appid].name;
          break;
        }
      }
      return { appid, name };
    });

    // Calculate "Buy for Friend" (You own, they wishlist)
    const wishlistMatches = {}; // steamid -> games they want that OTHERS own
    validIds.forEach((targetId, targetIdx) => {
      const targetWishlist = wishlistSets[targetIdx];
      const othersMapsUnion = new Set();
      maps.forEach((m, idx) => {
        if (idx !== targetIdx) {
          for (const k of m.keys()) othersMapsUnion.add(k);
        }
      });
      // Correct logic: find games in targetWishlist that are in ANY of the otherMaps
      const matches = [];
      for (const appid of targetWishlist) {
        let owners = [];
        maps.forEach((m, idx) => {
          if (idx !== targetIdx && m.has(appid)) {
            owners.push(validIds[idx]);
          }
        });
        if (owners.length > 0) {
          // Metadata from the wishlist
          const name = wishlists[targetIdx][appid]?.name || String(appid);
          matches.push({ appid, name, owners });
        }
      }
      wishlistMatches[targetId] = matches;
    });

    // Build a map of tiers for the profiles
    const tierMap = {};
    if (tierCheck && tierCheck.rows) {
      tierCheck.rows.forEach(r => {
        tierMap[r.steam_id] = r.tier;
      });
    }

    return NextResponse.json({
      shared,
      unique,
      sharedWishlist,
      wishlistMatches,
      profiles: validIds.map((id, i) => ({
        steamid: id,
        username: usernames[i],
        avatar: avatars[i],
        tier: tierMap[id] || 'Noob'
      })),
      isPremium
    });
  } catch (err) {
    console.error("[API /compare Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
