// Public health check for uptime monitors. Booleans only — no secrets.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: false,
    steamKeyConfigured: !!process.env.STEAM_API_KEY,
    paymentsConfigured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    sessionSecretConfigured: (process.env.SESSION_SECRET || "").length >= 32,
    dailyCronFresh: null,
  };
  try {
    await Promise.race([query("SELECT 1"), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000))]);
    checks.database = true;
    const last = await query("SELECT value FROM app_settings WHERE key = 'last_daily_cron'").catch(() => ({ rows: [] }));
    if (last.rows[0]) checks.dailyCronFresh = Date.now() - Number(last.rows[0].value) < 36 * 3600_000;
  } catch {}
  const ok = checks.database && checks.steamKeyConfigured;
  return NextResponse.json({ ok, checks, time: new Date().toISOString() }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
