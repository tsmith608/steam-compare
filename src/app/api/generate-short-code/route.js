// Legacy Ko-fi flow: a short code the buyer pastes into their Ko-fi message so
// the webhook can match the payment to their Steam account.
import crypto from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, unauthorized } from "@/lib/http";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET() {
  const steamId = await getSessionSteamId();
  if (!steamId) return unauthorized();
  try {
    const existing = await query("SELECT short_code FROM pending_upgrades WHERE steam_id = $1 LIMIT 1", [steamId]);
    if (existing.rows.length) return NextResponse.json({ shortCode: `WBP-${existing.rows[0].short_code}` });
    const shortCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    await query("INSERT INTO pending_upgrades (short_code, steam_id, created_at) VALUES ($1, $2, NOW())", [shortCode, steamId]);
    return NextResponse.json({ shortCode: `WBP-${shortCode}` });
  } catch (err) {
    await logServerError("api/generate-short-code", err);
    return jsonError("Internal Server Error", 500);
  }
}
