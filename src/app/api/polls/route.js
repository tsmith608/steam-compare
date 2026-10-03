// POST /api/polls { users: [...], appids: [...] } -> { id, url }
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAppMeta, resolveSteamId } from "@/lib/steam";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, limitOrNull, readJson } from "@/lib/http";
import { shortId } from "@/lib/ids";
import { logServerError } from "@/lib/ops";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const limited = limitOrNull(req, "polls", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;
  const { users, appids } = await readJson(req);
  const apps = [...new Set((Array.isArray(appids) ? appids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 8);
  if (apps.length < 2) return jsonError("Pick at least two games to vote on.");

  try {
    const steamIds = [];
    for (const u of (Array.isArray(users) ? users : []).slice(0, 16)) {
      try {
        steamIds.push(await resolveSteamId(u));
      } catch {}
    }
    // Names come from Steam's store data, never from the client.
    const { meta } = await getAppMeta(apps, { fetchBudget: 8 });
    const options = apps.map((appid) => ({ appid, name: meta[appid]?.name || null })).filter((o) => o.name);
    if (options.length < 2) return jsonError("We couldn't look those games up. Try again in a minute.", 502);

    const id = shortId(8);
    await query("INSERT INTO polls (id, steam_ids, options, created_by) VALUES ($1, $2, $3, $4)", [
      id,
      [...new Set(steamIds)],
      JSON.stringify(options),
      await getSessionSteamId(),
    ]);
    return NextResponse.json({ id, url: `${SITE_URL}/poll/${id}` });
  } catch (err) {
    await logServerError("api/polls", err);
    return jsonError("Couldn't create the vote right now.", 500);
  }
}
