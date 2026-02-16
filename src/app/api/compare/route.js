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

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${encodeURIComponent(
      vanity
    )}`
  );
  const data = await res.json();
  if (data?.response?.success === 1 && data.response.steamid) {
    return data.response.steamid;
  }
  throw new Error(`Could not resolve Steam vanity name: ${input}`);
}

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
  return j.response.games || [];
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
async function fetchProfiles(idsInOrder) {
  const steamids = idsInOrder.filter(Boolean);
  if (steamids.length === 0) {
    return {
      usernames: idsInOrder.map(() => null),
      avatars: idsInOrder.map(() => null),
      ids: idsInOrder.map(() => null),
    };
  }

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamids.join(
      ","
    )}`
  );
  const data = await res.json();
  const players = data?.response?.players || [];
  const byId = new Map(players.map((p) => [String(p.steamid), p]));

  const usernames = idsInOrder.map((id) =>
    id ? byId.get(String(id))?.personaname || id : null
  );
  const avatars = idsInOrder.map((id) =>
    id ? byId.get(String(id))?.avatarfull || byId.get(String(id))?.avatar || null : null
  );

  return { usernames, avatars, ids: idsInOrder };
}

/* -------------------------------- Route -------------------------------- */

export async function POST(req) {
  try {
    const body = await req.json();

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

    // Check Premium Status
    // We check if ANY of the involved users are premium.
    // Ideally, the "owner" of the session is the first user, but checking all is friendlier.
    let isPremium = false;
    if (validIds.length > 0) {
      // Construct a safe parameterized query for "IN" clause
      const placeholders = validIds.map((_, i) => `$${i + 1}`).join(",");
      const premiumCheck = await query(
        `SELECT 1 FROM premium_users WHERE steam_id IN (${placeholders}) LIMIT 1`,
        validIds
      );
      if (premiumCheck.rowCount > 0) {
        isPremium = true;
      }
    }

    // Limit Check
    if (!isPremium && validIds.length > 4) {
      return NextResponse.json(
        { error: "Free plan is limited to 4 users. One of you needs Premium for up to 12!" },
        { status: 403 }
      );
    }

    // Hard limit even for premium to prevent abuse/timeouts
    if (validIds.length > 12) {
      return NextResponse.json(
        { error: "Even Grand Party Mode is limited to 12 users for performance." },
        { status: 400 }
      );
    }

    // Fetch Profiles
    const { usernames, avatars, ids } = await fetchProfiles(validIds);

    // Fetch Libraries
    const libraries = await Promise.all(validIds.map(id => fetchLibrary(id)));

    // Create maps
    const maps = libraries.map(lib => toMap(lib));

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

    return NextResponse.json({
      shared,
      unique,
      profiles: validIds.map((id, i) => ({
        steamid: id,
        username: usernames[i],
        avatar: avatars[i]
      })),
      isPremium
    });
  } catch (err) {
    console.error("[API /compare Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

