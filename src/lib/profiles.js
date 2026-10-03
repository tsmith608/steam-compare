// Which /<id> paths are real profile pages (everything else is a 404).
import { query } from "@/lib/db";
import { DEMO_PROFILES } from "@/lib/steam-fixtures";
import { isDemoId } from "@/lib/steam";

// Individual-account SteamID64s start here (universe 1, type 1).
const FIRST_INDIVIDUAL = 76561197960265728n;
const LAST_INDIVIDUAL = 76561202255233023n;

export function isIndividualSteamId(id) {
  if (!/^\d{17}$/.test(id)) return false;
  const n = BigInt(id);
  return n >= FIRST_INDIVIDUAL && n <= LAST_INDIVIDUAL;
}

/**
 * A SteamID64 is always a valid page (the profile itself says if it's private).
 * A custom URL name is a page only for WeBothPlay members we know — unknown
 * names 404 without a Steam API call, so path scanners can't spend the quota.
 * @returns {Promise<boolean>}
 */
export async function profilePathExists(id) {
  if (typeof id !== "string") return false;
  if (/^\d+$/.test(id)) return isIndividualSteamId(id) || isDemoId(id);
  if (!/^[A-Za-z0-9_-]{2,32}$/.test(id)) return false;
  const lower = id.toLowerCase();
  if (Object.values(DEMO_PROFILES).some((p) => p.vanity === lower)) return true;
  try {
    const res = await query("SELECT 1 FROM users WHERE LOWER(vanity_id) = $1 LIMIT 1", [lower]);
    return res.rowCount > 0;
  } catch {
    // If the database is down, show the page rather than a false 404.
    return true;
  }
}
