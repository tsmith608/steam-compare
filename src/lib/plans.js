// Single source of truth for plan names and limits. The site, the API and the
// pricing page all read from here so they can't drift apart again.

export const TIERS = ["Noob", "Pro", "Hacker"];

// Free covers the whole core job (Steam's own client compares up to 8 people,
// so free must too). Premium sells bigger groups and convenience.
export const PLAN_LIMITS = {
  Noob: { maxPlayers: 8, savedGroups: 3 },
  Pro: { maxPlayers: 12, savedGroups: 50 },
  Hacker: { maxPlayers: 16, savedGroups: 200 },
};

export const HARD_MAX_PLAYERS = 16;

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

// Display prices (USD). They must match the Stripe Prices referenced by the
// STRIPE_PRICE_ID_* env vars; annual prices only show when configured.
export const PRICING = {
  Pro: { month: 3.99, year: 29.99 },
  Hacker: { month: 9.99, year: 79.99 },
};

export const PLAN_FEATURES = {
  Noob: [
    `Compare up to ${PLAN_LIMITS.Noob.maxPlayers} players`,
    "Every filter, sort and search",
    "Roulette, group votes and share cards",
    "One-copy-away and shared backlog",
    `${PLAN_LIMITS.Noob.savedGroups} saved groups`,
    "Discord bot: /compare, /link, /help",
  ],
  Pro: [
    `Compare up to ${PLAN_LIMITS.Pro.maxPlayers} players`,
    `${PLAN_LIMITS.Pro.savedGroups} saved groups, synced to your Steam login`,
    "Premium bot commands: /roulette, /backlog, /stats, /compatibility, /flex, /hype, /leaderboard",
    "Voice-channel comparisons in Discord",
    "Profile customization and a Pro badge",
    "Keeps WeBothPlay independent",
  ],
  Hacker: [
    "Everything in Pro",
    `Compare up to ${PLAN_LIMITS.Hacker.maxPlayers} players`,
    "Server perk: premium bot commands for everyone in servers you're in",
    `${PLAN_LIMITS.Hacker.savedGroups} saved groups`,
    "Hacker badge",
  ],
};
