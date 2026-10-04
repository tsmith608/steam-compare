// Operational plumbing: structured error logging and owner alerts.
//
// Alerts go to a Discord webhook (OWNER_ALERT_WEBHOOK_URL) because that is
// where the owner already lives. Every alert is throttled per key so a bad
// hour produces one ping, not hundreds.
import { query } from "@/lib/db";

const lastAlertAt = new Map();
const ALERT_THROTTLE_MS = 30 * 60 * 1000;

/**
 * Sends a short message to the owner's alert channel. Never throws.
 * @param {string} key   throttling key, e.g. "stripe-webhook"
 * @param {string} title one-line summary
 * @param {string} [detail]
 */
export async function alertOwner(key, title, detail = "", { force = false } = {}) {
  const url = process.env.OWNER_ALERT_WEBHOOK_URL;
  const now = Date.now();
  if (!force && now - (lastAlertAt.get(key) || 0) < ALERT_THROTTLE_MS) return false;
  lastAlertAt.set(key, now);

  console.error(`[alert:${key}] ${title} ${detail}`);
  if (!url) return false;

  try {
    const content = `**WeBothPlay alert — ${title}**${detail ? `\n${String(detail).slice(0, 1500)}` : ""}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(5000),
    });
    return true;
  } catch (err) {
    console.error("[alert] webhook delivery failed:", err.message);
    return false;
  }
}

/** Posts an informational message (reports) to the owner channel. */
export async function notifyOwner(content) {
  const url = process.env.OWNER_REPORT_WEBHOOK_URL || process.env.OWNER_ALERT_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 1990), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (err) {
    console.error("[notify] webhook delivery failed:", err.message);
    return false;
  }
}

/**
 * Records a server-side error in the events table (no personal data) so the
 * weekly report and health check can see error rates. Never throws.
 */
export async function logServerError(source, err, props = {}) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${source}]`, err);
  try {
    await query(
      "INSERT INTO events (name, props) VALUES ('server_error', $1)",
      [JSON.stringify({ source, message: message.slice(0, 300), ...props })]
    );
  } catch {
    // The events table may not exist yet on an un-migrated database.
  }
}
