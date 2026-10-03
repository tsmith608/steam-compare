// Stripe billing helpers.
//
// Written for the API version pinned by stripe-node (2026-01-28.clover):
// - Subscription.current_period_end moved to subscription items (basil+).
// - Invoice.subscription moved to invoice.parent.subscription_details.subscription.
// Both helpers below also accept the old shapes so older webhook payloads work.
import Stripe from "stripe";
import { query } from "@/lib/db";
import { normalizeTier } from "@/lib/plans";

let stripeClient = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, timeout: 15000 });
  return stripeClient;
}

/** Unix seconds when the current paid period ends, or null. */
export function subscriptionPeriodEnd(sub) {
  if (!sub) return null;
  const fromItems = (sub.items?.data || []).map((i) => i.current_period_end).filter(Boolean);
  if (fromItems.length) return Math.max(...fromItems);
  return sub.current_period_end || null;
}

/** Subscription id an invoice belongs to, or null. */
export function invoiceSubscriptionId(invoice) {
  const s = invoice?.parent?.subscription_details?.subscription ?? invoice?.subscription ?? null;
  if (!s) return null;
  return typeof s === "string" ? s : s.id || null;
}

/** Plan prices from env. Annual prices are optional. */
export function priceTable() {
  const e = process.env;
  return {
    Pro: { month: e.STRIPE_PRICE_ID_PRO || null, year: e.STRIPE_PRICE_ID_PRO_ANNUAL || null },
    Hacker: { month: e.STRIPE_PRICE_ID_HACKER || null, year: e.STRIPE_PRICE_ID_HACKER_ANNUAL || null },
  };
}

export function priceFor(tier, interval = "month") {
  const t = priceTable()[tier];
  if (!t) return null;
  return t[interval] || null;
}

/**
 * Tier from the subscription's price (so plan switches made in the Customer
 * Portal are respected), falling back to metadata set at checkout.
 */
export function tierForSubscription(sub) {
  const table = priceTable();
  const priceIds = (sub?.items?.data || []).map((i) => i.price?.id).filter(Boolean);
  for (const [tier, prices] of Object.entries(table)) {
    if (priceIds.some((p) => p && (p === prices.month || p === prices.year))) return tier;
  }
  return normalizeTier(sub?.metadata?.tier || "Pro");
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
const GRACE_SECONDS = 2 * 24 * 3600; // keep access while renewal webhooks land

/**
 * Writes a subscription's current state onto the matching user.
 * @returns {Promise<string|null>} the Steam id updated
 */
export async function applySubscription(sub, { steamId: hintSteamId = null } = {}) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  let steamId = hintSteamId || sub.metadata?.steam_id || null;
  if (!steamId && customerId) {
    const res = await query("SELECT steam_id FROM users WHERE stripe_customer_id = $1 LIMIT 1", [customerId]);
    steamId = res.rows[0]?.steam_id || null;
  }
  if (!steamId) return null;

  const end = subscriptionPeriodEnd(sub);
  const active = ACTIVE_STATUSES.has(sub.status);
  const tier = active ? tierForSubscription(sub) : "Noob";
  const expiresAt = active && end ? new Date((end + GRACE_SECONDS) * 1000) : new Date();

  await query(
    `INSERT INTO users (steam_id, stripe_customer_id, subscription_id, source, tier, expires_at, billing_status, cancel_at_period_end, purchased_at, updated_at)
     VALUES ($1, $2, $3, 'stripe', $4, $5, $6, $7, NOW(), NOW())
     ON CONFLICT (steam_id) DO UPDATE SET
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       subscription_id = EXCLUDED.subscription_id,
       source = 'stripe',
       tier = EXCLUDED.tier,
       expires_at = EXCLUDED.expires_at,
       billing_status = EXCLUDED.billing_status,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at = NOW()`,
    [steamId, customerId, active ? sub.id : null, tier, expiresAt, sub.status, !!sub.cancel_at_period_end]
  );
  return steamId;
}
