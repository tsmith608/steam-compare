"use client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/compare/PlayerDot";

const LINES = ["Reading libraries", "Lining up the overlap", "Counting hours played", "Checking who's missing what", "Almost there"];

/** Loading state tied to the "scanning libraries" metaphor. */
export default function Scanning({ count = 2 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, LINES.length - 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="container-page py-14" role="status" aria-live="polite">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(count, 8) }).map((_, k) => (
            <span key={k} className="animate-pulse" style={{ animationDelay: `${k * 120}ms` }}>
              <Avatar index={k} name=" " size={40} />
            </span>
          ))}
        </div>
        <div>
          <p className="display text-xl">{LINES[i]}…</p>
          <p className="text-sm text-ink-3">Comparing {count} Steam libraries</p>
        </div>
      </div>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-1/3 rounded-full bg-accent shimmer-bar" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
        {Array.from({ length: 8 }).map((_, k) => (
          <div key={k} className="overflow-hidden rounded-lg border border-line">
            <div className="aspect-[460/215] shimmer" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-3/4 rounded shimmer" />
              <div className="h-2 w-1/2 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes wbp-bar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}.shimmer-bar{animation:wbp-bar 1.2s var(--ease-out) infinite}`}</style>
    </div>
  );
}
