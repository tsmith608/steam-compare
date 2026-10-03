// Bot-only: does any member of this server hold an active Hacker plan?
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { botAuthError, isSnowflake, jsonError, readJson } from "@/lib/http";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const denied = botAuthError(req);
  if (denied) return denied;

  const { discordIds } = await readJson(req, 512 * 1024);
  if (!Array.isArray(discordIds)) return jsonError("Missing or invalid discordIds array");
  const ids = discordIds.filter(isSnowflake).slice(0, 5000);
  if (!ids.length) return NextResponse.json({ hasHacker: false });

  try {
    const res = await query(
      `SELECT COUNT(*)::int AS count FROM users
        WHERE discord_id = ANY($1) AND LOWER(tier) IN ('hacker', 'gold')
          AND (expires_at IS NULL OR expires_at > NOW())`,
      [ids]
    );
    return NextResponse.json({ hasHacker: res.rows[0].count > 0 });
  } catch (err) {
    await logServerError("api/discord/server-hacker-check", err);
    return jsonError("Internal Server Error", 500);
  }
}
