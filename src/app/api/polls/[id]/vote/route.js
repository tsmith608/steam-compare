// POST /api/polls/:id/vote { voter, name, yes: [appid], veto: appid|null }
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getPoll } from "@/lib/shares";
import { jsonError, limitOrNull, readJson } from "@/lib/http";
import { recordEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const limited = limitOrNull(req, "vote", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const { id } = await params;
  const poll = await getPoll(id).catch(() => null);
  if (!poll) return jsonError("This vote doesn't exist.", 404);

  const { voter, name, yes, veto } = await readJson(req);
  if (typeof voter !== "string" || !/^[a-z0-9-]{8,40}$/i.test(voter)) return jsonError("Missing voter id.");
  const valid = new Set(poll.options.map((o) => o.appid));
  const yesList = [...new Set((Array.isArray(yes) ? yes : []).map(Number))].filter((a) => valid.has(a));
  const vetoId = veto !== null && veto !== undefined && valid.has(Number(veto)) ? Number(veto) : null;
  const display = typeof name === "string" ? name.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 24) : null;

  await query(
    `INSERT INTO poll_votes (poll_id, voter, voter_name, yes, veto) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (poll_id, voter) DO UPDATE SET voter_name = EXCLUDED.voter_name, yes = EXCLUDED.yes, veto = EXCLUDED.veto, updated_at = NOW()`,
    [id, voter, display || null, yesList, vetoId]
  );
  await recordEvent("poll_voted", { yes_count: yesList.length, vetoed: vetoId !== null });
  return NextResponse.json({ ok: true });
}
