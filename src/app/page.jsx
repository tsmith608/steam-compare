"use client";
import { useMemo, useState } from "react";

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
    <main className="flex flex-col items-center justify-center w-full max-w-6xl px-6 py-20 text-center relative">

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
      {!data && (
        <header className="text-center mb-10">
          <h1 className="text-6xl font-extralight tracking-tight drop-shadow-sm bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            We All Play
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Find your next group game in seconds.&nbsp;
            <span className="text-blue-400 font-medium">Less Searching. More Playing.</span>
          </p>
        </header>
      )}

      {/* ---------- FORM CARD (spruced, logic unchanged) ---------- */}
      {!data && (
        <>
          <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-xl shadow-black/20 p-5 sm:p-6">
            <form onSubmit={handleCompare}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* You */}
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                      <path d="M10 14a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 10a5 5 0 0 1 0 7L12.5 18.5a5 5 0 1 1-7-7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <input
                    value={user1}
                    onChange={(e) => setUser1(e.target.value)}
                    placeholder="Your Steam64 ID or Profile URL"
                    className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                  <div className="mt-1 text-[11px] text-gray-400">Example: 7656119… or https://steamcommunity.com/id/you</div>
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
                    className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                  <div className="mt-1 text-[11px] text-gray-400">They must have game details set to Public.</div>
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
                    className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                    className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-150 disabled:opacity-60 active:translate-y-px"
                >
                  {loading ? "Loading..." : "Compare"}
                </button>
              </div>
            </form>

            <div className="mt-3 text-center">
              <button
                onClick={() => setShowHelp(true)}
                className="text-sm text-gray-400 hover:text-blue-400 underline underline-offset-4 decoration-white/20"
                type="button"
              >
                How to find your Steam64 ID?
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </>
      )}
      {/* RESULTS HEADER */}
      {data && !loading && (
        <header className="w-full text-center mt-4 mb-10">
          <h1 className="font-extralight leading-[1.1] tracking-[-0.02em]
                        text-[42px] sm:text-6xl md:text-7xl
                        bg-gradient-to-r from-white via-white/90 to-white/70
                        bg-clip-text text-transparent drop-shadow-sm">
            We All Play
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
    </main>
  );
}
