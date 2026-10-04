// Filters and sorts for the results grid. Pure functions over the compare
// response (`shared` games) plus store metadata (`meta[appid]`).

const MULTI = ["Multi-player", "Co-op", "Online Co-op", "Shared/Split Screen Co-op", "Shared/Split Screen", "LAN Co-op", "PvP", "Online PvP", "Shared/Split Screen PvP", "LAN PvP", "MMO", "Cross-Platform Multiplayer", "Remote Play Together"];
const COOP = ["Co-op", "Online Co-op", "Shared/Split Screen Co-op", "LAN Co-op"];
const COUCH = ["Shared/Split Screen Co-op", "Shared/Split Screen", "Shared/Split Screen PvP", "Remote Play Together"];
const PVP = ["PvP", "Online PvP", "Shared/Split Screen PvP", "LAN PvP"];

const has = (m, list) => !!m?.categories?.some((c) => list.includes(c));

/** True when store data says the game has no multiplayer at all. Unknown => false. */
export function isSinglePlayerOnly(m) {
  if (!m || !Array.isArray(m.categories) || m.categories.length === 0) return false;
  return !has(m, MULTI);
}

export const FILTERS = [
  { key: "coop", label: "Co-op", needsMeta: true, test: (g, m) => has(m, COOP) },
  { key: "online", label: "Online co-op", needsMeta: true, test: (g, m) => has(m, ["Online Co-op"]) },
  { key: "couch", label: "Couch / Remote Play", needsMeta: true, test: (g, m) => has(m, COUCH) },
  { key: "pvp", label: "PvP", needsMeta: true, test: (g, m) => has(m, PVP) },
  { key: "controller", label: "Controller", needsMeta: true, test: (g, m) => has(m, ["Full controller support"]) || m?.controller === "full" },
  { key: "free", label: "Free to play", needsMeta: true, test: (g, m) => !!m?.is_free },
  { key: "unplayed", label: "Nobody's played", needsMeta: false, test: (g) => g.totalMinutes === 0 },
  { key: "lately", label: "Played lately", needsMeta: false, test: (g) => g.recentBy > 0 },
];

const FILTER_MAP = Object.fromEntries(FILTERS.map((f) => [f.key, f]));

export const SORTS = [
  { key: "best", label: "Best for tonight" },
  { key: "together", label: "Most played together" },
  { key: "least", label: "Least played" },
  { key: "recent", label: "Recently played" },
  { key: "az", label: "A–Z" },
];

/** Heuristic "what fits tonight": recent group activity > everyone has played > total hours. */
export function tonightScore(g, players) {
  const n = Math.max(1, players);
  return g.recentBy * 4 + (g.playedBy / n) * 2.5 + Math.log10(1 + g.totalMinutes / 60);
}

const fold = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * @param {Array} games shared games
 * @param {{query?:string, filters?:string[], sort?:string, meta?:object, players?:number, hideSingle?:boolean}} opts
 * @returns {{games:Array, hiddenSingle:number}}
 */
export function applyView(games, { query = "", filters = [], sort = "best", meta = {}, players = 2, hideSingle = true } = {}) {
  const q = fold(query.trim());
  let hiddenSingle = 0;
  const out = [];
  for (const g of games) {
    const m = meta[g.appid];
    if (hideSingle && isSinglePlayerOnly(m)) {
      hiddenSingle++;
      continue;
    }
    if (q && !fold(g.name).includes(q)) continue;
    if (filters.some((k) => FILTER_MAP[k] && !FILTER_MAP[k].test(g, m))) continue;
    out.push(g);
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  const sorters = {
    best: (a, b) => tonightScore(b, players) - tonightScore(a, players) || byName(a, b),
    together: (a, b) => b.totalMinutes - a.totalMinutes || byName(a, b),
    least: (a, b) => a.totalMinutes - b.totalMinutes || byName(a, b),
    recent: (a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0) || byName(a, b),
    az: byName,
  };
  out.sort(sorters[sort] || sorters.best);
  return { games: out, hiddenSingle };
}

/** Counts per filter for the chips (on the current non-filtered pool). */
export function filterCounts(games, meta) {
  const counts = {};
  for (const f of FILTERS) counts[f.key] = 0;
  for (const g of games) {
    const m = meta[g.appid];
    if (isSinglePlayerOnly(m)) continue;
    for (const f of FILTERS) if (f.test(g, m)) counts[f.key]++;
  }
  return counts;
}

/** Short tag list for a card. */
export function gameTags(m) {
  if (!m) return [];
  const tags = [];
  if (has(m, ["Online Co-op"])) tags.push("Online co-op");
  else if (has(m, COOP)) tags.push("Co-op");
  if (has(m, ["Shared/Split Screen Co-op", "Shared/Split Screen"])) tags.push("Couch");
  if (has(m, PVP)) tags.push("PvP");
  if (has(m, ["Remote Play Together"])) tags.push("Remote Play");
  if (m.is_free) tags.push("Free");
  return tags.slice(0, 3);
}

export const supportsRemotePlay = (m) => has(m, ["Remote Play Together"]);

export function formatPrice(p) {
  if (!p || typeof p.final !== "number") return null;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency || "USD" }).format(p.final / 100);
  } catch {
    return `$${(p.final / 100).toFixed(2)}`;
  }
}
