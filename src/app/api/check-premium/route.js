// Plan status for a Steam account (shown as badges; not sensitive).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isSteamId64 } from "@/lib/http";
import { effectiveTier, isPaidTier } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const steamid = new URL(req.url).searchParams.get("steamid");
  if (!isSteamId64(steamid)) return NextResponse.json({ isPremium: false, tier: "Noob" });
  try {
    const res = await query("SELECT tier, expires_at FROM users WHERE steam_id = $1", [steamid]);
    const tier = effectiveTier(res.rows[0]);
    return NextResponse.json({ isPremium: isPaidTier(tier), tier });
  } catch {
    return NextResponse.json({ isPremium: false, tier: "Noob" });
  }
}
