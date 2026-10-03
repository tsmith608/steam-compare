"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cover } from "@/components/results/GameCard";
import CopyButton from "@/components/results/CopyButton";
import { Icon } from "@/components/Icon";
import { anonId, track } from "@/lib/track";
import { steamRun } from "@/lib/site";

const NAME_KEY = "wbp.voterName";

export default function PollVote({ id, initialOptions }) {
  const [voter, setVoter] = useState(null);
  const [data, setData] = useState({ options: initialOptions.map((o) => ({ ...o, yes: 0, vetoedBy: [] })), voters: [], mine: null });
  const [yes, setYes] = useState([]);
  const [veto, setVeto] = useState(null);
  const [name, setName] = useState("");
  const [mode, setMode] = useState("vote");
  const [saving, setSaving] = useState(false);
  const [spun, setSpun] = useState(null);

  const load = useCallback(async (v) => {
    const r = await fetch(`/api/polls/${id}?voter=${encodeURIComponent(v || "")}`, { cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json();
    setData(d);
    return d;
  }, [id]);

  useEffect(() => {
    const v = anonId();
    // The anonymous voter id and remembered name exist only in the browser, so they load after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoter(v);
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {}
    load(v).then((d) => {
      if (d?.mine) {
        setYes(d.mine.yes || []);
        setVeto(d.mine.veto ?? null);
        setMode("results");
      }
    });
  }, [load]);

  useEffect(() => {
    if (mode !== "results") return;
    const t = setInterval(() => load(voter), 6000);
    return () => clearInterval(t);
  }, [mode, voter, load]);

  const toggleYes = (appid) => {
    setYes((y) => (y.includes(appid) ? y.filter((a) => a !== appid) : [...y, appid]));
    if (veto === appid) setVeto(null);
  };
  const toggleVeto = (appid) => {
    setVeto((v) => (v === appid ? null : appid));
    setYes((y) => y.filter((a) => a !== appid));
  };

  async function submit() {
    setSaving(true);
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {}
    await fetch(`/api/polls/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter, name: name.trim(), yes, veto }),
    });
    await load(voter);
    setSaving(false);
    setMode("results");
  }

  function spinSurvivors() {
    const alive = data.options.filter((o) => o.vetoedBy.length === 0);
    const pool = alive.some((o) => o.yes > 0) ? alive.filter((o) => o.yes > 0) : alive;
    if (!pool.length) return;
    const weights = pool.map((o) => Math.max(1, o.yes));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    let pick = pool[0];
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        pick = pool[i];
        break;
      }
    }
    setSpun(pick);
    track("roulette_spun", { from: "poll" });
    try {
      navigator.vibrate?.([12, 40, 18]);
    } catch {}
  }

  const leader = data.options.find((o) => o.vetoedBy.length === 0 && o.yes > 0);
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="mx-auto max-w-3xl">
      <p className="label !text-accent-hi">Group vote · one veto each</p>
      <h1 className="display-wide mt-3 text-display-md">What are we playing tonight?</h1>

      {mode === "vote" ? (
        <>
          <p className="mt-3 text-ink-2">Tap every game you'd happily play. Use your one veto on something you really don't want.</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {data.options.map((o) => {
              const on = yes.includes(o.appid);
              const vetoed = veto === o.appid;
              return (
                <li key={o.appid} className={`overflow-hidden rounded-lg border transition ${on ? "border-accent" : vetoed ? "border-danger/60 opacity-70" : "border-line"}`}>
                  <Cover appid={o.appid} name={o.name} className="aspect-[460/215] w-full" />
                  <div className="space-y-3 p-3">
                    <p className="font-semibold text-ink-1">{o.name}</p>
                    <div className="flex gap-2">
                      <button type="button" aria-pressed={on} onClick={() => toggleYes(o.appid)} className={`btn btn-sm flex-1 ${on ? "btn-primary" : "btn-ghost"}`}>
                        <Icon name="check" className="h-4 w-4" /> I'd play
                      </button>
                      <button type="button" aria-pressed={vetoed} onClick={() => toggleVeto(o.appid)} className={`btn btn-sm ${vetoed ? "border border-danger bg-danger/15 text-ink-1" : "btn-quiet"}`}>
                        <Icon name="close" className="h-4 w-4" /> {vetoed ? "Vetoed" : "Veto"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="label mb-2 block">Your name (optional)</span>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="So the group knows who voted" />
            </label>
            <button type="button" className="btn btn-primary btn-lg" onClick={submit} disabled={saving || (!yes.length && veto === null)}>
              {saving ? "Saving…" : "Cast my vote"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-ink-2" aria-live="polite">
            {data.voters.length === 0 ? "No votes yet." : `${data.voters.length} voted: ${data.voters.join(", ")}.`} Results update live.
          </p>
          {leader && (
            <div className="mt-6 rounded-lg border border-accent/50 bg-accent-wash p-4">
              <p className="label !text-accent-hi">Leading</p>
              <p className="display mt-1 text-2xl">{leader.name}</p>
            </div>
          )}
          <ol className="mt-6 space-y-2">
            {data.options.map((o) => (
              <li key={o.appid} className={`flex items-center gap-3 rounded-lg border border-line bg-surface-1 p-2 pr-4 ${o.vetoedBy.length ? "opacity-60" : ""}`}>
                <Cover appid={o.appid} name={o.name} className="h-[44px] w-[94px] shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${o.vetoedBy.length ? "line-through" : ""}`}>{o.name}</p>
                  {o.vetoedBy.length > 0 && <p className="text-xs text-danger">Vetoed by {o.vetoedBy.join(", ")}</p>}
                </div>
                <span className="num text-xl font-bold text-ink-1">{o.yes}</span>
              </li>
            ))}
          </ol>

          {spun && (
            <div className="rise mt-6 rounded-lg border border-line-strong bg-surface-2 p-4">
              <p className="label">The dice say</p>
              <p className="display mt-1 text-2xl">{spun.name}</p>
              <a href={steamRun(spun.appid)} className="btn btn-primary btn-sm mt-3"><Icon name="play" className="h-4 w-4" /> Launch in Steam</a>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={spinSurvivors}>
              <Icon name="dice" className="h-4 w-4" /> Spin among the survivors
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode("vote")}>Change my vote</button>
            <CopyButton text={url} label="Copy vote link" onCopied={() => track("result_shared", { channel: "poll_link" })} />
          </div>
        </>
      )}

      <div className="mt-14 rounded-lg border border-line bg-bg-raised p-5">
        <p className="font-semibold">Not sure what your group owns in the first place?</p>
        <p className="mt-1 text-sm text-ink-3">WeBothPlay compares Steam libraries and finds every game you all own — free.</p>
        <Link href="/?utm_source=poll&utm_medium=referral" className="btn btn-ghost btn-sm mt-4">Compare your libraries</Link>
      </div>
    </div>
  );
}
