"use client";
import { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SteamLoginButton from "./components/SteamLoginButton";
import FriendPickerBridge from "./components/FriendPickerBridge";
import CleanDataEntryForm from "./components/CleanDataEntryForm";
import FeatureDemoSection from "./components/FeatureDemoSection";
import HighlightsSection from "./components/HighlightsSection";
import FilterBar from "./components/FilterBar";
import GoogleAdSense from "./components/GoogleAdSense";
import PresetManager from "./components/PresetManager";
import GameRoulette from "./components/GameRoulette";
import SquadStats from "./components/SquadStats";
import BacklogSlayer from "./components/BacklogSlayer";
import SquadActivity from "./components/SquadActivity";

import ModernFAQSection from "./components/ModernFAQSection";
import TestimonialsSection from "./components/TestimonialsSection";

/* ---------- Landing-only UI blocks  ---------- */




const getAffiliateLink = (gameName) => {
  const encoded = encodeURIComponent(gameName);
  // CDKeys Search URL with affiliate tracking (placeholder ID 'steamcompare')
  // Using CDKeys avoids "account selling" risks common on G2A.
  return `https://www.cdkeys.com/catalogsearch/result/?q=${encoded}&utm_source=steamcompare&utm_medium=affiliate&utm_campaign=search`;
};

function HomeContent() {
  const searchParams = useSearchParams();

  // Auth State (Persisted)
  const [authState, setAuthState] = useState({
    steamid: searchParams.get("steamid"),
    name: searchParams.get("name"),
    avatar: searchParams.get("avatar")
  });

  const [users, setUsers] = useState(["", "", "", ""]);
  // Let's start with 4 to match original look, but make it dynamic.
  const [data, setData] = useState(null);

  // Handle Persistence & URL Params
  useEffect(() => {
    const urlId = searchParams.get("steamid");
    const urlName = searchParams.get("name");
    const urlAvatar = searchParams.get("avatar");
    const multiIds = searchParams.getAll("steamid");

    if (urlId) {
      // 1. We have URL params -> Save to session & Update State
      sessionStorage.setItem("wb.steamid", urlId);
      if (urlName) sessionStorage.setItem("wb.username", urlName);
      if (urlAvatar) sessionStorage.setItem("wb.avatar", urlAvatar);

      setAuthState({ steamid: urlId, name: urlName, avatar: urlAvatar });

      // Handle multi-ID population (for quick links)
      if (multiIds.length > 0) {
        const newUsers = ["", "", "", ""];
        multiIds.forEach((id, i) => { if (i < 4) newUsers[i] = id; });
        setUsers(newUsers);
        // Only trigger compare if multiple IDs and it looks like a shared link (not just a login redirect)
        if (multiIds.length > 1) {
          handleCompare(null, newUsers);
        }
      } else {
        // Just single login, ensure user[0] is set
        setUsers(prev => {
          const n = [...prev];
          n[0] = urlId;
          return n;
        });
      }

    } else {
      // 2. No URL params -> Try to restore from Session
      const sId = sessionStorage.getItem("wb.steamid");
      const sName = sessionStorage.getItem("wb.username");
      const sAvatar = sessionStorage.getItem("wb.avatar");

      if (sId) {
        setAuthState({ steamid: sId, name: sName, avatar: sAvatar });
        // Ensure inputs are populated
        setUsers(prev => {
          if (prev[0]) return prev; // Don't overwrite if user typed something? 
          // Actually, if we are restoring session, we should probably set user[0]
          const n = [...prev];
          n[0] = sId;
          return n;
        });
      }
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userTier, setUserTier] = useState(null);

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
        .then(d => {
          setIsPremium(d.isPremium);
          setUserTier(d.tier);
        })
        .catch(() => {
          setIsPremium(false);
          setUserTier(null);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [users[0]]);

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
      <div className="rounded-lg bg-white/10 p-2 animate-pulse" aria-busy="true" aria-label="Loading game card">
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

  function HeaderChip({ color, avatar, label, count, tier }) {
    const isPremiumTier = tier === 'Hacker' || tier === 'Pro';
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10`}>
        {avatar && (
          <div className="relative">
            <img src={avatar} alt="" className="h-6 w-6 rounded-full ring-1 ring-white/20" />
            {isPremiumTier && (
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center border border-black shadow-sm ${tier === 'Hacker' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
            )}
          </div>
        )}
        <span className={`font-medium`} style={{ color }}>{label}</span>
        {isPremiumTier && (
          <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${tier === 'Hacker' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {tier}
          </span>
        )}
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

              <div className="mt-8 flex justify-center">
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1472792413499293779&permissions=18432&scope=bot%20applications.commands"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-[#5865F2]/25 group"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                  Add Bot to Server
                </a>
              </div>

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
                tier={userTier}

                isLoggedIn={!!authState.steamid}
                userName={authState.name}
                userAvatar={authState.avatar}
                currentSteamId={authState.steamid}
              />
            </div>


            {/* Panels below form */}

            <FeatureDemoSection />
            <HighlightsSection />
            <TestimonialsSection />

            <ModernFAQSection />

            {/* --- NEW: How It Works Section (AdSense Compliance) --- */}
            <section className="w-full max-w-4xl mx-auto py-20 border-t border-white/5">
              <div className="text-left space-y-12">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 italic">
                    How <span className="text-blue-500 font-bold not-italic font-sans">We Both Play</span> Works
                  </h2>
                  <p className="text-gray-400 max-w-xl mx-auto">
                    The ultimate tool for Steam library comparison and multiplayer discovery.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">1</span>
                      Privacy-First Data Sync
                    </h3>
                    <p className="text-[15px] text-gray-400 leading-relaxed">
                      We use the official Steam Web API to fetch publicly available data from the profiles you provide. We never ask for your password or store your library data permanently. Our tool respects your privacy while providing instant results.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">2</span>
                      Smart Comparison Engine
                    </h3>
                    <p className="text-[15px] text-gray-400 leading-relaxed">
                      Our engine cross-references thousands of games in seconds. It doesn't just look for matches; it analyzes tags, categories, and playtime to suggest what you should play next with your squad.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">3</span>
                      Beyond Just "Shared Games"
                    </h3>
                    <p className="text-[15px] text-gray-400 leading-relaxed">
                      With features like <strong>Backlog Slayer</strong> and <strong>Game Roulette</strong>, we help you make decisions. Use our "Only X" feature to see what games your friends are missing, making it the perfect tool for gifting.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm">4</span>
                      Multi-Platform Support
                    </h3>
                    <p className="text-[15px] text-gray-400 leading-relaxed">
                      Whether you use our web platform for deep dives or our <strong>Discord Bot</strong> for quick checks during voice chat, We Both Play is designed to fit into your existing gaming workflow.
                    </p>
                  </div>
                </div>
              </div>
            </section>
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
                <div key={p.steamid} className="relative group">
                  <img
                    src={p.avatar}
                    alt={p.username}
                    title={`${p.username} (${p.tier})`}
                    className={`h-7 w-7 rounded-full ring-1 ${p.tier === 'Pro' ? 'ring-amber-500/50' : (p.tier === 'Hacker' ? 'ring-blue-500/50' : 'ring-white/20')}`}
                  />
                  {(p.tier === 'Hacker' || p.tier === 'Pro') && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center border border-black shadow-sm ${p.tier === 'Pro' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    </div>
                  )}
                </div>
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
          <div className="w-full mt-6 flex flex-col items-center">
            {/* Main Content Area with Absolute Margin Ads */}
            <div className="w-full relative max-w-6xl mx-auto flex flex-col items-center">

              {/* Left Margin Ad - Absolutely positioned to avoid "smooshing" */}
              <aside className="hidden 2xl:block absolute -left-48 top-24 w-40">
                <div className="p-2 border border-white/5 rounded-xl bg-white/[0.02]">
                  <p className="text-[8px] text-gray-600 uppercase tracking-widest text-center mb-2">Advertisement</p>
                  <GoogleAdSense isPremium={isPremium} slot="8627342981" />
                </div>
              </aside>

              <div className="w-full space-y-6">
                {/* --- Results Section --- */}
                <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                  {/* Preset Manager at Top of Results for Easy Saving */}
                  <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-white/10 rounded-2xl px-6 py-3 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                    </div>
                    <PresetManager
                      users={users}
                      setUsers={setUsers}
                      onSelect={(newUsers) => handleCompare(null, newUsers)} // Trigger compare on load
                      currentSteamId={authState.steamid}
                      isPremium={isPremium}
                    />

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <BacklogSlayer users={users} isPremium={isPremium} />
                      <GameRoulette games={data.shared || []} />
                    </div>

                    <div className="mt-4">
                      <SquadActivity users={users} isPremium={isPremium} profiles={data.profiles || []} />
                    </div>
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
                    {expanded.shared && (
                      <>
                        <SquadStats sharedGames={data.shared || []} profiles={data.profiles || []} />

                        {/* Filter Bar */}
                        <FilterBar
                          isPremium={isPremium}
                          onFilterChange={setFilters}
                          availableCategories={availableCategories}
                          sharedGames={data.shared || []}
                          gameDetails={gameDetails}
                        />

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
                                  <div className="flex gap-1 overflow-hidden">
                                    {gameDetails[g.appid]?.categories?.find(c => c.description === "Multi-player") && (
                                      <span className="text-[9px] bg-blue-900/40 text-blue-300 px-1 rounded border border-blue-500/20">MP</span>
                                    )}
                                    {gameDetails[g.appid]?.categories?.find(c => c.description === "Co-op") && (
                                      <span className="text-[9px] bg-green-900/40 text-green-300 px-1 rounded border border-green-500/20">Co-op</span>
                                    )}
                                  </div>

                                  <a
                                    href={`steam://run/${g.appid}`}
                                    className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded shadow transition-colors shrink-0"
                                    title="Launch on Steam"
                                    aria-label={`Launch ${g.name} on Steam`}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </a>
                                </div>
                                <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                                  {g.name}
                                </p>
                                {SharedHoursRow(g)}
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Shared Wishlist Card */}
                  {data.sharedWishlist && data.sharedWishlist.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-2xl border border-blue-500/20 shadow-lg">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-purple-400">
                          <HeaderChip
                            color="#A78BFA"
                            avatar={null}
                            label="Shared Wishlist"
                            count={data.sharedWishlist.length}
                          />
                        </h2>
                        <p className="text-xs text-purple-300/60 font-medium uppercase tracking-widest hidden sm:block">You all want these</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {data.sharedWishlist.map((g, i) => (
                          <div key={i} className="flex flex-col items-center bg-white/5 p-2 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all">
                            <a href={getAffiliateLink(g.name)} target="_blank" rel="noopener noreferrer" className="block relative group">
                              <img
                                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                                alt={g.name}
                                className="rounded mb-2 opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                              <div className="absolute top-1 right-1 bg-purple-600 text-[8px] font-bold px-1 rounded shadow-lg">WANT</div>
                            </a>
                            <p className="text-xs font-medium text-gray-300 truncate w-full text-center" title={g.name}>{g.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gift Ideas / Wishlist Matches */}
                  {data.wishlistMatches && Object.values(data.wishlistMatches).some(m => m.length > 0) && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-400 uppercase tracking-[0.2em] text-center pt-8">🎁 Gifting Opportunities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.profiles?.map(p => {
                          const matches = data.wishlistMatches[p.steamid] || [];
                          if (matches.length === 0) return null;
                          return (
                            <div key={p.steamid} className="bg-white/5 p-5 rounded-2xl border border-white/10">
                              <div className="flex items-center gap-3 mb-4">
                                <img src={p.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-blue-500/30" />
                                <div>
                                  <span className="text-sm font-bold text-white block">{p.username} wants...</span>
                                  <span className="text-[10px] text-gray-500 uppercase">And others in the squad own them!</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {matches.slice(0, 5).map(m => (
                                  <div key={m.appid} className="flex items-center justify-between gap-3 bg-white/5 p-2 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${m.appid}/capsule_231x87.jpg`} className="h-8 rounded" alt="" />
                                      <span className="text-xs font-medium text-gray-200 truncate">{m.name}</span>
                                    </div>
                                    <a
                                      href={getAffiliateLink(m.name)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                    >
                                      BUY GIFT
                                    </a>
                                  </div>
                                ))}
                                {matches.length > 5 && <p className="text-[10px] text-gray-600 text-center italic">+{matches.length - 5} more items</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                              tier={profile.tier}
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
                                    aria-label={`Find cheap key for ${g.name} on CDKeys`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                                  </a>
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
                    );
                  })}

                  <button
                    onClick={() => setData(null)}
                    className="mt-10 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition"
                  >
                    Compare Again
                  </button>

                  <div className="mt-4 text-center">
                    <Link
                      href="/upgrade"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-150"
                    >
                      Go Premium
                    </Link>
                  </div>
                </div>

                <aside className="hidden 2xl:block absolute -right-48 top-24 w-40">
                  <div className="p-2 border border-white/5 rounded-xl bg-white/[0.02]">
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest text-center mb-2">Advertisement</p>
                    <GoogleAdSense isPremium={isPremium} slot="8627342981" />
                  </div>
                </aside>

              </div>
            </div>
          </div>
        )}





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


      </div> {/* Closes Content Wrapper from 357 */}

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
