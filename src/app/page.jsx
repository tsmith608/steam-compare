"use client";
import { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SteamLoginButton from "./components/SteamLoginButton";
import FriendPickerBridge from "./components/FriendPickerBridge";
import CleanDataEntryForm from "./components/CleanDataEntryForm";
import FeatureDemoSection from "./components/FeatureDemoSection";
import HighlightsSection from "./components/HighlightsSection";
import FilterBar from "./components/FilterBar";
import GoogleAdSense from "./components/GoogleAdSense";
import PresetManager from "./components/PresetManager";

import ModernFAQSection from "./components/ModernFAQSection";
import SiteFooter from "./components/SiteFooter";
/* ---------- Landing-only UI blocks  ---------- */




const getAffiliateLink = (gameName) => {
  const encoded = encodeURIComponent(gameName);
  // CDKeys Search URL with affiliate tracking (placeholder ID 'steamcompare')
  // Using CDKeys avoids "account selling" risks common on G2A.
  return `https://www.cdkeys.com/catalogsearch/result/?q=${encoded}&utm_source=steamcompare&utm_medium=affiliate&utm_campaign=search`;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const steamid = searchParams.get("steamid");
  const [users, setUsers] = useState(["", "", "", ""]); // Start with 4 slots for familiar UI, or fewer?
  // Let's start with 4 to match original look, but make it dynamic.
  const [data, setData] = useState(null);

  // Handle URL parameters for auto-population and comparison
  useEffect(() => {
    const steamIds = searchParams.getAll("steamid");
    if (steamIds.length > 0) {
      // 1. Populate users state
      const newUsers = ["", "", "", ""];
      steamIds.forEach((id, i) => {
        if (i < 4) newUsers[i] = id;
      });
      setUsers(newUsers);

      // 2. Trigger comparison automatically
      // We need to wait for state to update, or pass newUsers directly?
      // handleCompare depends on state, so we should allow it to read from args if possible,
      // or just call it with the new list.
      // Looking at handleCompare signature: handleCompare(e, usersOverride)
      handleCompare(null, newUsers);
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({ category: "all", genre: "all" });
  const [gameDetails, setGameDetails] = useState({}); // appid -> { categories, ... }

  const [expanded, setExpanded] = useState({
    shared: false,
    others: {} // Dynamic expansion state
  });

  // Calculate available categories from shared games
  const availableCategories = useMemo(() => {
    if (!data?.shared) return [];
    const cats = new Set();
    const allowedCategories = [
      "Multi-player", "Co-op", "Online Co-op", "Local Co-op",
      "PvP", "Online PvP", "Shared/Split Screen",
      "Cross-Platform Multiplayer", "Full controller support"
    ];

    data.shared.forEach(g => {
      const details = gameDetails[g.appid];
      if (details) {
        // Add Genres (User priority)
        details.genres?.forEach(g => cats.add(g.description));

        // Add specific Categories (Multiplayer features)
        details.categories?.forEach(c => {
          if (allowedCategories.includes(c.description)) {
            cats.add(c.description);
          }
        });
      }
    });
    return Array.from(cats);
  }, [data?.shared, gameDetails]);

  // NEW: refs + sticky header state
  const formContainerRef = useRef(null);
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);
  const [highlightForm, setHighlightForm] = useState(false);

  // Fetch game details when shared games change and we don't have them
  useEffect(() => {
    if (!data?.shared || data.shared.length === 0) return;

    // Find missing details
    const missing = data.shared
      .map(g => g.appid)
      .filter(id => !gameDetails[id]);

    if (missing.length === 0) return;

    // chunk requests?
    fetch("/api/game-details", {
      method: "POST",
      body: JSON.stringify({ appids: missing }),
      headers: { "Content-Type": "application/json" }
    })
      .then(r => r.json())
      .then(d => {
        setGameDetails(prev => {
          const next = { ...prev };
          Object.keys(d).forEach(appid => {
            // API returns unwrapped data now { appid: { name: ... } }
            if (d[appid]) {
              next[appid] = d[appid];
            }
          });
          return next;
        });
      })
      .catch(console.error);

  }, [data?.shared]);

  function checkCategory(details, filterCat) {
    if (filterCat === "all") return true;
    if (!details) return false;

    // Check Genres
    if (details.genres?.some(g => g.description === filterCat)) return true;

    // Check Categories
    if (details.categories?.some(c => c.description === filterCat)) return true;

    return false;
  }

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 320 && !data && !loading);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data, loading]);

  // Check Premium Status when user1 changes
  useEffect(() => {
    const mainUser = users[0];
    if (!mainUser || mainUser.length < 17) {
      setIsPremium(false);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/check-premium?steamid=${encodeURIComponent(mainUser)}`)
        .then(r => r.json())
        .then(d => setIsPremium(d.isPremium))
        .catch(() => setIsPremium(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [users[0]]); // Dependencies: only re-check if first user changes

  useEffect(() => {
    if (!highlightForm) return;
    const t = setTimeout(() => setHighlightForm(false), 800);
    return () => clearTimeout(t);
  }, [highlightForm]);

  function validateInput(id) {
    if (!id) return true; // allow blanks
    const allowed =
      /^(https?:\/\/)?(www\.)?steamcommunity\.com\/(id|profiles)\/[^\/]+\/?$|^\d{17}$|^[a-zA-Z0-9_-]{2,32}$/;
    return allowed.test(id.trim());
  }

  async function handleCompare(e, usersOverride = null) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setData(null);

    // Use override if provided (for presets), otherwise use state
    const currentUsers = usersOverride || users;

    const validUsers = currentUsers.filter(u => u && u.trim());
    if (validUsers.length < 2) {
      setError("Please enter at least two valid Steam IDs or URLs.");
      return;
    }

    // Basic format validation
    for (const u of validUsers) {
      if (!validateInput(u)) {
        setError(`Invalid Steam ID/URL: ${u}`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: currentUsers }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to fetch data");
      }
      const json = await res.json();
      setData(json);

      // expand Shared by default on first load
      setExpanded({ shared: true, others: {} });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- tiny UI helpers (unchanged) ---------- */
  const Hours = ({ mins }) => (
    <span className="text-xs text-gray-400">{Math.round((mins || 0) / 60)} hrs</span>
  );

  const Avatar = ({ src, alt }) =>
    src ? (
      <img
        src={src}
        alt={alt || ""}
        className="h-6 w-6 rounded-full ring-1 ring-white/20 object-cover"
      />
    ) : null;

  function SkeletonCard() {
    return (
      <div className="rounded-lg bg-white/10 p-2 animate-pulse">
        <div className="h-[87px] w-full bg-white/10 rounded mb-2"></div>
        <div className="h-3 w-3/4 bg-white/10 rounded"></div>
      </div>
    );
  }

  // Dynamic shared hours helper
  const SharedHoursRow = (g) => {
    if (!g.playtimes) return null;
    const parts = [];
    Object.entries(g.playtimes).forEach(([steamid, minutes], i) => {
      if (i > 0) parts.push(<span key={`sep-${i}`}> | </span>);
      parts.push(<Hours key={steamid} mins={minutes} />);
    });
    return <p className="text-xs text-gray-400">{parts}</p>;
  };

  function HeaderChip({ color, avatar, label, count }) {
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10`}>
        {avatar && <img src={avatar} alt="" className="h-6 w-6 rounded-full ring-1 ring-white/20" />}
        <span className={`font-medium`} style={{ color }}>{label}</span>
        <span className="text-xs px-2 py-[2px] rounded-full bg-white/10">{count}</span>
      </span>
    );
  }

  /* ---------- render ---------- */
  return (
    <main className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">

      {/* Radial background only on landing (full width) */}
      {!data && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-70"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
          }}
        />
      )}

      {/* Content Wrapper (constrained) */}
      <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">

        {/* ---------- HERO (spruced) ---------- */}
        {/* LANDING (hero + form). Results logic stays untouched */}
        {!data && (
          <>
            {/* hero */}
            <header className="w-full text-center pt-16 sm:pt-24">
              <h1 className="text-[44px] sm:text-6xl md:text-7xl font-extralight leading-[1.08] tracking-[-0.02em]
                     bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                Compare Steam libraries instantly
              </h1>
              <p className="mt-4 text-[15px] sm:text-lg text-gray-300 max-w-2xl mx-auto">
                Find shared games, uncover unique titles, and plan your next co-op adventure in seconds.
              </p>
              <div className="mt-6 h-px w-28 mx-auto bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </header>

            {/* form card */}
            <div
              ref={formContainerRef}
              className={`w-full max-w-3xl mx-auto mt-10 sm:mt-12 rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-xl shadow-black/20 p-6 sm:p-8
              ${highlightForm ? "ring-2 ring-blue-500/60 animate-[pulse_0.8s_ease-out_1]" : ""}
              scroll-mt-24 sm:scroll-mt-36`}
            >
              <CleanDataEntryForm
                users={users}
                setUsers={setUsers}
                loading={loading}
                handleCompare={handleCompare}
                setShowHelp={setShowHelp}
                firstInputRef={firstInputRef}
                formRef={formRef}
                SteamLoginButton={SteamLoginButton}
                FriendPickerBridge={FriendPickerBridge}
                isPremium={isPremium}
                isLoggedIn={!!steamid}
                userName={searchParams.get("name")}
                userAvatar={searchParams.get("avatar")}
              />
            </div>


            {/* Panels below form */}

            <FeatureDemoSection />
            <HighlightsSection />

            <ModernFAQSection />
          </>
        )}

        {/* RESULTS HEADER */}
        {data && !loading && (
          <header className="w-full text-center mt-4 mb-10">
            <h1 className="font-extralight leading-[1.1] tracking-[-0.02em]
                        text-[42px] sm:text-6xl md:text-7xl
                        bg-gradient-to-r from-white via-white/90 to-white/70
                        bg-clip-text text-transparent drop-shadow-sm">
              We Both Play
            </h1>

            <p className="mt-3 text-base sm:text-lg text-gray-300">
              Here’s what you can play <span className="text-blue-400 font-medium">together.</span>
            </p>

            <div className="mt-4 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </header>
        )}

        {/* ---------- sticky participants bar ---------- */}
        {data && (
          <div className="sticky top-4 z-10 mb-4 self-start flex gap-4 items-center">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              {data.profiles && data.profiles.map((p, i) => (
                <img
                  key={p.steamid}
                  src={p.avatar}
                  alt={p.username}
                  title={p.username}
                  className="h-7 w-7 rounded-full ring-1 ring-white/20"
                />
              ))}
              <span className="text-sm text-gray-300 ml-1">
                {data.profiles?.length} Players
              </span>
            </div>
          </div>
        )}

        {/* ---------- loading skeletons (unchanged) ---------- */}
        {loading && (
          <div className="w-full mt-6 space-y-6">
            {[...Array(3)].map((_, s) => (
              <div key={s} className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-2">
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------- results (completely unchanged) ---------- */}
        {data && !loading && (
          <div className="w-full mt-6 space-y-6">

            {/* --- Results Section --- */}
            <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Preset Manager at Top of Results for Easy Saving */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </div>
                <PresetManager
                  users={users}
                  setUsers={setUsers}
                  onSelect={(newUsers) => handleCompare(null, newUsers)} // Trigger compare on load
                />
              </div>

              {/* Shared Games Card */}
              <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-400">
                    <HeaderChip
                      color="#60A5FA"
                      avatar={null}
                      label="Shared Games"
                      count={
                        filters.category === "all"
                          ? (data.shared?.length || 0)
                          : (data.shared?.filter(g => {
                            const details = gameDetails[g.appid];
                            if (!details) return false; // hide if loading? or show? let's hide to be safe or show all is safer?
                            // actually if details missing, we can't filter.
                            // if filter is active, and no details, maybe false?
                            return checkCategory(details, filters.category);
                          }).length || 0)
                      }
                    />
                  </h2>
                  <button
                    className="text-sm text-gray-400 hover:text-blue-400"
                    onClick={() => setExpanded((p) => ({ ...p, shared: !p.shared }))}
                  >
                    {expanded.shared ? "▾ Hide" : "▸ Show"}
                  </button>
                </div>

                {/* Filter Bar */}
                <FilterBar
                  isPremium={isPremium}
                  onFilterChange={setFilters}
                  availableCategories={availableCategories}
                />

                {expanded.shared && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                    {(data.shared || [])
                      .filter(g => {
                        if (filters.category === "all") return true;
                        const details = gameDetails[g.appid];
                        if (!details) return false;
                        return checkCategory(details, filters.category);
                      })
                      .map((g, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                        >
                          <a
                            href={getAffiliateLink(g.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            title="Find cheap key on CDKeys"
                          >
                            <img
                              src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                              alt={`${g.name} cover art`}
                              className="rounded mb-2"
                              loading="lazy"
                            />
                          </a>
                          <div className="flex items-center justify-between gap-2 w-full px-1 mb-1">
                            {/* Tags if available? */}
                            {gameDetails[g.appid]?.categories?.find(c => c.description === "Multi-player") && (
                              <span className="text-[9px] bg-blue-900/40 text-blue-300 px-1 rounded border border-blue-500/20">MP</span>
                            )}
                            {gameDetails[g.appid]?.categories?.find(c => c.description === "Co-op") && (
                              <span className="text-[9px] bg-green-900/40 text-green-300 px-1 rounded border border-green-500/20">Co-op</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                            {g.name}
                          </p>
                          {SharedHoursRow(g)}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Dynamic "Only X" Sections */}
              {data.profiles && data.profiles.map((profile, i) => {
                // Skip if no unique games (optional) or render empty?
                // The API returns unique map keyed by SteamID.
                const uniqueGames = data.unique?.[profile.steamid] || [];
                if (uniqueGames.length === 0) return null;

                // Colors cycle
                const colors = ["#34D399", "#F472B6", "#FBBF24", "#A78BFA", "#EC4899", "#8B5CF6", "#10B981", "#EF4444"];
                const color = colors[i % colors.length];
                const colorClass = `text-[${color}]`; // logic for tailwind might need safelist, stick to dynamic inline style or map

                const isOpen = expanded.others[profile.steamid] ?? false;

                return (
                  <div key={profile.steamid} className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold" style={{ color }}>
                        <HeaderChip
                          color={color}
                          avatar={profile.avatar}
                          label={`Only ${profile.username || "User " + (i + 1)}`}
                          count={uniqueGames.length}
                        />
                      </h2>
                      <button
                        className="text-sm text-gray-400 hover:text-white"
                        onClick={() => setExpanded(p => ({
                          ...p,
                          others: { ...p.others, [profile.steamid]: !isOpen }
                        }))}
                      >
                        {isOpen ? "▾ Hide" : "▸ Show"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                        {uniqueGames.map((g, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                          >
                            <a
                              href={getAffiliateLink(g.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                              title="Find cheap key on CDKeys"
                            >
                              <img
                                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                                alt={`${g.name} cover art`}
                                className="rounded mb-2"
                                loading="lazy"
                              />
                            </a>
                            <div className="flex items-center justify-between gap-2 w-full px-1 mb-1">
                              <span className="text-[10px] font-semibold text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/20 truncate">
                                {g.name}
                              </span>
                              <a
                                href={getAffiliateLink(g.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded shadow transition-colors shrink-0"
                                title="Find cheap key on CDKeys"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                              </a>
                            </div>
                            <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                              {g.name}
                            </p>
                            <Hours mins={g.playtime_forever} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => setData(null)}
                className="mt-10 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition"
              >
                Compare Again
              </button>

              <div className="mt-4 text-center">
                <a
                  href="https://ko-fi.com/F1F11N6SO4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Support me on Ko-fi
                </a>
              </div>
            </div>
          </div>
        )}
      </div>





      {/* Help modal (unchanged) */}
      {
        showHelp && !data && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#1b1d1f] p-6 rounded-2xl max-w-md text-left shadow-xl border border-white/10">
              <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Finding your Steam64 ID
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                Open your Steam client or go to your Steam profile in a browser.
                Click on your profile name and look for a number like this in the URL:
                <img
                  src="/steam-id-example.png"
                  alt="Steam ID example showing URL with ID"
                  className="w-full"
                />
              </p>
              <div className="bg-gray-100 dark:bg-white/10 text-sm rounded-lg p-3 mb-3 font-mono text-gray-800 dark:text-gray-100">
                76561198881424318
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                You can also paste your full Steam profile link — we’ll handle it automatically.
              </p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* floating header that smooth-scrolls back to the form */}
      {
        showSticky && !data && !loading && (
          <div className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
            <div className="mx-auto max-w-6xl px-3 sm:px-6">
              <div className="mt-3 flex items-center justify-between gap-3
                            rounded-2xl border border-white/10
                            bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/30
                            shadow-lg shadow-black/20 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <span className="hidden sm:inline">Wanna know what you both play?</span>
                  <span className="sm:hidden">Compare</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setHighlightForm(true);
                    setTimeout(() => firstInputRef.current?.focus(), 450);
                  }}
                  className="px-5 py-2 rounded-xl font-medium
                           bg-gradient-to-r from-blue-500 to-blue-600
                           hover:from-blue-400 hover:to-blue-500
                           text-white shadow-lg shadow-blue-500/20
                           transition-all duration-150 active:translate-y-px"
                >
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        )
      }


      <SiteFooter />
    </main >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
