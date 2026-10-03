"use client";
import { memo, useState } from "react";
import { Icon } from "@/components/Icon";
import { playerColor } from "@/components/compare/PlayerDot";
import { gameTags } from "@/lib/game-filters";
import { steamCapsule, steamHeader, steamRun, steamStore } from "@/lib/site";
import { track } from "@/lib/track";

const hours = (m) => (m >= 6000 ? `${Math.round(m / 60)}h` : m >= 60 ? `${(m / 60).toFixed(m >= 600 ? 0 : 1)}h` : m > 0 ? `${m}m` : "0h");

export function Cover({ appid, name, className = "" }) {
  const [src, setSrc] = useState(steamHeader(appid));
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-surface-3 to-surface-1 p-3 text-center ${className}`}>
        <span className="display line-clamp-2 text-sm text-ink-2">{name}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={460}
      height={215}
      loading="lazy"
      decoding="async"
      className={`bg-surface-2 object-cover ${className}`}
      onError={() => (src === steamHeader(appid) ? setSrc(steamCapsule(appid)) : setFailed(true))}
    />
  );
}

/** Per-friend playtime as a row of colour bars (relative within the game). */
export function PlayBars({ playtimes, profiles }) {
  const values = profiles.map((p) => playtimes?.[p.steamid] || 0);
  const max = Math.max(1, ...values);
  const summary = profiles.map((p, i) => `${p.username} ${hours(values[i])}`).join(", ");
  // sqrt scale: big gaps stay visible, small playtimes don't vanish.
  return (
    <div className="flex h-7 items-end gap-[3px]" title={summary}>
      <span className="sr-only">{summary}</span>
      {values.map((v, i) => (
        <span
          key={profiles[i].steamid}
          aria-hidden
          className="w-[6px] rounded-[2px]"
          style={{
            height: v > 0 ? `${Math.max(14, Math.sqrt(v / max) * 100)}%` : "2px",
            background: v > 0 ? playerColor(profiles[i].index ?? i) : "var(--line-strong)",
          }}
        />
      ))}
    </div>
  );
}

function GameCard({ game, meta, profiles, shortlisted, onToggleShortlist, layout = "grid" }) {
  const tags = gameTags(meta);
  const total = game.totalMinutes;
  const note = game.recentBy > 1 ? `${game.recentBy} played lately` : total === 0 ? "Nobody's played" : `${hours(total)} together`;

  if (layout === "list") {
    return (
      <li className="flex items-center gap-3 rounded-lg border border-line bg-surface-1 p-2 pr-3">
        <Cover appid={game.appid} name={game.name} className="h-[46px] w-[98px] shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-1">{game.name}</p>
          <p className="truncate text-xs text-ink-3">{[note, ...tags].join(" · ")}</p>
        </div>
        <div className="hidden w-28 sm:block"><PlayBars playtimes={game.playtimes} profiles={profiles} /></div>
        <a href={steamRun(game.appid)} onClick={() => track("game_opened", { via: "launch" })} className="btn btn-quiet btn-sm !px-2.5" aria-label={`Launch ${game.name} in Steam`}>
          <Icon name="play" className="h-4 w-4" />
        </a>
        <button type="button" onClick={() => onToggleShortlist(game.appid)} aria-pressed={shortlisted} className={`btn btn-quiet btn-sm !px-2.5 ${shortlisted ? "!text-amber-hi" : ""}`} aria-label={shortlisted ? `Remove ${game.name} from shortlist` : `Shortlist ${game.name}`}>
          <Icon name="star" className="h-4 w-4" fill={shortlisted ? "currentColor" : "none"} />
        </button>
      </li>
    );
  }

  return (
    <li className={`group flex flex-col overflow-hidden rounded-lg border bg-surface-1 transition-colors ${shortlisted ? "border-amber/50" : "border-line hover:border-line-strong"}`}>
      <div className="relative">
        <Cover appid={game.appid} name={game.name} className="aspect-[460/215] w-full" />
        <button
          type="button"
          onClick={() => onToggleShortlist(game.appid)}
          aria-pressed={shortlisted}
          aria-label={shortlisted ? `Remove ${game.name} from shortlist` : `Shortlist ${game.name}`}
          className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition ${
            shortlisted ? "border-amber/60 bg-black/70 text-amber-hi" : "border-white/15 bg-black/55 text-white/85 hover:text-white"
          }`}
        >
          <Icon name="star" className="h-4 w-4" fill={shortlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-ink-1">{game.name}</h3>
        <p className="text-xs text-ink-3">{[note, ...tags].join(" · ")}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="w-full max-w-[9rem]"><PlayBars playtimes={game.playtimes} profiles={profiles} /></div>
          <div className="flex shrink-0 gap-1">
            <a href={steamStore(game.appid)} target="_blank" rel="noopener noreferrer" onClick={() => track("game_opened", { via: "store" })} className="btn btn-quiet btn-sm !px-2" aria-label={`${game.name} on the Steam store`}>
              <Icon name="external" className="h-4 w-4" />
            </a>
            <a href={steamRun(game.appid)} onClick={() => track("game_opened", { via: "launch" })} className="btn btn-ghost btn-sm" aria-label={`Launch ${game.name} in Steam`}>
              <Icon name="play" className="h-3.5 w-3.5" /> Play
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

export default memo(GameCard);
export { hours };
