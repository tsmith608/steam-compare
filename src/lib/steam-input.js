// Steam profile input parsing, shared by the browser (instant validation) and
// the server (resolution). Pure: no network, no database.

/**
 * Accepts SteamID64s, profile URLs, custom (vanity) URLs and bare custom names.
 * @returns {{kind:"id",steamid:string}|{kind:"vanity",vanity:string}|null}
 */
export function parseSteamInput(raw) {
  if (raw === null || raw === undefined) return null;
  const input = String(raw).trim();
  if (!input || input.length > 200) return null;

  if (/^\d{17}$/.test(input)) return { kind: "id", steamid: input };

  const profile = input.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profile) return { kind: "id", steamid: profile[1] };

  const vanityUrl = input.match(/steamcommunity\.com\/id\/([A-Za-z0-9_-]{2,32})(?:[/?#]|$)/i);
  if (vanityUrl) return { kind: "vanity", vanity: vanityUrl[1] };

  if (/^[A-Za-z0-9_-]{2,32}$/.test(input)) return { kind: "vanity", vanity: input };
  return null;
}

/** Splits a pasted blob (several URLs/IDs separated by spaces, commas or lines). */
export function splitPastedProfiles(text) {
  return String(text || "")
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => parseSteamInput(s));
}

/** Short, human label for an input value (used in chips and errors). */
export function displayInput(raw) {
  const p = parseSteamInput(raw);
  if (!p) return String(raw || "").slice(0, 32);
  return p.kind === "id" ? p.steamid : p.vanity;
}
