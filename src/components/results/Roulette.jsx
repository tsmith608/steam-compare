"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Dialog from "@/components/Dialog";
import { Cover, PlayBars, hours } from "@/components/results/GameCard";
import { Icon } from "@/components/Icon";
import CopyButton from "@/components/results/CopyButton";
import { steamRun } from "@/lib/site";
import { track } from "@/lib/track";

const ITEM = 184;
const GAP = 12;
const SPIN_MS = 1100;
const WIN_AT = 17;

function buildReel(games) {
  const winner = games[Math.floor(Math.random() * games.length)];
  const others = games.filter((g) => g.appid !== winner.appid);
  const reel = [];
  for (let i = 0; i < WIN_AT + 3; i++) {
    if (i === WIN_AT) reel.push(winner);
    else reel.push(others.length ? others[Math.floor(Math.random() * others.length)] : winner);
  }
  return { reel, winner };
}

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Roulette({ games, profiles, onClose, onShortlist, shortlisted = [], filtered }) {
  const [round, setRound] = useState(0);
  const { reel, winner } = useMemo(() => buildReel(games), [games, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState("spinning");
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const stripRef = useRef(null);

  const finish = useCallback(() => {
    const show = () => setPhase("done");
    if (document.startViewTransition && !prefersReduced()) document.startViewTransition(show);
    else show();
    try {
      navigator.vibrate?.([12, 40, 18]);
    } catch {}
  }, []);

  useLayoutEffect(() => {
    if (!games.length) return;
    setPhase("spinning");
    setAnimate(false);
    setOffset(0);
    if (prefersReduced()) {
      finish();
      return;
    }
    const w = stripRef.current?.parentElement?.clientWidth || 600;
    const target = -(WIN_AT * (ITEM + GAP)) + (w / 2 - ITEM / 2);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setOffset(target);
      })
    );
    const done = setTimeout(finish, SPIN_MS + 40);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(done);
    };
  }, [round, games.length, finish]);

  useEffect(() => {
    if (round > 0) track("roulette_spun", { from: "again" });
  }, [round]);

  if (!games.length) {
    return (
      <Dialog title="Nothing to spin" onClose={onClose}>
        <p className="text-ink-2">No games match your current filters. Clear a filter and try again.</p>
      </Dialog>
    );
  }

  const isListed = shortlisted.includes(winner.appid);

  return (
    <Dialog title={phase === "done" ? "Tonight's pick" : "Spinning…"} description={filtered ? `From ${games.length} games matching your filters` : `From ${games.length} games you all own`} onClose={onClose} size="lg">
      {phase !== "done" ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg border border-line bg-bg-raised py-4 mask-fade-x" aria-hidden>
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[3px] -translate-x-1/2 rounded bg-accent-hi shadow-[0_0_24px_rgba(96,165,250,0.8)]" />
            <div
              ref={stripRef}
              className="flex"
              style={{
                gap: GAP,
                transform: `translateX(${offset}px)`,
                transition: animate ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.12, 1)` : "none",
              }}
            >
              {reel.map((g, i) => (
                <div key={i} className="shrink-0 overflow-hidden rounded-md" style={{ width: ITEM }}>
                  <Cover appid={g.appid} name={g.name} className="aspect-[460/215] w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <button type="button" className="btn btn-quiet btn-sm" onClick={finish}>Skip</button>
          </div>
        </div>
      ) : (
        <div className="space-y-5" style={{ viewTransitionName: "tonight-pick" }}>
          <div className="overflow-hidden rounded-lg border border-line">
            <Cover appid={winner.appid} name={winner.name} className="aspect-[460/215] w-full" />
          </div>
          <div>
            <p className="display-wide text-display-sm" aria-live="assertive">{winner.name}</p>
            <p className="mt-1 text-sm text-ink-3">
              {winner.totalMinutes === 0 ? "Nobody's launched it yet — perfect excuse." : `${hours(winner.totalMinutes)} played across the group`}
            </p>
            <div className="mt-3 max-w-xs"><PlayBars playtimes={winner.playtimes} profiles={profiles} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={steamRun(winner.appid)} className="btn btn-primary" onClick={() => track("game_opened", { via: "roulette" })}>
              <Icon name="play" className="h-4 w-4" /> Launch in Steam
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => setRound((r) => r + 1)}>
              <Icon name="dice" className="h-4 w-4" /> Spin again
            </button>
            <button type="button" className={`btn btn-quiet ${isListed ? "!text-amber-hi" : ""}`} onClick={() => onShortlist(winner.appid)} aria-pressed={isListed}>
              <Icon name="star" className="h-4 w-4" fill={isListed ? "currentColor" : "none"} /> {isListed ? "Shortlisted" : "Shortlist"}
            </button>
            <CopyButton
              className="btn btn-quiet"
              label="Copy for chat"
              text={`🎲 The roulette has spoken: ${winner.name}. Launch it: steam://run/${winner.appid}`}
              onCopied={() => track("result_shared", { channel: "roulette_copy" })}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
