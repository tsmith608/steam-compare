// Orchestrates a comparison: resolve inputs, enforce plan limits, fetch
// libraries, then hand off to the pure engine. Shared by /api/compare, share
// pages, poll pages and Open Graph images.
import { query } from "@/lib/db";
import { computeComparison } from "@/lib/compare";
import {
  SteamError,
  getAppMeta,
  getOwnedGames,
  getPlayerSummaries,
  getRecentGames,
  getWishlistAppIds,
  isDemoId,
  resolveSteamId,
} from "@/lib/steam";
import { DEMO_STEAM_IDS } from "@/lib/steam-fixtures";
import { HARD_MAX_PLAYERS, effectiveTier, highestTier, isPaidTier, maxPlayersFor, normalizeTier } from "@/lib/plans";

export { DEMO_STEAM_IDS };

const fail = (status, code, error, extra = {}) => ({ ok: false, status, code, error, ...extra });

async function tiersFor(ids) {
  const map = {};
  if (!ids.length) return map;
  try {
    const res = await query("SELECT steam_id, tier, expires_at FROM users WHERE steam_id = ANY($1)", [ids]);
    for (const row of res.rows) map[row.steam_id] = effectiveTier(row);
  } catch {
    // No database: everyone is on the free plan.
  }
  return map;
}

/**
 * @param {string[]} rawInputs Steam IDs, profile URLs or custom URL names
 * @param {{viewerSteamId?: string|null}} opts
 */
export async function runComparison(rawInputs, { viewerSteamId = null } = {}) {
  const inputs = (Array.isArray(rawInputs) ? rawInputs : [])
    .map((u) => (typeof u === "string" || typeof u === "number" ? String(u).trim() : ""))
    .filter(Boolean)
    .slice(0, HARD_MAX_PLAYERS + 4);

  if (inputs.length < 2) return fail(400, "need_two", "Add at least two Steam profiles to compare.");

  // 1. Resolve every input, reporting problems per field.
  const settled = await Promise.allSettled(inputs.map((u) => resolveSteamId(u)));
  const fieldErrors = [];
  const ids = [];
  settled.forEach((r, index) => {
    if (r.status === "fulfilled") {
      if (!ids.includes(r.value)) ids.push(r.value);
      return;
    }
    const err = r.reason;
    if (err instanceof SteamError && (err.code === "invalid_input" || err.code === "not_found")) {
      fieldErrors.push({ index, input: inputs[index], code: err.code, message: err.message });
    } else {
      fieldErrors.push({ index, input: inputs[index], code: "upstream", message: err?.message || "Couldn't look that profile up." });
    }
  });
  if (fieldErrors.some((e) => e.code === "upstream") && !fieldErrors.some((e) => e.code !== "upstream")) {
    return fail(502, "steam_unavailable", "Steam isn't responding right now. Give it a minute and try again.", { fieldErrors });
  }
  if (fieldErrors.length) return fail(400, "bad_profiles", "We couldn't find some of those profiles.", { fieldErrors });
  if (ids.length < 2) return fail(400, "duplicates", "Those all point to the same Steam profile — add a friend.");

  // 2. Plan limits: the best plan among the viewer and the group applies.
  const isDemo = ids.every((id) => isDemoId(id));
  const tierMap = await tiersFor([...new Set([...ids, ...(viewerSteamId ? [viewerSteamId] : [])])]);
  const groupTier = highestTier(Object.values(tierMap).map(normalizeTier));
  const maxPlayers = Math.min(HARD_MAX_PLAYERS, maxPlayersFor(groupTier));
  if (ids.length > maxPlayers && !isDemo) {
    return fail(403, "plan_limit", `Free comparisons cover up to ${maxPlayers} players. Premium compares bigger groups.`, {
      maxPlayers,
      tier: groupTier,
    });
  }

  // 3. Fetch everything in parallel.
  let summaries;
  let libraries;
  try {
    [summaries, libraries] = await Promise.all([
      getPlayerSummaries(ids),
      Promise.all(
        ids.map(async (id) => {
          const owned = await getOwnedGames(id);
          if (owned.isPrivate) return { steamid: id, isPrivate: true, games: [], recent: [], wishlist: [] };
          const [recent, wishlist] = await Promise.all([getRecentGames(id), getWishlistAppIds(id)]);
          return { steamid: id, isPrivate: false, games: owned.games, recent, wishlist };
        })
      ),
    ]);
  } catch (err) {
    if (err instanceof SteamError && err.code === "rate_limited") {
      return fail(503, "steam_rate_limited", "Steam is busy right now. Try again in a minute.");
    }
    if (err instanceof SteamError && err.code === "config") return fail(500, "config", "Comparisons are temporarily unavailable.");
    if (err instanceof SteamError && err.code === "not_found") return fail(400, "bad_profiles", err.message);
    return fail(502, "steam_unavailable", "Steam isn't responding right now. Give it a minute and try again.");
  }

  const profiles = ids.map((id, i) => {
    const s = summaries.get(id);
    const lib = libraries[i];
    return {
      steamid: id,
      username: s?.personaname || `Player ${i + 1}`,
      avatar: s?.avatar || null,
      profileUrl: s?.profileurl || `https://steamcommunity.com/profiles/${id}`,
      tier: tierMap[id] || "Noob",
      isPrivate: lib.isPrivate,
      gameCount: lib.games.length,
      demo: isDemoId(id),
    };
  });
  const blocked = profiles.filter((p) => p.isPrivate).map((p) => ({ steamid: p.steamid, username: p.username, reason: "private" }));
  const publicLibs = libraries.filter((l) => !l.isPrivate);

  if (publicLibs.length < 2) {
    return fail(422, "private_profiles", "Not enough public libraries to compare yet.", { blocked, profiles });
  }

  // 4. Compare.
  const result = computeComparison(publicLibs);

  // Names for wishlist games nobody owns come from store metadata.
  const unnamed = result.sharedWishlist.filter((g) => !g.name).map((g) => g.appid);
  if (unnamed.length) {
    try {
      const { meta } = await getAppMeta(unnamed, { fetchBudget: 8 });
      result.sharedWishlist = result.sharedWishlist
        .map((g) => ({ ...g, name: g.name || meta[g.appid]?.name || null }))
        .filter((g) => g.name);
    } catch {
      result.sharedWishlist = result.sharedWishlist.filter((g) => g.name);
    }
  }

  return {
    ok: true,
    data: {
      ...result,
      profiles,
      blocked,
      demo: isDemo,
      limits: { maxPlayers, tier: groupTier },
      isPremium: isPaidTier(groupTier),
    },
  };
}
