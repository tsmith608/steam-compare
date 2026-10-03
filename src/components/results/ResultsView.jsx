"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GameCard from "@/components/results/GameCard";
import PrivateBanner from "@/components/results/PrivateBanner";
import Roulette from "@/components/results/Roulette";
import ShareDialog from "@/components/results/ShareDialog";
import PollDialog from "@/components/results/PollDialog";
import SaveGroupButton from "@/components/results/SaveGroupButton";
import { NearMissList, OnlyOwnsList, WishlistPanel, BacklogNote } from "@/components/results/Sections";
import { Avatar } from "@/components/compare/PlayerDot";
import { Icon } from "@/components/Icon";
import { FILTERS, SORTS, applyView, filterCounts } from "@/lib/game-filters";
import { formatCount } from "@/lib/compare";
import { track } from "@/lib/track";

const PAGE = 48;

function useAppMeta(appids) {
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const key = appids.join(",");

  useEffect(() => {
    let alive = true;
    const want = [...appids];
    if (!want.length) {
      setLoading(false);
      return;
    }
    (async () => {
      let pending = want;
      for (let round = 0; round < 8 && pending.length && alive; round++) {
        const batch = pending.slice(0, 120);
        try {
          const r = await fetch("/api/game-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appids: batch }),
          });
          if (!r.ok) break;
          const d = await r.json();
          if (!alive) return;
          setMeta((prev) => ({ ...prev, ...d.meta }));
          const stillPending = new Set(d.pending || []);
          pending = [...batch.filter((id) => stillPending.has(id)), ...pending.slice(batch.length)];
          if (stillPending.size === batch.length) break; // rate limited; try again later
        } catch {
          break;
        }
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { meta, loading };
}

function useShortlist(groupKey) {
  const storageKey = `wbp.shortlist.${groupKey}`;
  const [list, setList] = useState([]);
  useEffect(() => {
    try {
      setList(JSON.parse(sessionStorage.getItem(storageKey) || "[]"));
    } catch {}
  }, [storageKey]);
  const toggle = useCallback(
    (appid) =>
      setList((prev) => {
        const next = prev.includes(appid) ? prev.filter((x) => x !== appid) : [...prev, appid].slice(-10);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        if (!prev.includes(appid) && prev.length === 0) track("shortlist_created", {});
        return next;
      }),
    [storageKey]
  );
  const clear = useCallback(() => {
    setList([]);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);
  return { list, toggle, clear };
}

function Stat({ value, label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group rounded-lg border px-4 py-3 text-left transition ${active ? "border-accent/60 bg-accent-wash" : "border-line hover:border-line-strong"}`}
    >
      <span className="num block text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-none text-ink-1">{formatCount(value)}</span>
      <span className="mt-1.5 block text-xs text-ink-3 group-hover:text-ink-2">{label}</span>
    </button>
  );
}

export default function ResultsView({ data, groupKey, editHref }) {
  const sp = useSearchParams();
  const profiles = useMemo(() => data.profiles.filter((p) => !p.isPrivate).map((p, i) => ({ ...p, index: i })), [data.profiles]);
  const n = profiles.length;
  const [tab, setTab] = useState(sp.get("view") === "backlog" ? "backlog" : sp.get("view") === "near" ? "near" : "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sp.get("view") === "backlog" ? "least" : "best");
  const [filters, setFilters] = useState(sp.get("filter") ? [sp.get("filter")] : []);
  const [showSingle, setShowSingle] = useState(false);
  const [layout, setLayout] = useState("grid");
  const [visible, setVisible] = useState(PAGE);
  const [rouletteOpen, setRouletteOpen] = useState(sp.get("spin") === "1");
  const [shareOpen, setShareOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const shortlist = useShortlist(groupKey);
  const searchTimer = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wbp.layout");
      if (saved === "list" || saved === "grid") setLayout(saved);
    } catch {}
  }, []);

  const metaIds = useMemo(
    () => [...new Set([...data.shared.map((g) => g.appid), ...data.nearMisses.slice(0, 40).map((g) => g.appid)])],
    [data.shared, data.nearMisses]
  );
  const { meta, loading: metaLoading } = useAppMeta(metaIds);

  const backlogIds = useMemo(() => new Set(data.backlog.map((b) => b.appid)), [data.backlog]);
  const pool = tab === "backlog" ? data.shared.filter((g) => backlogIds.has(g.appid)) : data.shared;

  const view = useMemo(
    () => applyView(pool, { query, filters, sort, meta, players: n, hideSingle: !showSingle }),
    [pool, query, filters, sort, meta, n, showSingle]
  );
  const counts = useMemo(() => filterCounts(pool, meta), [pool, meta]);

  useEffect(() => setVisible(PAGE), [tab, query, filters, sort, showSingle]);

  const toggleFilter = (key) => {
    setFilters((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]));
    track("filter_used", { filter: key });
  };

  const setLayoutPersist = (l) => {
    setLayout(l);
    try {
      localStorage.setItem("wbp.layout", l);
    } catch {}
  };

  const names = profiles.map((p) => p.username.replace(/^Demo · /, ""));
  const nameLine = names.length <= 2 ? names.join(" & ") : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
  const s = data.stats;
  const shortlistGames = shortlist.list.map((id) => data.shared.find((g) => g.appid === id)).filter(Boolean);

  const TABS = [
    { key: "all", label: "Everyone owns", count: s.sharedCount },
    ...(n >= 3 ? [{ key: "near", label: "One copy away", count: s.nearMissCount }] : []),
    { key: "backlog", label: "Nobody's played", count: s.backlogCount },
    { key: "only", label: "Only one owns", count: null },
    ...((data.sharedWishlist?.length || Object.values(data.wishlistMatches || {}).some((m) => m.length)) ? [{ key: "wish", label: "Wishlists", count: null }] : []),
  ];

  return (
    <div className="pb-28">
      {/* ------------------------------------------------------------ Header */}
      <section className="border-b border-line">
        <div className="container-page py-8 sm:py-10">
          {data.demo && (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1 text-xs text-ink-2">
              <Icon name="info" className="h-3.5 w-3.5 text-accent-hi" /> Example group — fictional players, real games.{" "}
              <Link href="/" className="font-semibold text-accent-hi underline">Try yours</Link>
            </p>
          )}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex -space-x-2">
                {profiles.map((p) => (
                  <Avatar key={p.steamid} src={p.avatar} name={p.username} index={p.index} size={40} />
                ))}
              </div>
              <h1 className="display-wide mt-4 text-display-md">
                <span className="text-accent-hi">{formatCount(s.sharedCount)}</span> games you all own
              </h1>
              <p className="mt-2 text-ink-2">
                {nameLine} · {formatCount(s.unionCount)} games between you · {s.overlapPct}% overlap
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={() => setShareOpen(true)}>
                <Icon name="share" className="h-4 w-4" /> Share
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setRouletteOpen(true); track("roulette_spun", { from: "header" }); }}>
                <Icon name="dice" className="h-4 w-4" /> Pick for us
              </button>
              <SaveGroupButton profiles={profiles} demo={data.demo} />
              <Link href={editHref} className="btn btn-quiet">
                <Icon name="user-plus" className="h-4 w-4" /> Edit group
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={s.sharedCount} label="everyone owns" active={tab === "all"} onClick={() => setTab("all")} />
            {n >= 3 ? (
              <Stat value={s.nearMissCount} label="one copy away" active={tab === "near"} onClick={() => setTab("near")} />
            ) : (
              <Stat value={Math.round(s.combinedSharedMinutes / 60)} label="hours in shared games" onClick={() => setTab("all")} />
            )}
            <Stat value={s.backlogCount} label="nobody's really played" active={tab === "backlog"} onClick={() => setTab("backlog")} />
            <Stat value={s.unionCount} label="games between you" active={tab === "only"} onClick={() => setTab("only")} />
          </div>

          {(s.mostPlayedTogether || s.forgotten || s.carry) && (
            <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-ink-2 md:grid-cols-3">
              {s.mostPlayedTogether && s.mostPlayedTogether.minutes > 0 && (
                <li className="flex gap-2"><Icon name="flame" className="mt-0.5 h-4 w-4 shrink-0 text-accent-hi" /><span>Most played together: <strong className="text-ink-1">{s.mostPlayedTogether.name}</strong></span></li>
              )}
              {s.forgotten && (
                <li className="flex gap-2"><Icon name="ghost" className="mt-0.5 h-4 w-4 shrink-0 text-accent-hi" /><span>Everyone owns it, nobody's launched it: <strong className="text-ink-1">{s.forgotten.name}</strong></span></li>
              )}
              {s.carry && (
                <li className="flex gap-2"><Icon name="crown" className="mt-0.5 h-4 w-4 shrink-0 text-accent-hi" /><span>{profiles.find((p) => p.steamid === s.carry.steamid)?.username.replace(/^Demo · /, "")} carries <strong className="text-ink-1">{s.carry.name}</strong> ({Math.round(s.carry.minutes / 60)}h)</span></li>
              )}
            </ul>
          )}
        </div>
      </section>

      <div className="container-page mt-6 space-y-6">
        <PrivateBanner blocked={data.blocked} />

        {/* --------------------------------------------------------------- Tabs */}
        <div role="tablist" aria-label="Result views" className="scrollbar-none -mx-[var(--gutter)] flex gap-1 overflow-x-auto px-[var(--gutter)]">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-md px-3.5 py-2 text-sm font-medium transition ${tab === t.key ? "bg-surface-2 text-ink-1" : "text-ink-3 hover:text-ink-1"}`}
            >
              {t.label}
              {t.count !== null && <span className="num ml-1.5 text-ink-3">{t.count}</span>}
            </button>
          ))}
        </div>

        {(tab === "all" || tab === "backlog") && (
          <>
            {/* ---------------------------------------------------- Toolbar */}
            <div className="sticky top-[var(--header-h)] z-30 -mx-[var(--gutter)] border-y border-line bg-bg/90 px-[var(--gutter)] py-3 backdrop-blur-md">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <label className="relative min-w-0 basis-full sm:basis-auto sm:flex-1">
                    <span className="sr-only">Search shared games</span>
                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                    <input
                      type="search"
                      className="field !min-h-[42px] !pl-9"
                      placeholder={`Search ${formatCount(pool.length)} games`}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        clearTimeout(searchTimer.current);
                        searchTimer.current = setTimeout(() => track("search_used", {}), 1200);
                      }}
                    />
                  </label>
                  <label className="sr-only" htmlFor="sort">Sort</label>
                  <select
                    id="sort"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      track("sort_used", { sort: e.target.value });
                    }}
                    className="field !min-h-[42px] min-w-0 flex-1 cursor-pointer pr-8 text-sm sm:!w-auto sm:flex-none"
                  >
                    {SORTS.map((o) => (
                      <option key={o.key} value={o.key}>{o.label}</option>
                    ))}
                  </select>
                  <div className="hidden shrink-0 rounded-md border border-line-strong p-0.5 sm:flex" role="group" aria-label="Layout">
                    {["grid", "list"].map((l) => (
                      <button key={l} type="button" aria-pressed={layout === l} onClick={() => setLayoutPersist(l)} className={`rounded px-2.5 text-xs font-semibold capitalize ${layout === l ? "bg-surface-3 text-ink-1" : "text-ink-3"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="btn btn-primary !min-h-[42px] shrink-0" onClick={() => { setRouletteOpen(true); track("roulette_spun", { from: "toolbar" }); }}>
                    <Icon name="dice" className="h-4 w-4" /> Spin
                  </button>
                </div>
                <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Filters">
                  {FILTERS.map((f) => (
                    <button key={f.key} type="button" className="chip shrink-0" aria-pressed={filters.includes(f.key)} onClick={() => toggleFilter(f.key)}>
                      {f.label}
                      <span className="count">{f.needsMeta && metaLoading && !counts[f.key] ? "…" : counts[f.key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {tab === "backlog" && <BacklogNote />}

            <p className="text-sm text-ink-3" aria-live="polite">
              {view.games.length === pool.length ? `${formatCount(view.games.length)} games` : `${formatCount(view.games.length)} of ${formatCount(pool.length)} games`}
              {view.hiddenSingle > 0 && (
                <>
                  {" "}· hiding {view.hiddenSingle} single-player{" "}
                  <button type="button" className="text-accent-hi underline" onClick={() => setShowSingle(true)}>show</button>
                </>
              )}
              {showSingle && (
                <>
                  {" "}· <button type="button" className="text-accent-hi underline" onClick={() => setShowSingle(false)}>hide single-player</button>
                </>
              )}
            </p>

            {view.games.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
                <p className="display text-xl">Nothing matches that.</p>
                <p className="mt-2 text-ink-3">Try fewer filters{tab === "backlog" ? ", or look at everything you own" : ""}.</p>
                <button type="button" className="btn btn-ghost mt-5" onClick={() => { setFilters([]); setQuery(""); }}>Clear filters</button>
              </div>
            ) : (
              <ul className={layout === "list" ? "space-y-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"}>
                {view.games.slice(0, visible).map((g) => (
                  <GameCard
                    key={g.appid}
                    game={g}
                    meta={meta[g.appid]}
                    profiles={profiles}
                    layout={layout}
                    shortlisted={shortlist.list.includes(g.appid)}
                    onToggleShortlist={shortlist.toggle}
                  />
                ))}
              </ul>
            )}
            {visible < view.games.length && (
              <div className="text-center">
                <button type="button" className="btn btn-ghost" onClick={() => setVisible((v) => v + PAGE)}>
                  Show more ({formatCount(view.games.length - visible)} left)
                </button>
              </div>
            )}
          </>
        )}

        {tab === "near" && <NearMissList items={data.nearMisses} profiles={profiles} meta={meta} />}
        {tab === "only" && <OnlyOwnsList unique={data.unique} profiles={profiles} />}
        {tab === "wish" && <WishlistPanel data={data} profiles={profiles} />}
      </div>

      {/* --------------------------------------------------- Shortlist bar */}
      {shortlistGames.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
          <div className="container-page flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-1">
                <Icon name="star" className="mr-1 inline h-4 w-4 text-amber-hi" fill="currentColor" />
                {shortlistGames.length} shortlisted
              </p>
              <p className="truncate text-xs text-ink-3">{shortlistGames.map((g) => g.name).join(" · ")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="btn btn-quiet btn-sm" onClick={shortlist.clear}>Clear</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setPollOpen(true)} disabled={shortlistGames.length < 2}>
                <Icon name="vote" className="h-4 w-4" /> {shortlistGames.length < 2 ? "Pick 2+ to vote" : "Start a vote"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rouletteOpen && (
        <Roulette
          games={(view.games.length ? view.games : data.shared).slice(0, 60)}
          profiles={profiles}
          onClose={() => setRouletteOpen(false)}
          onShortlist={shortlist.toggle}
          shortlisted={shortlist.list}
          filtered={filters.length > 0 || !!query}
        />
      )}
      {shareOpen && <ShareDialog data={data} onClose={() => setShareOpen(false)} />}
      {pollOpen && <PollDialog data={data} games={shortlistGames} onClose={() => setPollOpen(false)} />}
    </div>
  );
}
