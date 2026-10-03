// Saved friend groups for the signed-in user (count limited by plan).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { isSteamId64, jsonError, limitOrNull, readJson, unauthorized } from "@/lib/http";
import { PLAN_LIMITS, effectiveTier } from "@/lib/plans";
import { recordEvent } from "@/lib/analytics";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await getSessionSteamId();
  if (!owner) return NextResponse.json({ groups: [] });
  try {
    const res = await query(
      "SELECT id, name, steam_ids FROM saved_groups WHERE owner_steam_id = $1 ORDER BY last_used_at DESC LIMIT 200",
      [owner]
    );
    return NextResponse.json({ groups: res.rows.map((r) => ({ id: String(r.id), name: r.name, ids: r.steam_ids })) });
  } catch (err) {
    await logServerError("api/groups GET", err);
    return NextResponse.json({ groups: [] });
  }
}

export async function POST(req) {
  const owner = await getSessionSteamId();
  if (!owner) return unauthorized("Sign in through Steam to save groups.");
  const limited = limitOrNull(req, "groups", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { name, steamIds } = await readJson(req);
  const ids = [...new Set((Array.isArray(steamIds) ? steamIds : []).map(String).filter(isSteamId64))].slice(0, 16);
  const label = typeof name === "string" ? name.trim().slice(0, 40) : "";
  if (ids.length < 2) return jsonError("A group needs at least two people.");
  if (!label) return jsonError("Give the group a name.");

  try {
    const [userRes, countRes] = await Promise.all([
      query("SELECT tier, expires_at FROM users WHERE steam_id = $1", [owner]),
      query("SELECT COUNT(*)::int AS n FROM saved_groups WHERE owner_steam_id = $1", [owner]),
    ]);
    const tier = effectiveTier(userRes.rows[0]);
    const max = PLAN_LIMITS[tier].savedGroups;
    if (countRes.rows[0].n >= max) {
      return jsonError(tier === "Noob" ? `Free accounts can save ${max} groups. Premium saves up to ${PLAN_LIMITS.Pro.savedGroups}.` : "You've hit the saved-group limit.", 403, { code: "plan_limit" });
    }
    const res = await query(
      "INSERT INTO saved_groups (owner_steam_id, name, steam_ids) VALUES ($1, $2, $3) RETURNING id",
      [owner, label, ids]
    );
    await recordEvent("group_saved", { players: ids.length, tier });
    return NextResponse.json({ id: String(res.rows[0].id) });
  } catch (err) {
    await logServerError("api/groups POST", err);
    return jsonError("Couldn't save the group.", 500);
  }
}

export async function DELETE(req) {
  const owner = await getSessionSteamId();
  if (!owner) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!/^\d+$/.test(id || "")) return jsonError("Missing id");
  await query("DELETE FROM saved_groups WHERE id = $1 AND owner_steam_id = $2", [id, owner]).catch(() => {});
  return NextResponse.json({ ok: true });
}
