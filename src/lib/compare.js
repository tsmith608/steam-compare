// Pure comparison engine: no I/O, so it is easy to test and reuse (API,
// share cards, Discord bot, social templates).

/** Games with at most this many minutes for everyone count as "unplayed". */
export const BACKLOG_MAX_MINUTES = 120;

const minutesOf = (g) => Number(g?.playtime_forever) || 0;

/**
 * @typedef {{appid:number, name:string, playtime_forever?:number, playtime_2weeks?:number, rtime_last_played?:number}} OwnedGame
 * @typedef {{steamid:string, games:OwnedGame[], recent?:OwnedGame[], wishlist?:number[]}} PlayerLibrary
 */

/**
 * Builds per-player maps of appid -> game. Recently played titles that are not
 * in the owned list (Family Sharing, free weekends) are merged in so they can
 * still count as shared.
 */
function buildMaps(players) {
  return players.map((p) => {
    const map = new Map();
    for (const g of p.games || []) {
      const appid = Number(g.appid);
      if (!appid || map.has(appid)) continue;
      map.set(appid, { ...g, appid });
    }
    for (const g of p.recent || []) {
      const appid = Number(g.appid);
      if (!appid) continue;
      const existing = map.get(appid);
      if (existing) {
        existing.playtime_2weeks = g.playtime_2weeks || existing.playtime_2weeks || 0;
      } else {
        map.set(appid, { ...g, appid, playtime_forever: g.playtime_forever || 0, borrowed: true });
      }
    }
    return map;
  });
}

function nameFor(appid, maps) {
  for (const m of maps) {
    const n = m.get(appid)?.name;
    if (n) return n;
  }
  return null;
}

// Deterministic pick so the same group always gets the same "fun fact".
function stablePick(list, seed) {
  if (!list.length) return null;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return list[Math.abs(h) % list.length];
}

/**
 * @param {PlayerLibrary[]} players public libraries, in display order (>= 2)
 */
export function computeComparison(players, { backlogMaxMinutes = BACKLOG_MAX_MINUTES } = {}) {
  const ids = players.map((p) => String(p.steamid));
  const maps = buildMaps(players);
  const n = players.length;

  // ---- ownership counts across the union --------------------------------
  const owners = new Map(); // appid -> [playerIndex]
  maps.forEach((m, idx) => {
    for (const appid of m.keys()) {
      if (!owners.has(appid)) owners.set(appid, []);
      owners.get(appid).push(idx);
    }
  });

  // ---- shared (everyone) ------------------------------------------------
  const shared = [];
  for (const [appid, who] of owners) {
    if (who.length !== n) continue;
    const playtimes = {};
    let totalMinutes = 0;
    let playedBy = 0;
    let recentMinutes = 0;
    let recentBy = 0;
    let rtime = 0;
    maps.forEach((m, idx) => {
      const g = m.get(appid);
      const mins = minutesOf(g);
      playtimes[ids[idx]] = mins;
      totalMinutes += mins;
      if (mins > 0) playedBy += 1;
      const recent = Number(g?.playtime_2weeks) || 0;
      recentMinutes += recent;
      if (recent > 0) recentBy += 1;
      if ((g?.rtime_last_played || 0) > rtime) rtime = g.rtime_last_played;
    });
    shared.push({
      appid,
      name: nameFor(appid, maps) || `App ${appid}`,
      playtimes,
      totalMinutes,
      playedBy,
      recentMinutes,
      recentBy,
      rtime_last_played: rtime || undefined,
      playtime_2weeks: Number(maps[0].get(appid)?.playtime_2weeks) || 0,
    });
  }
  shared.sort((a, b) => b.totalMinutes - a.totalMinutes || a.name.localeCompare(b.name));

  // ---- unique (only one person) -----------------------------------------
  const unique = {};
  ids.forEach((id) => (unique[id] = []));
  for (const [appid, who] of owners) {
    if (who.length !== 1) continue;
    const idx = who[0];
    const g = maps[idx].get(appid);
    unique[ids[idx]].push({ appid, name: g.name || `App ${appid}`, playtime_forever: minutesOf(g) });
  }
  for (const id of ids) unique[id].sort((a, b) => b.playtime_forever - a.playtime_forever || a.name.localeCompare(b.name));

  // ---- near misses (everyone but one), 3+ players ------------------------
  const nearMisses = [];
  if (n >= 3) {
    for (const [appid, who] of owners) {
      if (who.length !== n - 1) continue;
      const missingIdx = ids.findIndex((_, i) => !who.includes(i));
      let ownersMinutes = 0;
      for (const i of who) ownersMinutes += minutesOf(maps[i].get(appid));
      nearMisses.push({
        appid,
        name: nameFor(appid, maps) || `App ${appid}`,
        owners: who.map((i) => ids[i]),
        missing: [ids[missingIdx]],
        ownersMinutes,
      });
    }
    nearMisses.sort((a, b) => b.ownersMinutes - a.ownersMinutes || a.name.localeCompare(b.name));
  }

  // ---- backlog: everyone owns it, nobody really played it ---------------
  const backlog = shared
    .filter((g) => Object.values(g.playtimes).every((m) => m <= backlogMaxMinutes))
    .map((g) => ({ appid: g.appid, name: g.name, maxMinutes: Math.max(...Object.values(g.playtimes)) }))
    .sort((a, b) => a.maxMinutes - b.maxMinutes || a.name.localeCompare(b.name));

  // ---- hot right now: recent playtime across the group ------------------
  const hotMap = new Map();
  players.forEach((p, idx) => {
    for (const g of p.recent || []) {
      const appid = Number(g.appid);
      const mins = Number(g.playtime_2weeks) || 0;
      if (!appid || mins <= 0) continue;
      if (!hotMap.has(appid)) hotMap.set(appid, { appid, name: g.name || nameFor(appid, maps) || `App ${appid}`, players: [], totalRecentMinutes: 0 });
      const e = hotMap.get(appid);
      e.players.push({ steamid: ids[idx], minutes: mins });
      e.totalRecentMinutes += mins;
    }
  });
  const hot = [...hotMap.values()]
    .sort((a, b) => b.players.length - a.players.length || b.totalRecentMinutes - a.totalRecentMinutes)
    .slice(0, 8);

  // ---- wishlists ----------------------------------------------------------
  const wishSets = players.map((p) => new Set((p.wishlist || []).map(Number)));
  let sharedWish = wishSets[0] ? new Set(wishSets[0]) : new Set();
  for (let i = 1; i < wishSets.length; i++) sharedWish = new Set([...sharedWish].filter((a) => wishSets[i].has(a)));
  const sharedWishlist = [...sharedWish].map((appid) => ({ appid, name: nameFor(appid, maps) }));

  const wishlistMatches = {};
  ids.forEach((id, idx) => {
    wishlistMatches[id] = [];
    for (const appid of wishSets[idx]) {
      const ownedBy = ids.filter((_, j) => j !== idx && maps[j].has(appid));
      if (ownedBy.length) wishlistMatches[id].push({ appid, name: nameFor(appid, maps) || `App ${appid}`, owners: ownedBy });
    }
  });

  // ---- headline stats ----------------------------------------------------
  const libraryCounts = {};
  ids.forEach((id, idx) => (libraryCounts[id] = maps[idx].size));
  const smallest = Math.min(...Object.values(libraryCounts));
  const everyonePlayed = shared.filter((g) => g.playedBy === n);
  const mostPlayed = (everyonePlayed[0] || shared[0]) ?? null;
  const unplayed = shared.filter((g) => g.totalMinutes === 0);
  const forgotten = stablePick(unplayed, ids.join(","));

  let carry = null;
  for (const g of shared) {
    const entries = Object.entries(g.playtimes);
    const [topId, topMin] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const others = entries.filter(([id]) => id !== topId).reduce((s, [, m]) => s + m, 0);
    if (topMin >= 20 * 60 && others <= 2 * 60 * (n - 1) && (!carry || topMin > carry.minutes)) {
      carry = { appid: g.appid, name: g.name, steamid: topId, minutes: topMin, othersMinutes: others };
    }
  }

  const stats = {
    players: n,
    libraryCounts,
    unionCount: owners.size,
    sharedCount: shared.length,
    overlapPct: smallest > 0 ? Math.round((shared.length / smallest) * 100) : 0,
    combinedSharedMinutes: shared.reduce((s, g) => s + g.totalMinutes, 0),
    unplayedSharedCount: unplayed.length,
    backlogCount: backlog.length,
    nearMissCount: nearMisses.length,
    mostPlayedTogether: mostPlayed ? { appid: mostPlayed.appid, name: mostPlayed.name, minutes: mostPlayed.totalMinutes } : null,
    forgotten: forgotten ? { appid: forgotten.appid, name: forgotten.name } : null,
    carry,
  };

  return { shared, unique, nearMisses, backlog, hot, sharedWishlist, wishlistMatches, stats };
}

/** "1,240" style formatting for share cards and headlines. */
export const formatCount = (n) => Number(n || 0).toLocaleString("en-US");
export const minutesToHours = (m) => Math.round((Number(m) || 0) / 60);
