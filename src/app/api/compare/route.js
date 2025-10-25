// app/api/compare/route.js
import { NextResponse } from "next/server";

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

// Fetch display names for provided IDs (preserve positional order)
async function fetchUsernames(idsInOrder) {
  const steamids = idsInOrder.filter(Boolean);
  if (steamids.length === 0) return idsInOrder.map(() => null);

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamids.join(
      ","
    )}`
  );
  const data = await res.json();
  const players = data?.response?.players || [];
  const nameById = new Map(players.map((p) => [String(p.steamid), p.personaname]));
  return idsInOrder.map((id) => (id ? nameById.get(String(id)) || id : null));
}

/* -------------------------------- Route -------------------------------- */

export async function POST(req) {
  try {
    const { user1, user2, user3, user4 } = await req.json();

    // Resolve in fixed order (you, friend1, friend2, friend3)
    const [id1, id2, id3, id4] = await Promise.all([
      resolveSteamID(user1),
      resolveSteamID(user2),
      resolveSteamID(user3),
      resolveSteamID(user4),
    ]);

    const presentIDs = [id1, id2, id3, id4].filter(Boolean);
    if (presentIDs.length < 2) {
      return NextResponse.json(
        { error: "At least two valid Steam profiles are required." },
        { status: 400 }
      );
    }

    // Get usernames (personaname) aligned to [id1..id4]
    const usernames = await fetchUsernames([id1, id2, id3, id4]);

    // Fetch libraries in the same order
    const [games1, games2, games3, games4] = await Promise.all([
      fetchLibrary(id1),
      id2 ? fetchLibrary(id2) : Promise.resolve([]),
      id3 ? fetchLibrary(id3) : Promise.resolve([]),
      id4 ? fetchLibrary(id4) : Promise.resolve([]),
    ]);

    // Maps for quick lookups
    const m1 = toMap(games1);
    const m2 = toMap(games2);
    const m3 = toMap(games3);
    const m4 = toMap(games4);

    // Active libs for "shared" (only users actually entered)
    const activeMaps = [
      { id: id1, map: m1 },
      id2 ? { id: id2, map: m2 } : null,
      id3 ? { id: id3, map: m3 } : null,
      id4 ? { id: id4, map: m4 } : null,
    ].filter(Boolean);

    // ---------------------- Shared: everyone owns -----------------------
    const appidSets = activeMaps.map(({ map }) => new Set(map.keys()));
    let sharedSet = appidSets[0];
    for (let i = 1; i < appidSets.length; i++) {
      sharedSet = intersectSets(sharedSet, appidSets[i]);
    }

    const shared = Array.from(sharedSet).map((appid) => {
      const g1 = m1.get(appid);
      const name =
        g1?.name ||
        m2.get(appid)?.name ||
        m3.get(appid)?.name ||
        m4.get(appid)?.name ||
        String(appid);
      return {
        appid,
        name,
        user1_playtime: m1.get(appid)?.playtime_forever || 0,
        user2_playtime: m2.get(appid)?.playtime_forever || 0,
        user3_playtime: m3.get(appid)?.playtime_forever || 0,
        user4_playtime: m4.get(appid)?.playtime_forever || 0,
      };
    });

    // ---------------------- Only You: unique to you ---------------------
    const othersUnion = new Set([...m2.keys(), ...m3.keys(), ...m4.keys()]);
    const onlyYou = Array.from(m1.values())
      .filter((g) => !othersUnion.has(Number(g.appid)))
      .map((g) => ({
        appid: g.appid,
        name: g.name,
        playtime_forever: g.playtime_forever || 0,
      }));

    // Helper: friend owns and NO ONE ELSE (including you) owns
    function onlyFriend(friendMap, otherMaps) {
      const others = new Set();
      for (const om of otherMaps) for (const k of om.keys()) others.add(k);
      const res = [];
      for (const [appid, g] of friendMap.entries()) {
        if (!others.has(appid)) {
          res.push({
            appid,
            name: g.name,
            playtime_forever: g.playtime_forever || 0,
          });
        }
      }
      return res;
    }

    // ---------------------- Only Friend 1/2/3 ---------------------------
    const onlyFriend1 = id2 ? onlyFriend(m2, [m1, m3, m4]) : [];
    const onlyFriend2 = id3 ? onlyFriend(m3, [m1, m2, m4]) : [];
    const onlyFriend3 = id4 ? onlyFriend(m4, [m1, m2, m3]) : [];

    console.log(
      `[Shared:${shared.length}] [OnlyYou:${onlyYou.length}] [F1:${onlyFriend1.length}] [F2:${onlyFriend2.length}] [F3:${onlyFriend3.length}]`
    );

    return NextResponse.json({
      shared,
      onlyYou,
      onlyFriend1,
      onlyFriend2,
      onlyFriend3,
      usernames, // [you, friend1, friend2, friend3] (null where not provided)
    });
  } catch (err) {
    console.error("[API /compare Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
