// Plan status for a profile page (accepts a SteamID64 or custom URL name).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { resolveSteamId } from "@/lib/steam";
import { effectiveTier, isPaidTier } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const input = new URL(req.url).searchParams.get("steamid");
  if (!input) return jsonError("Missing steamid");
  try {
    const steamid = await resolveSteamId(input);
    const res = await query("SELECT created_at, tier, expires_at FROM users WHERE steam_id = $1", [steamid]);
    if (!res.rows.length) return NextResponse.json({ isPremium: false, tier: "Noob" });
    const tier = effectiveTier(res.rows[0]);
    return NextResponse.json({ isPremium: isPaidTier(tier), tier, addedAt: res.rows[0].created_at, expiresAt: res.rows[0].expires_at });
  } catch {
    return NextResponse.json({ isPremium: false, tier: "Noob" });
  }
}
