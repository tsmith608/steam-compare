// Game collections. Anyone can read public collections; only the signed-in
// owner can see private ones or create, edit and delete.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, limitOrNull, readJson, unauthorized } from "@/lib/http";
import { resolveSteamId } from "@/lib/steam";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const input = new URL(req.url).searchParams.get("steamid");
  if (!input) return jsonError("Missing steamid");

  let owner;
  try {
    owner = await resolveSteamId(input);
  } catch {
    return NextResponse.json({ collections: [] });
  }

  try {
    const viewer = await getSessionSteamId();
    const res = await query(
      viewer === owner
        ? "SELECT * FROM user_collections WHERE owner_steam_id = $1 ORDER BY created_at DESC"
        : "SELECT * FROM user_collections WHERE owner_steam_id = $1 AND is_public = true ORDER BY created_at DESC",
      [owner]
    );
    return NextResponse.json({ collections: res.rows });
  } catch (err) {
    await logServerError("api/user/collections GET", err);
    return jsonError("Internal Server Error", 500);
  }
}

function normalizeGames(list) {
  return (Array.isArray(list) ? list : []).slice(0, 200).map((g) => {
    if (g && typeof g === "object") {
      return {
        appid: Number(g.appid) || 0,
        rating: typeof g.rating === "number" ? Math.max(0, Math.min(5, g.rating)) : 0,
        comment: typeof g.comment === "string" ? g.comment.slice(0, 500) : "",
      };
    }
    return { appid: Number(g) || 0, rating: 0, comment: "" };
  }).filter((g) => g.appid > 0);
}

export async function POST(req) {
  const owner = await getSessionSteamId();
  if (!owner) return unauthorized();
  const limited = limitOrNull(req, "collections-post", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { id, title, description, gameIds, isPublic } = await readJson(req, 128 * 1024);
  if (typeof title !== "string" || !title.trim()) return jsonError("Give the collection a title.");

  const values = [title.trim().slice(0, 80), String(description || "").slice(0, 1000), JSON.stringify(normalizeGames(gameIds)), isPublic ?? true];
  try {
    if (id) {
      const res = await query(
        `UPDATE user_collections SET title = $1, description = $2, game_ids = $3, is_public = $4
         WHERE id = $5 AND owner_steam_id = $6 RETURNING id`,
        [...values, id, owner]
      );
      if (!res.rowCount) return jsonError("Collection not found.", 404);
      return NextResponse.json({ success: true, id });
    }
    const count = await query("SELECT COUNT(*)::int AS n FROM user_collections WHERE owner_steam_id = $1", [owner]);
    if (count.rows[0].n >= 50) return jsonError("You've reached the collection limit.", 400);
    const res = await query(
      `INSERT INTO user_collections (owner_steam_id, title, description, game_ids, is_public)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [owner, ...values]
    );
    return NextResponse.json({ success: true, id: res.rows[0].id });
  } catch (err) {
    await logServerError("api/user/collections POST", err);
    return jsonError("Internal Server Error", 500);
  }
}

export async function DELETE(req) {
  const owner = await getSessionSteamId();
  if (!owner) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("Missing id");
  try {
    await query("DELETE FROM user_collections WHERE id = $1 AND owner_steam_id = $2", [id, owner]);
    return NextResponse.json({ success: true });
  } catch (err) {
    await logServerError("api/user/collections DELETE", err);
    return jsonError("Internal Server Error", 500);
  }
}
