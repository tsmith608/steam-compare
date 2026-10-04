// Recently compared groups, remembered in this browser only (no account).
const KEY = "wbp.recentGroups.v1";
const MAX = 6;

export function loadRecentGroups() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((g) => Array.isArray(g.ids) && g.ids.length >= 2) : [];
  } catch {
    return [];
  }
}

export function rememberGroup(profiles) {
  try {
    const ids = profiles.map((p) => p.steamid);
    const key = [...ids].sort().join(",");
    const entry = { ids, names: profiles.map((p) => p.username), ts: Date.now() };
    const rest = loadRecentGroups().filter((g) => [...g.ids].sort().join(",") !== key);
    localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX)));
  } catch {}
}

export function forgetGroup(ids) {
  try {
    const key = [...ids].sort().join(",");
    localStorage.setItem(KEY, JSON.stringify(loadRecentGroups().filter((g) => [...g.ids].sort().join(",") !== key)));
  } catch {}
}

export function groupLabel(names) {
  if (!names?.length) return "Group";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}
