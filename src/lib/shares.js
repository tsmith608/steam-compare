// Share links and polls (server only).
import { query } from "@/lib/db";
import { shortId, isShortId } from "@/lib/ids";

const short = (name) => String(name || "").replace(/^Demo · /, "");

/** The public, shareable summary of a comparison (no libraries, no playtimes per person). */
export function summarize(data) {
  const players = data.profiles.filter((p) => !p.isPrivate).map((p) => ({ name: short(p.username), avatar: p.avatar || null }));
  const s = data.stats;
  return {
    v: 1,
    demo: !!data.demo,
    players,
    sharedCount: s.sharedCount,
    unionCount: s.unionCount,
    overlapPct: s.overlapPct,
    nearMissCount: s.nearMissCount,
    backlogCount: s.backlogCount,
    mostPlayed: s.mostPlayedTogether && s.mostPlayedTogether.minutes > 0 ? { appid: s.mostPlayedTogether.appid, name: s.mostPlayedTogether.name, hours: Math.round(s.mostPlayedTogether.minutes / 60) } : null,
    forgotten: s.forgotten,
    carry: s.carry ? { name: s.carry.name, by: short(data.profiles.find((p) => p.steamid === s.carry.steamid)?.username), hours: Math.round(s.carry.minutes / 60) } : null,
    top: data.shared.slice(0, 5).map((g) => ({ appid: g.appid, name: g.name })),
  };
}

export async function createShare(steamIds, summary, createdBy = null) {
  const id = shortId(8);
  await query("INSERT INTO shares (id, steam_ids, summary, created_by) VALUES ($1, $2, $3, $4)", [id, steamIds, JSON.stringify(summary), createdBy]);
  return id;
}

export async function getShare(id, { countView = false } = {}) {
  if (!isShortId(id)) return null;
  const res = countView
    ? await query("UPDATE shares SET views = views + 1 WHERE id = $1 RETURNING id, steam_ids, summary, created_at, views", [id])
    : await query("SELECT id, steam_ids, summary, created_at, views FROM shares WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function getPoll(id) {
  if (!isShortId(id)) return null;
  const res = await query("SELECT id, steam_ids, options, created_at FROM polls WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function pollTallies(id) {
  const res = await query("SELECT voter, voter_name, yes, veto FROM poll_votes WHERE poll_id = $1 ORDER BY created_at", [id]);
  return res.rows;
}

/** Ranks options: vetoed games drop out, then most "yes" votes wins. */
export function rankPoll(options, votes) {
  const rows = options.map((o) => ({
    ...o,
    yes: votes.filter((v) => (v.yes || []).includes(o.appid)).length,
    vetoedBy: votes.filter((v) => v.veto === o.appid).map((v) => v.voter_name || "Someone"),
  }));
  rows.sort((a, b) => (a.vetoedBy.length > 0) - (b.vetoedBy.length > 0) || b.yes - a.yes || a.name.localeCompare(b.name));
  return rows;
}
