// Steam Web API client.
//
// Every outbound Steam call goes through here so timeouts, retries, caching
// and the demo/mock data live in one place. The API key is only ever placed in
// the request URL and is never logged or echoed back in errors.
import { query } from "@/lib/db";
import * as fx from "@/lib/steam-fixtures";
import { parseSteamInput } from "@/lib/steam-input";

const API = "https://api.steampowered.com";
const STORE = "https://store.steampowered.com";

// A fictional private profile used to exercise the private-library path.
export const DEMO_PRIVATE_ID = "76561190000000005";

export class SteamError extends Error {
  /**
   * @param {"invalid_input"|"not_found"|"private"|"upstream"|"rate_limited"|"config"} code
   */
  constructor(code, message, meta = {}) {
    super(message);
    this.name = "SteamError";
    this.code = code;
    this.meta = meta;
  }
}

export const isMockMode = () => process.env.STEAM_MOCK === "1";
export const isDemoId = (id) => fx.DEMO_STEAM_IDS.includes(String(id)) || String(id) === DEMO_PRIVATE_ID;
const fromFixtures = (id) => isMockMode() || isDemoId(id);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------- tiny TTL cache ----------------------------- */

const cache = new Map();
const CACHE_LIMIT = 2000;

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function cacheSet(key, value, ttlMs) {
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

export function clearSteamCache() {
  cache.clear();
}

/* --------------------------------- fetch ---------------------------------- */

async function steamGet(base, path, params = {}, { timeoutMs = 8000, retries = 1, withKey = true } = {}) {
  const url = new URL(base + path);
  if (withKey) {
    const key = process.env.STEAM_API_KEY;
    if (!key) throw new SteamError("config", "The Steam API key is not configured.");
    url.searchParams.set("key", key);
  }
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Accept: "application/json" },
      });
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        await sleep(350 * (attempt + 1));
        continue;
      }
      if (res.status === 429) throw new SteamError("rate_limited", "Steam is rate limiting us right now.");
      if (res.status >= 500) throw new SteamError("upstream", `Steam returned ${res.status}.`);
      let data = null;
      if (res.ok) data = await res.json().catch(() => null);
      return { status: res.status, data };
    } catch (err) {
      if (err instanceof SteamError) throw err;
      if (attempt < retries) {
        await sleep(350 * (attempt + 1));
        continue;
      }
      throw new SteamError("upstream", "Couldn't reach Steam. Try again in a moment.", { cause: err.name });
    }
  }
}

/* ------------------------------ input parsing ----------------------------- */

export { parseSteamInput };

/** Resolves any supported input to a SteamID64 or throws a SteamError. */
export async function resolveSteamId(raw) {
  const parsed = parseSteamInput(raw);
  if (!parsed) throw new SteamError("invalid_input", `"${String(raw).slice(0, 40)}" doesn't look like a Steam profile.`, { input: raw });
  if (parsed.kind === "id") return parsed.steamid;

  const vanity = parsed.vanity.toLowerCase();
  const demo = Object.entries(fx.DEMO_PROFILES).find(([, p]) => p.vanity === vanity);
  if (demo) return demo[0];
  if (isMockMode()) throw new SteamError("not_found", `We couldn't find a Steam profile called "${parsed.vanity}".`, { input: raw });

  const cacheKey = `vanity:${vanity}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  // Only the exact custom-URL match is trusted. Display names are not unique,
  // so resolving by persona name would silently compare the wrong person.
  try {
    const db = await query("SELECT steam_id FROM users WHERE LOWER(vanity_id) = $1 LIMIT 1", [vanity]);
    if (db.rows[0]?.steam_id && /^\d{17}$/.test(db.rows[0].steam_id)) {
      cacheSet(cacheKey, db.rows[0].steam_id, 6 * 3600_000);
      return db.rows[0].steam_id;
    }
  } catch {
    // Database hiccups shouldn't block resolution; fall through to Steam.
  }

  const { data } = await steamGet(API, "/ISteamUser/ResolveVanityURL/v1/", { vanityurl: parsed.vanity });
  const steamid = data?.response?.success === 1 ? data.response.steamid : null;
  if (!steamid) throw new SteamError("not_found", `We couldn't find a Steam profile called "${parsed.vanity}".`, { input: raw });
  cacheSet(cacheKey, steamid, 6 * 3600_000);
  return steamid;
}

/* -------------------------------- profiles -------------------------------- */

/**
 * @returns {Promise<Map<string, {steamid:string, personaname:string, avatar:string|null, profileurl:string|null, visibility:number|null}>>}
 */
export async function getPlayerSummaries(ids) {
  const out = new Map();
  const wanted = [...new Set(ids.map(String))];
  const toFetch = [];

  for (const id of wanted) {
    if (fromFixtures(id)) {
      const p = fx.DEMO_PROFILES[id] || (id === DEMO_PRIVATE_ID ? { personaname: "Demo · Private" } : null);
      if (p) out.set(id, { steamid: id, personaname: p.personaname, avatar: p.avatar || null, profileurl: null, visibility: id === DEMO_PRIVATE_ID ? 1 : 3 });
      continue;
    }
    const cached = cacheGet(`summary:${id}`);
    if (cached) out.set(id, cached);
    else toFetch.push(id);
  }

  for (let i = 0; i < toFetch.length; i += 100) {
    const chunk = toFetch.slice(i, i + 100);
    const { data } = await steamGet(API, "/ISteamUser/GetPlayerSummaries/v2/", { steamids: chunk.join(",") });
    for (const p of data?.response?.players || []) {
      const summary = {
        steamid: p.steamid,
        personaname: p.personaname || p.steamid,
        avatar: p.avatarfull || p.avatarmedium || null,
        profileurl: p.profileurl || null,
        visibility: p.communityvisibilitystate ?? null,
      };
      cacheSet(`summary:${p.steamid}`, summary, 3600_000);
      out.set(p.steamid, summary);
    }
  }
  return out;
}

/* -------------------------------- libraries ------------------------------- */

// Non-games and test servers that clutter "shared games".
export const JUNK_APP_IDS = new Set([431960, 622590, 1040460, 654310]);

export function isJunkGame(g) {
  if (JUNK_APP_IDS.has(Number(g.appid))) return true;
  const name = g.name || "";
  if (/Public Test|Test Server|\bPTS\b/i.test(name)) return true;
  if (name.includes("Rainbow Six Siege") && /Test|TTS/.test(name)) return true;
  return false;
}

/**
 * @returns {Promise<{games: Array, isPrivate: boolean}>}
 */
export async function getOwnedGames(steamid) {
  const id = String(steamid);
  if (fromFixtures(id)) {
    if (id === DEMO_PRIVATE_ID) return { games: [], isPrivate: true };
    const games = fx.fixtureLibrary(id);
    if (!games) throw new SteamError("not_found", "That Steam profile doesn't exist.");
    return { games, isPrivate: false };
  }

  const cached = cacheGet(`owned:${id}`);
  if (cached) return cached;

  const { status, data } = await steamGet(API, "/IPlayerService/GetOwnedGames/v1/", {
    steamid: id,
    include_appinfo: 1,
    include_played_free_games: 1,
    format: "json",
  });
  // Private "Game details" comes back as an empty response object.
  const response = data?.response;
  const isPrivate = status === 401 || status === 403 || !response || (response.games === undefined && response.game_count === undefined);
  const result = {
    games: (response?.games || []).filter((g) => !isJunkGame(g)),
    isPrivate,
  };
  cacheSet(`owned:${id}`, result, 10 * 60_000);
  return result;
}

export async function getRecentGames(steamid) {
  const id = String(steamid);
  if (fromFixtures(id)) return fx.fixtureRecent(id);
  const cached = cacheGet(`recent:${id}`);
  if (cached) return cached;
  try {
    const { data } = await steamGet(API, "/IPlayerService/GetRecentlyPlayedGames/v1/", { steamid: id, count: 20, format: "json" }, { retries: 0 });
    const games = (data?.response?.games || []).filter((g) => !isJunkGame(g));
    cacheSet(`recent:${id}`, games, 10 * 60_000);
    return games;
  } catch {
    return [];
  }
}

/** Wishlisted app IDs, or [] when private/unavailable. Never throws. */
export async function getWishlistAppIds(steamid) {
  const id = String(steamid);
  if (fromFixtures(id)) return fx.fixtureWishlist(id).map((w) => w.appid);
  const cached = cacheGet(`wishlist:${id}`);
  if (cached) return cached;
  try {
    const { data } = await steamGet(API, "/IWishlistService/GetWishlist/v1/", { steamid: id }, { retries: 0, timeoutMs: 6000 });
    const ids = (data?.response?.items || []).map((i) => Number(i.appid)).filter(Boolean);
    cacheSet(`wishlist:${id}`, ids, 30 * 60_000);
    return ids;
  } catch {
    return [];
  }
}

/** Friend SteamIDs, or null when the friends list is private. */
export async function getFriendIds(steamid) {
  const id = String(steamid);
  if (fromFixtures(id)) return fx.fixtureFriends(id);
  const { status, data } = await steamGet(API, "/ISteamUser/GetFriendList/v1/", { steamid: id, relationship: "friend" });
  if (status === 401 || status === 403 || !data?.friendslist) return null;
  return data.friendslist.friends.map((f) => f.steamid);
}

/* ------------------------------- app details ------------------------------ */

/** Keeps only the fields the UI uses, so the cache stays small. */
export function normalizeAppDetails(appid, d) {
  if (!d) return null;
  return {
    appid: Number(appid),
    type: d.type || "game",
    name: d.name || null,
    is_free: !!d.is_free,
    genres: (d.genres || []).map((g) => g.description).filter(Boolean),
    categories: (d.categories || []).map((c) => c.description).filter(Boolean),
    controller: d.controller_support || null,
    platforms: d.platforms || null,
    price: d.price_overview
      ? { final: d.price_overview.final, initial: d.price_overview.initial, discount: d.price_overview.discount_percent, currency: d.price_overview.currency }
      : null,
    release: d.release_date?.date || null,
    metacritic: d.metacritic?.score || null,
  };
}

async function fetchAppDetailsFromStore(appid) {
  if (fromFixtures(appid) || isMockMode()) return normalizeAppDetails(appid, fx.fixtureAppDetails(appid));
  const { data } = await steamGet(
    STORE,
    "/api/appdetails",
    { appids: appid, cc: "us", l: "english" },
    { withKey: false, retries: 1, timeoutMs: 6000 }
  );
  const entry = data?.[appid];
  if (!entry?.success) return { appid: Number(appid), type: "unknown", name: null, genres: [], categories: [] };
  return normalizeAppDetails(appid, entry.data);
}

const APP_META_TTL_DAYS = 14;

/**
 * Store metadata for many apps. Serves from the app_meta table first and
 * fetches at most `fetchBudget` missing apps from the Steam store per call
 * (the store endpoint is aggressively rate limited). Callers re-request the
 * remaining IDs reported in `pending`.
 */
export async function getAppMeta(appids, { fetchBudget = 30, concurrency = 4 } = {}) {
  const ids = [...new Set(appids.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 400);
  const meta = {};

  if (isMockMode()) {
    for (const id of ids) {
      const m = normalizeAppDetails(id, fx.fixtureAppDetails(id));
      if (m) meta[id] = m;
    }
    return { meta, pending: [] };
  }

  try {
    const res = await query(
      `SELECT appid, data FROM app_meta WHERE appid = ANY($1::int[]) AND fetched_at > NOW() - INTERVAL '${APP_META_TTL_DAYS} days'`,
      [ids]
    );
    for (const row of res.rows) meta[row.appid] = row.data;
  } catch {
    // Table missing or DB down: fall back to live fetches within budget.
  }

  const missing = ids.filter((id) => !meta[id]);
  const toFetch = missing.slice(0, fetchBudget);
  let rateLimited = false;

  for (let i = 0; i < toFetch.length && !rateLimited; i += concurrency) {
    const batch = toFetch.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (id) => {
        try {
          const m = await fetchAppDetailsFromStore(id);
          if (!m) return;
          meta[id] = m;
          await query(
            `INSERT INTO app_meta (appid, data, fetched_at) VALUES ($1, $2, NOW())
             ON CONFLICT (appid) DO UPDATE SET data = EXCLUDED.data, fetched_at = NOW()`,
            [id, JSON.stringify(m)]
          ).catch(() => {});
        } catch (err) {
          if (err.code === "rate_limited") rateLimited = true;
        }
      })
    );
  }

  return { meta, pending: missing.filter((id) => !meta[id]) };
}
