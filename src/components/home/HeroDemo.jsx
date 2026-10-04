"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, playerColor } from "@/components/compare/PlayerDot";
import { Icon } from "@/components/Icon";
import { steamHeader } from "@/lib/site";

function useCountUp(target, ms = 900) {
  const [n, setN] = useState(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

/**
 * A live miniature of the results page, built from the demo group. It sells
 * the product by showing it, and links to the full demo.
 */
export default function HeroDemo({ demo }) {
  const shared = useCountUp(demo.sharedCount);
  const [pick, setPick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setPick((p) => (p + 1) % demo.picks.length), 2600);
    return () => clearInterval(t);
  }, [demo.picks.length]);

  const maxLib = Math.max(...demo.players.map((p) => p.count));
  const current = demo.picks[pick];

  return (
    <div className="relative">
      <div className="surface-raised relative overflow-hidden p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex -space-x-2">
            {demo.players.map((p, i) => (
              <Avatar key={p.name} src={p.avatar} name={p.name} index={i} size={34} />
            ))}
          </div>
          <span className="tag !bg-surface-3">Example group</span>
        </div>

        <div className="mt-6 flex items-end gap-4">
          <span className="num text-[clamp(3.5rem,2rem+5vw,5.5rem)] font-bold leading-[0.85] text-ink-1" aria-hidden>
            {shared}
          </span>
          <p className="pb-1.5 text-sm leading-snug text-ink-2">
            games all {demo.players.length} of you own
            <span className="block text-ink-3">out of {demo.unionCount} between you</span>
          </p>
        </div>
        <p className="sr-only">
          Example: {demo.sharedCount} games all {demo.players.length} friends own, out of {demo.unionCount} between them.
        </p>

        <ul className="mt-6 space-y-2.5" aria-label="Library sizes">
          {demo.players.map((p, i) => (
            <li key={p.name} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-xs">
              <span className="truncate text-ink-2">{p.name.replace("Demo · ", "")}</span>
              <span className="relative h-2 overflow-hidden rounded-full bg-surface-3">
                <span className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ width: `${(p.count / maxLib) * 100}%`, background: playerColor(i) }} />
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(demo.sharedCount / maxLib) * 100}%`, background: playerColor(i) }} />
              </span>
              <span className="num text-right text-ink-3">{p.count}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-lg border border-line bg-bg-raised p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="label flex items-center gap-1.5 !text-accent-hi">
              <Icon name="dice" className="h-3.5 w-3.5" /> Tonight's pick
            </span>
            <span className="text-[0.7rem] text-ink-3">{current.note}</span>
          </div>
          <div key={current.appid} className="rise flex items-center gap-3">
            <img
              src={steamHeader(current.appid)}
              alt=""
              width={92}
              height={43}
              className="h-[43px] w-[92px] shrink-0 rounded-md bg-surface-3 object-cover"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-1">{current.name}</p>
              <p className="truncate text-xs text-ink-3">{current.tags.join(" · ")}</p>
            </div>
          </div>
        </div>

        <Link href="/compare?demo=1" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hi hover:underline">
          Explore the full example <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-3 text-center text-xs text-ink-3">Example data — fictional players, real games.</p>
    </div>
  );
}
