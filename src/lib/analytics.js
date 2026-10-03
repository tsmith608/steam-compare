// First-party product analytics (server side).
//
// The funnel lives in our own Postgres so the owner can answer "where do
// people drop out?" with one query, and so the weekly report needs no
// third-party API. Events carry no personal data: no IPs, Steam IDs, emails or
// display names; props are limited to small enums and counts.
import { query } from "@/lib/db";

/** The complete event taxonomy. Anything else is dropped. */
export const EVENT_NAMES = new Set([
  "landing_viewed",
  "compare_cta_clicked",
  "profile_entered",
  "comparison_started",
  "comparison_succeeded",
  "comparison_failed",
  "demo_viewed",
  "filter_used",
  "sort_used",
  "search_used",
  "game_opened",
  "roulette_spun",
  "shortlist_created",
  "poll_created",
  "poll_voted",
  "result_shared",
  "share_viewed",
  "group_saved",
  "account_signed_in",
  "premium_viewed",
  "checkout_started",
  "checkout_succeeded",
  "subscription_canceled",
  "payment_failed",
  "discord_cta_clicked",
  "discord_linked",
  "deal_clicked",
  "client_error",
  "server_error",
]);

/** Events only the server may record (business metrics can't be spoofed). */
export const SERVER_ONLY_EVENTS = new Set([
  "comparison_succeeded",
  "account_signed_in",
  "checkout_succeeded",
  "subscription_canceled",
  "payment_failed",
  "discord_linked",
  "server_error",
]);

/** Keeps props tiny and non-identifying. */
export function sanitizeProps(props) {
  const out = {};
  if (!props || typeof props !== "object") return out;
  let n = 0;
  for (const [k, v] of Object.entries(props)) {
    if (n >= 12 || !/^[a-z_]{1,32}$/.test(k)) continue;
    if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(v * 100) / 100;
    else if (typeof v === "boolean") out[k] = v;
    else if (typeof v === "string") {
      // Long digit runs could be Steam IDs; never store them.
      if (/\d{8,}/.test(v)) continue;
      out[k] = v.slice(0, 80);
    } else continue;
    n++;
  }
  return out;
}

export function refDomain(referrer) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host.slice(0, 80) || null;
  } catch {
    return null;
  }
}

const clean = (s, max = 80) => (typeof s === "string" && s ? s.replace(/[^\w\-.:/ ]/g, "").slice(0, max) : null);

/**
 * Inserts one event. Never throws (analytics must not break the product).
 * @param {string} name
 * @param {object} props
 * @param {{anonId?:string, path?:string, referrer?:string, utm?:{source?:string, medium?:string, campaign?:string}}} ctx
 */
export async function recordEvent(name, props = {}, ctx = {}) {
  if (!EVENT_NAMES.has(name)) return false;
  try {
    const path = typeof ctx.path === "string" ? ctx.path.split("?")[0].replace(/\d{8,}/g, ":id").slice(0, 120) : null;
    await query(
      `INSERT INTO events (name, anon_id, path, ref_domain, utm_source, utm_medium, utm_campaign, props)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        name,
        typeof ctx.anonId === "string" && /^[a-z0-9-]{8,40}$/i.test(ctx.anonId) ? ctx.anonId : null,
        path,
        refDomain(ctx.referrer),
        clean(ctx.utm?.source),
        clean(ctx.utm?.medium),
        clean(ctx.utm?.campaign),
        JSON.stringify(sanitizeProps(props)),
      ]
    );
    return true;
  } catch {
    return false;
  }
}
