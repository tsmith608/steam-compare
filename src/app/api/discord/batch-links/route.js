// Bot-only: map Discord user ids to linked Steam ids.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { botAuthError, isSnowflake, jsonError, readJson } from "@/lib/http";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const denied = botAuthError(req);
  if (denied) return denied;

  const { discordIds } = await readJson(req, 256 * 1024);
  if (!Array.isArray(discordIds)) return jsonError("Missing or invalid discordIds array");
  const ids = discordIds.filter(isSnowflake).slice(0, 1000);
  if (!ids.length) return NextResponse.json({ links: [] });

  try {
    const res = await query("SELECT discord_id, steam_id FROM users WHERE discord_id = ANY($1)", [ids]);
    return NextResponse.json({ links: res.rows.map((r) => ({ discordId: r.discord_id, steamId: r.steam_id })) });
  } catch (err) {
    await logServerError("api/discord/batch-links", err);
    return jsonError("Internal Server Error", 500);
  }
}
