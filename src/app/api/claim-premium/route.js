// Links a Ko-fi payment to the signed-in Steam account (legacy Ko-fi flow).
// A transaction can be claimed once, and only onto the caller's own account.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, limitOrNull, readJson, unauthorized } from "@/lib/http";
import { normalizeTier } from "@/lib/plans";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const steamid = await getSessionSteamId();
  if (!steamid) return unauthorized("Sign in with Steam first, then claim your Ko-fi payment.");
  const limited = limitOrNull(req, "claim", { limit: 10, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const { transactionId } = await readJson(req);
  if (typeof transactionId !== "string" || !transactionId.trim() || transactionId.length > 100) {
    return jsonError("Enter the Ko-fi transaction ID from your receipt.");
  }

  try {
    // Atomically claim: only succeeds if nobody (else) has claimed it yet.
    const claim = await query(
      `UPDATE kofi_transactions
          SET steam_id = $1, claimed_at = NOW()
        WHERE transaction_id = $2
          AND claimed_at IS NULL
          AND (steam_id IS NULL OR steam_id = $1)
        RETURNING tier_name, processed_at`,
      [steamid, transactionId.trim()]
    );
    if (!claim.rowCount) {
      return jsonError("That transaction wasn't found or has already been claimed. Contact support if this looks wrong.", 404);
    }

    const tier = normalizeTier(claim.rows[0].tier_name || "Pro");
    await query(
      `INSERT INTO users (steam_id, transaction_id, purchased_at, source, tier, expires_at)
       VALUES ($1, $2, NOW(), 'kofi', $3, COALESCE($4::timestamptz, NOW()) + INTERVAL '32 days')
       ON CONFLICT (steam_id) DO UPDATE SET
         transaction_id = EXCLUDED.transaction_id,
         purchased_at = EXCLUDED.purchased_at,
         source = EXCLUDED.source,
         tier = EXCLUDED.tier,
         expires_at = GREATEST(COALESCE(users.expires_at, NOW()), EXCLUDED.expires_at)`,
      [steamid, transactionId.trim(), tier, claim.rows[0].processed_at]
    );
    return NextResponse.json({ success: true, tier });
  } catch (err) {
    await logServerError("api/claim-premium", err);
    return jsonError("Internal Server Error", 500);
  }
}
