// GET /api/polls/:id -> poll, ranked options and voter count.
import { NextResponse } from "next/server";
import { getPoll, pollTallies, rankPoll } from "@/lib/shares";
import { jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const poll = await getPoll(id).catch(() => null);
  if (!poll) return jsonError("This vote doesn't exist (or has been removed).", 404);
  const votes = await pollTallies(id);
  const voter = new URL(req.url).searchParams.get("voter");
  const mine = votes.find((v) => v.voter === voter) || null;
  return NextResponse.json(
    {
      id: poll.id,
      options: rankPoll(poll.options, votes),
      voters: votes.map((v) => v.voter_name || "Someone"),
      mine: mine ? { yes: mine.yes, veto: mine.veto, name: mine.voter_name } : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
