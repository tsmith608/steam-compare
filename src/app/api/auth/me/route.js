// Who am I? Returns the signed-in user (from the session cookie) or null.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { effectiveTier, isPaidTier, maxPlayersFor } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  const steamid = await getSessionSteamId();
  if (!steamid) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });

  let row = null;
  try {
    const res = await query(
      `SELECT steam_id, persona_name, avatar_url, vanity_id, tier, expires_at, stripe_customer_id,
              subscription_id, billing_status, cancel_at_period_end, discord_id
         FROM users WHERE steam_id = $1`,
      [steamid]
    );
    row = res.rows[0] || null;
  } catch {
    // Database unavailable: the session is still valid, just sparse.
  }

  const tier = effectiveTier(row);
  return NextResponse.json(
    {
      user: {
        steamid,
        name: row?.persona_name || "Steam user",
        avatar: row?.avatar_url || null,
        vanity: row?.vanity_id || null,
        tier,
        isPremium: isPaidTier(tier),
        maxPlayers: maxPlayersFor(tier),
        expiresAt: row?.expires_at || null,
        hasBilling: !!row?.stripe_customer_id,
        billingStatus: row?.billing_status || null,
        cancelAtPeriodEnd: !!row?.cancel_at_period_end,
        discordLinked: !!row?.discord_id,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
