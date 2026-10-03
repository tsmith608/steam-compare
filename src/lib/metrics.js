// Business metrics from first-party events + Stripe. Used by the weekly owner
// report and the /admin funnel page. All queries are aggregate-only.
import { query } from "@/lib/db";
import { getStripe } from "@/lib/billing";

const FUNNEL = [
  ["landing_viewed", "Visited the homepage"],
  ["comparison_started", "Started a comparison"],
  ["comparison_succeeded", "Got results"],
  ["result_shared", "Shared or sent a vote"],
  ["checkout_started", "Started checkout"],
  ["checkout_succeeded", "Became Premium"],
];

async function countEvents(name, days, offsetDays = 0, distinct = false) {
  const res = await query(
    `SELECT ${distinct ? "COUNT(DISTINCT anon_id)" : "COUNT(*)"}::int AS n FROM events
      WHERE name = $1 AND ts >= NOW() - ($2 || ' days')::interval - ($3 || ' days')::interval
        AND ts < NOW() - ($3 || ' days')::interval`,
    [name, String(days), String(offsetDays)]
  );
  return res.rows[0].n;
}

/** Funnel step counts for the last `days` days. Visits are unique browsers. */
export async function funnel(days = 7, offsetDays = 0) {
  const steps = [];
  for (const [name, label] of FUNNEL) {
    const n = await countEvents(name, days, offsetDays, name === "landing_viewed");
    steps.push({ name, label, n });
  }
  return steps;
}

export async function topSources(days = 7, limit = 6) {
  const res = await query(
    `SELECT COALESCE(utm_source, ref_domain, 'direct') AS source, COUNT(DISTINCT anon_id)::int AS visitors
       FROM events WHERE name = 'landing_viewed' AND ts >= NOW() - ($1 || ' days')::interval
      GROUP BY 1 ORDER BY 2 DESC LIMIT $2`,
    [String(days), limit]
  );
  return res.rows;
}

export async function featureUsage(days = 7) {
  const res = await query(
    `SELECT name, COUNT(*)::int AS n FROM events
      WHERE ts >= NOW() - ($1 || ' days')::interval
        AND name IN ('roulette_spun','poll_created','poll_voted','result_shared','filter_used','group_saved','demo_viewed','deal_clicked','discord_cta_clicked','share_viewed')
      GROUP BY name ORDER BY n DESC`,
    [String(days)]
  );
  return res.rows;
}

export async function errorSummary(hours = 24 * 7) {
  const res = await query(
    `SELECT name, COALESCE(props->>'source', props->>'page', 'unknown') AS source, COUNT(*)::int AS n
       FROM events WHERE name IN ('server_error','client_error') AND ts >= NOW() - ($1 || ' hours')::interval
      GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 8`,
    [String(hours)]
  );
  return res.rows;
}

export async function compareFailures(days = 7) {
  const res = await query(
    `SELECT COALESCE(props->>'code','unknown') AS code, COUNT(*)::int AS n FROM events
      WHERE name = 'comparison_failed' AND ts >= NOW() - ($1 || ' days')::interval GROUP BY 1 ORDER BY 2 DESC`,
    [String(days)]
  );
  return res.rows;
}

export async function billingEvents(days = 7) {
  const out = {};
  for (const name of ["checkout_succeeded", "subscription_canceled", "payment_failed"]) out[name] = await countEvents(name, days);
  return out;
}

export async function newAccounts(days = 7) {
  const res = await query("SELECT COUNT(*)::int AS n FROM users WHERE created_at >= NOW() - ($1 || ' days')::interval", [String(days)]);
  return res.rows[0].n;
}

/** Monthly recurring revenue from Stripe (active + trialing + past_due). */
export async function stripeMrr() {
  const stripe = getStripe();
  if (!stripe) return null;
  let cents = 0;
  let active = 0;
  let pastDue = 0;
  for (const status of ["active", "trialing", "past_due"]) {
    for await (const sub of stripe.subscriptions.list({ status, limit: 100, expand: ["data.items.data.price"] })) {
      if (status === "past_due") pastDue++;
      else active++;
      for (const item of sub.items.data) {
        const p = item.price;
        if (!p?.unit_amount || !p.recurring) continue;
        const perMonth = p.recurring.interval === "year" ? p.unit_amount / 12 : p.recurring.interval === "week" ? p.unit_amount * 4.33 : p.unit_amount;
        cents += (perMonth * (item.quantity || 1)) / (p.recurring.interval_count || 1);
      }
    }
  }
  return { mrr: Math.round(cents) / 100, active, pastDue };
}

export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export function change(now, before) {
  if (!before) return now ? "new" : "—";
  const d = Math.round(((now - before) / before) * 100);
  return `${d > 0 ? "+" : ""}${d}%`;
}
