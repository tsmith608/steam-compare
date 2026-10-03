// Single source of truth for plan names and limits. The site, the API and the
// pricing page all read from here so they can't drift apart again.

export const TIERS = ["Noob", "Pro", "Hacker"];

export const PLAN_LIMITS = {
  Noob: { maxPlayers: 4, savedGroups: 1 },
  Pro: { maxPlayers: 8, savedGroups: 25 },
  Hacker: { maxPlayers: 12, savedGroups: 100 },
};

export const HARD_MAX_PLAYERS = 12;

const RANK = { Noob: 0, Pro: 1, Hacker: 2 };

/**
 * Maps whatever is stored in users.tier (including legacy Ko-fi tier names
 * such as "Bronze" or "Supporter") onto the plans the product actually has.
 */
export function normalizeTier(raw) {
  if (!raw) return "Noob";
  const t = String(raw).trim().toLowerCase();
  if (t === "hacker" || t === "gold") return "Hacker";
  if (t === "noob" || t === "free" || t === "none") return "Noob";
  return "Pro"; // any other paid tier name counts as Pro
}

/** Effective tier for a users row, honouring expiry. */
export function effectiveTier(row, now = new Date()) {
  if (!row) return "Noob";
  const tier = normalizeTier(row.tier);
  if (tier === "Noob") return "Noob";
  if (row.expires_at && new Date(row.expires_at) <= now) return "Noob";
  return tier;
}

export const isPaidTier = (tier) => tier === "Pro" || tier === "Hacker";

export function highestTier(tiers) {
  return tiers.reduce((best, t) => (RANK[t] > RANK[best] ? t : best), "Noob");
}

export function maxPlayersFor(tier) {
  return (PLAN_LIMITS[tier] || PLAN_LIMITS.Noob).maxPlayers;
}
