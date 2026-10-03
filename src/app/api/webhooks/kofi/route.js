// Ko-fi webhook (legacy payments). Requires KOFI_WEBHOOK_VERIFICATION_TOKEN:
// without it anyone could POST a fake payment and grant themselves Premium.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { normalizeTier } from "@/lib/plans";
import { alertOwner, logServerError } from "@/lib/ops";
import { grantKofiPremium } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const token = process.env.KOFI_WEBHOOK_VERIFICATION_TOKEN;
  if (!token) {
    await alertOwner("kofi-config", "Ko-fi webhook rejected: KOFI_WEBHOOK_VERIFICATION_TOKEN is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let data;
  try {
    const form = await request.formData();
    data = JSON.parse(String(form.get("data") || "{}"));
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  if (data.verification_token !== token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["Donation", "Subscription", "Commission", "Shop Order"].includes(data.type)) {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    const transactionId = String(data.kofi_transaction_id || "").slice(0, 100);
    if (!transactionId) return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    const message = String(data.message || "").trim().slice(0, 500);
    const tier = normalizeTier(data.tier_name || "Pro");

    let steamId = message.match(/profiles\/(\d{17})/)?.[1] || message.match(/\b(\d{17})\b/)?.[1] || null;
    const shortCode = message.match(/WBP-([A-Z0-9]{3,10})/i)?.[1]?.toUpperCase() || null;
    if (!steamId && shortCode) {
      const pending = await query("DELETE FROM pending_upgrades WHERE short_code = $1 RETURNING steam_id", [shortCode]);
      steamId = pending.rows[0]?.steam_id || null;
    }
    if (!steamId && data.email) {
      const prev = await query(
        "SELECT steam_id FROM kofi_transactions WHERE supporter_email = $1 AND steam_id IS NOT NULL ORDER BY processed_at DESC LIMIT 1",
        [data.email]
      );
      steamId = prev.rows[0]?.steam_id || null;
    }

    await query(
      `INSERT INTO kofi_transactions (transaction_id, amount, currency, tier_name, message, supporter_name, supporter_email, steam_id, processed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (transaction_id) DO NOTHING`,
      [transactionId, parseFloat(data.amount) || 0, data.currency || null, tier, message, data.from_name || null, data.email || null, steamId]
    );

    if (steamId) await grantKofiPremium({ steamId, transactionId, tier });
    return NextResponse.json({ status: "success" });
  } catch (err) {
    await logServerError("kofi-webhook", err);
    await alertOwner("kofi-webhook", "Ko-fi webhook failed", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
