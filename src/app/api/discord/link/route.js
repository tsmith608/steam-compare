// GET  (bot):     link status + plan for a Discord user.
// POST (website): link the signed-in Steam account to a Discord user.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { botAuthError, isSnowflake, jsonError, limitOrNull, readJson, unauthorized } from "@/lib/http";
import { effectiveTier, isPaidTier } from "@/lib/plans";
import { recordEvent } from "@/lib/analytics";
import { logServerError } from "@/lib/ops";
import { verifyLinkSignature } from "@/lib/discord-link";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = botAuthError(req);
  if (denied) return denied;

  const discordId = new URL(req.url).searchParams.get("discord_id");
  if (!isSnowflake(discordId)) return jsonError("Missing discord_id");

  try {
    const res = await query("SELECT steam_id, tier, expires_at FROM users WHERE discord_id = $1", [discordId]);
    if (!res.rows.length) return NextResponse.json({ found: false }, { status: 404 });
    const tier = effectiveTier(res.rows[0]);
    return NextResponse.json({ found: true, steamId: res.rows[0].steam_id, tier, isPremium: isPaidTier(tier) });
  } catch (err) {
    await logServerError("api/discord/link GET", err);
    return jsonError("Internal Server Error", 500);
  }
}

export async function POST(req) {
  const steamId = await getSessionSteamId();
  if (!steamId) return unauthorized("Sign in with Steam to link your account.");
  const limited = limitOrNull(req, "discord-link", { limit: 10, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const { discordId, exp, sig } = await readJson(req);
  if (!isSnowflake(discordId)) return jsonError("This link is missing a Discord account. Run /link in Discord again.");
  if (!verifyLinkSignature(discordId, exp, sig, process.env.DISCORD_LINK_SECRET)) {
    return jsonError("This link has expired. Run /link in Discord to get a fresh one.", 400);
  }

  try {
    await query("UPDATE users SET discord_id = NULL WHERE discord_id = $1 AND steam_id <> $2", [discordId, steamId]);
    await query(
      `INSERT INTO users (steam_id, discord_id, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (steam_id) DO UPDATE SET discord_id = EXCLUDED.discord_id, updated_at = NOW()`,
      [steamId, discordId]
    );
    await recordEvent("discord_linked", {});
    return NextResponse.json({ success: true });
  } catch (err) {
    await logServerError("api/discord/link POST", err);
    return jsonError("Internal Server Error", 500);
  }
}
