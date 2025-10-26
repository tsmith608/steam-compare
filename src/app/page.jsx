"use client";
import { useMemo, useState, useEffect, useRef } from "react";

/* ---------- Landing-only UI blocks  ---------- */

/** quick “legit” feature blurbs */
function FeatureHighlights() {
  const items = [
    { k: "Fast", v: "Instant results. No sign-in." },
    { k: "Accurate", v: "Pulls directly from Steam public data." },
    { k: "Private", v: "We don’t store your IDs or libraries." },
    { k: "Flexible", v: "Works with IDs, vanity URLs, or full profile links." },
  ];
  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.k} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">{it.k}</span> — {it.v}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** tiny logos/compat strip */
function WorksWithStrip() {
  const items = [
    { label: "Steam", img: "https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg" },
    { label: "Windows", img: "https://upload.wikimedia.org/wikipedia/commons/4/48/Windows_logo_-_2012.svg" },
    { label: "macOS", img: "https://upload.wikimedia.org/wikipedia/commons/3/30/MacOS_logo.svg" },
  ];
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <img src={it.img} alt={it.label} className="h-5 w-auto opacity-80" />
            <span className="text-xs text-gray-400">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** short FAQ */
function FAQSection() {
  const faqs = [
    {
      q: "Do profiles need to be public?",
      a: "Yes. Steam must allow public access to game details for us to read libraries.",
    },
    {
      q: "What profile formats do you accept?",
      a: "17-digit SteamID64, vanity URLs (steamcommunity.com/id/Name), or full profile links.",
    },
    {
      q: "Do you store my data?",
      a: "No. Requests are processed in real-time and not saved.",
    },
  ];
  return (
    <section className="mt-10 text-left">
      <h3 className="text-gray-200 font-medium mb-3">FAQ</h3>
      <div className="space-y-3">
        {faqs.map((x, i) => (
          <details key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer text-sm text-gray-200">{x.q}</summary>
            <p className="mt-2 text-sm text-gray-400">{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* Autoplaying, in-view looping clip with mobile-safe flags */
function Clip({ webm, mp4, poster, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // play/pause only when visible
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? el.play().catch(()=>{}) : el.pause())),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover rounded-[14px]"
      muted
      playsInline
      loop
      preload="metadata"
      poster={poster}
      aria-label={label}
    >
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" />}
    </video>
  );
}

function BigFeaturePanels() {
  const items = [
    {
      title: "Paste profiles",
      subtitle: "Drop in Steam64 IDs or full profile links. Custom vanity URLs work too.",
      // add videos; keep image as fallback
      video: {
        mp4:  "/panels/paste-profiles.mp4",
        webm: "/panels/paste-profiles.webm",
        poster: "/panels/paste-profiles.poster.jpg",
      },
      imageSrc: "/panels/paste-profiles.png",
      imageAlt: "Pasting Steam profiles",
    },
    {
      title: "Compare instantly",
      subtitle: "Compare playtime with up to three of your friends on titles you all own.",
      video: {
        mp4:  "/panels/compare-instantly.mp4", 
        webm: "/panels/compare-instantly.webm",
        poster: "/panels/compare-instantly.poster.jpg",
      },
      imageSrc: "/panels/compare-instantly.png",
      imageAlt: "Instant comparison",
    },
    {
      title: "Plan your session",
      subtitle: "See what games are exclusively owned by each of your friends.",
      video: {
        mp4:  "/panels/plan-session.mp4",
        webm: "/panels/plan-session.webm",
        poster: "/panels/plan-session.poster.jpg",
      },
      imageSrc: "/panels/plan-session.png",
      imageAlt: "Planning a session",
    },
    {
      title: "Click through to Steam",
      subtitle: "Every card links to the Steam store page for your convenience.",
      video: {
        mp4:  "/panels/open-store.mp4",
        webm: "/panels/open-store.webm",
        poster: "/panels/open-store.poster.jpg",
      },
      imageSrc: "/panels/open-store.png",
      imageAlt: "Open Steam store",
    },
  ];

  return (
    <section
     id="features"
     className="mt-14 sm:mt-16 px-3 sm:px-4 md:px-0 scroll-mt-32 sm:scroll-mt-40"
    >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-y-12">
      {items.map((it, i) => (
        <article key={i} className="group text-left px-1 sm:px-2 md:px-1">
          <h3 className="text-[18px] sm:text-xl font-semibold text-gray-100">{it.title}</h3>
          <p className="mt-1 text-sm sm:text-base text-gray-400 max-w-prose">{it.subtitle}</p>

          <div className="mt-4 sm:mt-5 rounded-[22px] p-[2px] bg-gradient-to-br from-white/10 via-white/5 to-transparent
                          transition-transform duration-150 group-hover:-translate-y-0.5">
            <div className="rounded-[20px] border border-white/10 bg-white/5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="relative rounded-[18px] m-2 bg-gradient-to-b from-white/[0.08] to-white/[0.02] ring-1 ring-white/10 overflow-hidden">
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9]">
                  {it.video ? (
                    <Clip webm={it.video.webm} mp4={it.video.mp4} poster={it.video.poster} label={it.imageAlt} />
                  ) : it.imageSrc ? (
                    <img
                      src={it.imageSrc}
                      alt={it.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover rounded-[14px]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center rounded-[14px] border border-dashed border-white/15 text-gray-400 text-sm">
                      Add media here
                    </div>
                  )}
                </div>

                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/[0.06] blur-2xl"
                />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

}



export default function Home() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [user3, setUser3] = useState("");
  const [user4, setUser4] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const [expanded, setExpanded] = useState({
    shared: false,
    onlyYou: false,
    onlyFriend1: false,
    onlyFriend2: false,
    onlyFriend3: false,
  });

  // NEW: refs + sticky header state
  const formContainerRef = useRef(null);
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);
  const [highlightForm, setHighlightForm] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 320 && !data && !loading);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data, loading]);

  useEffect(() => {
    if (!highlightForm) return;
    const t = setTimeout(() => setHighlightForm(false), 800);
    return () => clearTimeout(t);
  }, [highlightForm]);

  function validateInput(id) {
    if (!id) return true; // allow blanks for optional friends
    const allowed =
      /^(https?:\/\/)?(www\.)?steamcommunity\.com\/(id|profiles)\/[^\/]+\/?$|^\d{17}$|^[a-zA-Z0-9_-]{2,32}$/;
    return allowed.test(id.trim());
  }

  async function handleCompare(e) {
    e.preventDefault();
    setError("");
    setData(null);

    if (!validateInput(user1) || !validateInput(user2)) {
      setError("Please enter valid Steam64 IDs or profile URLs for the first two fields.");
      return;
    }
    if (!validateInput(user3) || !validateInput(user4)) {
      setError("Friend 2 or Friend 3 have invalid IDs.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user1, user2, user3, user4 }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to fetch data");
      }
      const json = await res.json();
      setData(json);

      // expand Shared by default on first load
      setExpanded((p) => ({ ...p, shared: true }));
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

  const SharedHoursRow = (g) => {
    const parts = [<Hours key="u1" mins={g.user1_playtime} />];
    if (data?.usernames?.[1]) parts.push(<span key="s1"> | </span>, <Hours key="u2" mins={g.user2_playtime} />);
    if (data?.usernames?.[2]) parts.push(<span key="s2"> | </span>, <Hours key="u3" mins={g.user3_playtime} />);
    if (data?.usernames?.[3]) parts.push(<span key="s3"> | </span>, <Hours key="u4" mins={g.user4_playtime} />);
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
    <main className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 py-20 text-center relative">

      {/* Radial background only on landing */}
      {!data && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
          }}
        />
      )}

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
      <form
        ref={formRef}
        onSubmit={(e) => {
          // quick visibility check
          console.log("[submit] compare clicked");
          handleCompare(e);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* You */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M10 14a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M14 10a5 5 0 0 1 0 7L12.5 18.5a5 5 0 1 1-7-7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              ref={firstInputRef}
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              placeholder="Your Steam64 ID or Profile URL"
              className="w-full pl-9 pr-3 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            <div className="mt-1.5 text-[11px] text-gray-400">Example: 7656119… or steamcommunity.com/id/you</div>
          </div>

          {/* Friend 1 */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 19a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              placeholder="Friend 1 Steam64 ID or Profile URL"
              className="w-full pl-9 pr-3 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            <div className="mt-1.5 text-[11px] text-gray-400">They must have “Game details” set to Public.</div>
          </div>

          {/* Friend 2 (optional) */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 19a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              value={user3}
              onChange={(e) => setUser3(e.target.value)}
              placeholder="Friend 2 (optional)"
              className="w-full pl-9 pr-3 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Friend 3 (optional) */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 19a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              value={user4}
              onChange={(e) => setUser4(e.target.value)}
              placeholder="Friend 3 (optional)"
              className="w-full pl-9 pr-3 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-2xl font-medium
                       bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
                       text-white shadow-xl shadow-blue-500/20 transition-all duration-150
                       disabled:opacity-60 active:translate-y-px"
          >
            {loading ? "Loading..." : "Compare Now"}
          </button>
        </div>
      </form>

      {/* Help button (opens modal) */}
      <div className="mt-3 text-center">
        <button
          onClick={() => setShowHelp(true)}
          className="text-sm text-gray-400 hover:text-blue-400 underline underline-offset-4 decoration-white/20"
          type="button"
        >
          How to find your Steam64 ID?
        </button>
      </div>

      {/* reassurance */}
      <p className="mt-4 text-xs sm:text-sm text-gray-400 text-center">
        We don’t store your IDs or libraries — comparisons run in real time using public data.
      </p>
    </div>

    {/* Panels below form */}
    
    <BigFeaturePanels />
    <FeatureHighlights />
    <WorksWithStrip />
    <FAQSection />
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

      {/* ---------- sticky participants bar (unchanged) ---------- */}
      {data && (
        <div className="sticky top-4 z-10 mb-4 self-start">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
            {[0,1,2,3].map(i =>
              data.avatars?.[i] ? (
                <img key={i} src={data.avatars[i]} alt={data.usernames?.[i] ?? ""} className="h-7 w-7 rounded-full ring-1 ring-white/20" />
              ) : null
            )}
            <span className="text-sm text-gray-300 ml-1">
              {(data.usernames || []).filter(Boolean).join(" • ")}
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
          {/* Shared */}
          <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-400">
                <HeaderChip
                  color="#60A5FA"
                  avatar={null}
                  label="Shared Games"
                  count={data.shared?.length || 0}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                {(data.shared || []).map((g, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                  >
                    <a
                      href={`https://store.steampowered.com/app/${g.appid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      title="Open in Steam"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                        alt={`${g.name} cover art`}
                        className="rounded mb-2"
                        loading="lazy"
                      />
                    </a>
                    <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                      {g.name}
                    </p>
                    {SharedHoursRow(g)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Only You */}
          <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-green-400">
                <HeaderChip
                  color="#34D399"
                  avatar={data.avatars?.[0]}
                  label={`Only ${data.usernames?.[0] ?? "You"}`}
                  count={data.onlyYou?.length || 0}
                />
              </h2>
              <button
                className="text-sm text-gray-400 hover:text-green-400"
                onClick={() => setExpanded((p) => ({ ...p, onlyYou: !p.onlyYou }))}
              >
                {expanded.onlyYou ? "▾ Hide" : "▸ Show"}
              </button>
            </div>

            {expanded.onlyYou && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                {(data.onlyYou || []).map((g, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                  >
                    <a
                      href={`https://store.steampowered.com/app/${g.appid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      title="Open in Steam"
                    >
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                        alt={`${g.name} cover art`}
                        className="rounded mb-2"
                        loading="lazy"
                      />
                    </a>
                    <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                      {g.name}
                    </p>
                    <Hours mins={g.playtime_forever} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Only Friend 1 */}
          {data.usernames?.[1] && (
            <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-pink-400">
                  <HeaderChip
                    color="#F472B6"
                    avatar={data.avatars?.[1]}
                    label={`Only ${data.usernames?.[1]}`}
                    count={data.onlyFriend1?.length || 0}
                  />
                </h2>
                <button
                  className="text-sm text-gray-400 hover:text-pink-400"
                  onClick={() => setExpanded((p) => ({ ...p, onlyFriend1: !p.onlyFriend1 }))}
                >
                  {expanded.onlyFriend1 ? "▾ Hide" : "▸ Show"}
                </button>
              </div>

              {expanded.onlyFriend1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                  {(data.onlyFriend1 || []).map((g, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                    >
                      <a
                        href={`https://store.steampowered.com/app/${g.appid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                        title="Open in Steam"
                      >
                        <img
                          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                          alt={`${g.name} cover art`}
                          className="rounded mb-2"
                          loading="lazy"
                        />
                      </a>
                      <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                        {g.name}
                      </p>
                      <Hours mins={g.playtime_forever} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Only Friend 2 */}
          {data.usernames?.[2] && (
            <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-yellow-400">
                  <HeaderChip
                    color="#FBBF24"
                    avatar={data.avatars?.[2]}
                    label={`Only ${data.usernames?.[2]}`}
                    count={data.onlyFriend2?.length || 0}
                  />
                </h2>
                <button
                  className="text-sm text-gray-400 hover:text-yellow-400"
                  onClick={() => setExpanded((p) => ({ ...p, onlyFriend2: !p.onlyFriend2 }))}
                >
                  {expanded.onlyFriend2 ? "▾ Hide" : "▸ Show"}
                </button>
              </div>

              {expanded.onlyFriend2 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                  {(data.onlyFriend2 || []).map((g, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                    >
                      <a
                        href={`https://store.steampowered.com/app/${g.appid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block" title="Open in Steam"
                      >
                        <img
                          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                          alt={`${g.name} cover art`}
                          className="rounded mb-2"
                          loading="lazy"
                        />
                      </a>
                      <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                        {g.name}
                      </p>
                      <Hours mins={g.playtime_forever} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Only Friend 3 */}
          {data.usernames?.[3] && (
            <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-purple-400">
                  <HeaderChip
                    color="#A78BFA"
                    avatar={data.avatars?.[3]}
                    label={`Only ${data.usernames?.[3]}`}
                    count={data.onlyFriend3?.length || 0}
                  />
                </h2>
                <button
                  className="text-sm text-gray-400 hover:text-purple-400"
                  onClick={() => setExpanded((p) => ({ ...p, onlyFriend3: !p.onlyFriend3 }))}
                >
                  {expanded.onlyFriend3 ? "▾ Hide" : "▸ Show"}
                </button>
              </div>

              {expanded.onlyFriend3 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                  {(data.onlyFriend3 || []).map((g, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center bg-white/10 p-2 rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                    >
                      <a
                        href={`https://store.steampowered.com/app/${g.appid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block" title="Open in Steam"
                      >
                        <img
                          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                          alt={`${g.name} cover art`}
                          className="rounded mb-2"
                          loading="lazy"
                        />
                      </a>
                      <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                        {g.name}
                      </p>
                      <Hours mins={g.playtime_forever} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setData(null)}
            className="mt-10 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition"
          >
            Compare Again
          </button>
        </div>
      )}

      {/* Help modal (unchanged) */}
      {showHelp && !data && (
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
      )}

      {/* floating header that smooth-scrolls back to the form */}
      {showSticky && !data && !loading && (
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
      )}
    </main>
  );
}
