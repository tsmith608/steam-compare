// POST /api/share { users: [...] } -> { id, url }
// Re-runs the comparison server-side so a share card can't be forged.
import { NextResponse } from "next/server";
import { runComparison } from "@/lib/comparison-service";
import { createShare, summarize } from "@/lib/shares";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, limitOrNull, readJson } from "@/lib/http";
import { logServerError } from "@/lib/ops";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const limited = limitOrNull(req, "share", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;
  const { users } = await readJson(req);
  try {
    const viewer = await getSessionSteamId();
    const result = await runComparison(users, { viewerSteamId: viewer });
    if (!result.ok) return jsonError(result.error, result.status);
    const ids = result.data.profiles.filter((p) => !p.isPrivate).map((p) => p.steamid);
    const id = await createShare(ids, summarize(result.data), viewer);
    return NextResponse.json({ id, url: `${SITE_URL}/s/${id}` });
  } catch (err) {
    await logServerError("api/share", err);
    return jsonError("Couldn't create a share link right now.", 500);
  }
}
