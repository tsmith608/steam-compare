// Daily: verify Steam + DB, flag anomalies, enforce data retention.
// Only pings the owner when something needs attention.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cronAuthorized } from "@/lib/cron";
import { alertOwner } from "@/lib/ops";
import { getPlayerSummaries, clearSteamCache, isMockMode } from "@/lib/steam";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// A long-standing public profile used purely to check the API key works.
const PROBE_STEAM_ID = "76561197960287930";

export async function GET(req) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const problems = [];
  const report = {};

  try {
    await query("SELECT 1");
    report.database = "ok";
  } catch (err) {
    problems.push(`Database unreachable: ${err.message}`);
  }

  if (!isMockMode()) {
    try {
      clearSteamCache();
      const s = await getPlayerSummaries([PROBE_STEAM_ID]);
      report.steam = s.size ? "ok" : "empty";
      if (!s.size) problems.push("Steam API returned no data for the probe profile — the API key may be revoked or rate limited.");
    } catch (err) {
      problems.push(`Steam API check failed: ${err.message}`);
    }
  }

  try {
    const q = await query(`
      SELECT
        COUNT(*) FILTER (WHERE name = 'comparison_succeeded' AND ts >= NOW() - INTERVAL '1 day')::int AS ok_1d,
        COUNT(*) FILTER (WHERE name = 'comparison_failed' AND ts >= NOW() - INTERVAL '1 day' AND props->>'code' IN ('steam_unavailable','steam_rate_limited','config','internal'))::int AS fail_1d,
        COUNT(*) FILTER (WHERE name = 'comparison_succeeded' AND ts >= NOW() - INTERVAL '8 days' AND ts < NOW() - INTERVAL '1 day')::int AS ok_7d,
        COUNT(*) FILTER (WHERE name = 'server_error' AND ts >= NOW() - INTERVAL '1 day')::int AS errors_1d
      FROM events`);
    const r = q.rows[0];
    report.metrics = r;
    const dailyAvg = r.ok_7d / 7;
    if (dailyAvg >= 10 && r.ok_1d < dailyAvg * 0.4) problems.push(`Comparisons fell to ${r.ok_1d} in 24h (7-day average ${dailyAvg.toFixed(0)}/day). Something may be broken.`);
    if (r.fail_1d >= 10 && r.fail_1d > r.ok_1d * 0.25) problems.push(`${r.fail_1d} comparisons failed because of Steam/server problems in 24h.`);
    if (r.errors_1d >= 25) problems.push(`${r.errors_1d} server errors in 24h — check Vercel logs.`);
  } catch {
    // events table missing: nothing to evaluate yet
  }

  // Retention (matches the privacy policy).
  try {
    const del = await query("DELETE FROM events WHERE ts < NOW() - INTERVAL '400 days'");
    await query("DELETE FROM stripe_events WHERE received_at < NOW() - INTERVAL '90 days' AND status = 'done'");
    await query("DELETE FROM pending_upgrades WHERE created_at < NOW() - INTERVAL '60 days'");
    report.retention = { eventsDeleted: del.rowCount };
  } catch {}

  try {
    await query("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    await query(
      "INSERT INTO app_settings (key, value) VALUES ('last_daily_cron', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [String(Date.now())]
    );
  } catch {}

  if (problems.length) await alertOwner("daily-check", "Daily check found problems", problems.map((p) => `• ${p}`).join("\n"), { force: true });
  return NextResponse.json({ ok: problems.length === 0, problems, report });
}
