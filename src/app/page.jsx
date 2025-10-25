"use client";
import { useState } from "react";

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

    // Need at least two valid inputs
    if (!validateInput(user1) || !validateInput(user2)) {
      setError("Please enter valid Steam64 IDs or profile URLs for the first two fields.");
      return;
    }
    // Optional but if present must be valid
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Hours = ({ mins }) => (
    <span className="text-xs text-gray-400">{Math.round((mins || 0) / 60)} hrs</span>
  );

  return (
    <main className="flex flex-col items-center justify-center w-full max-w-6xl px-6 py-20 text-center relative">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extralight tracking-tight text-gray-900 dark:text-gray-100 drop-shadow-sm">
          We All Play
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Find your next group game in seconds.
          <span className="text-blue-500 font-medium"> Less Searching. More Playing.</span>
        </p>
        <div className="mt-3 h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
      </header>

      {!data && (
        <>
          <form
            onSubmit={handleCompare}
            className="flex flex-col sm:flex-row flex-wrap gap-4 w-full max-w-3xl justify-center mb-4"
          >
            <input
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              placeholder="Your Steam64 ID or Custom URL"
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-300/40 dark:border-white/10 bg-white/60 dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
              required
            />
            <input
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              placeholder="Friend 1 Steam64 ID or Custom URL"
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-300/40 dark:border-white/10 bg-white/60 dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
              required
            />
            <input
              value={user3}
              onChange={(e) => setUser3(e.target.value)}
              placeholder="Friend 2 (optional)"
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-300/40 dark:border-white/10 bg-white/60 dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
            />
            <input
              value={user4}
              onChange={(e) => setUser4(e.target.value)}
              placeholder="Friend 3 (optional)"
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-300/40 dark:border-white/10 bg-white/60 dark:bg-white/10 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-150 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Compare"}
            </button>
          </form>

          <button
            onClick={() => setShowHelp(true)}
            className="text-sm text-gray-600 dark:text-gray-300 underline hover:text-blue-500 transition"
          >
            How to find your Steam64 ID?
          </button>

          {showHelp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#1b1d1f] p-6 rounded-2xl max-w-md text-left shadow-xl border border-white/10">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Finding your Steam64 ID
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  Open your Steam client or go to your Steam profile in a browser.
                  Your Steam64 ID is the number in the URL — for example:
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

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </>
      )}

      {data && (
        <div className="w-full mt-12 space-y-6">
          {/* Shared Games */}
          <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-400">
                Shared Games ({data.shared?.length || 0})
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
                  <div key={i} className="flex flex-col items-center bg-white/10 p-2 rounded-lg">
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                      alt={g.name}
                      className="rounded mb-2"
                    />
                    <p className="text-sm font-medium text-gray-100 truncate w-full text-center" title={g.name}>
                      {g.name}
                    </p>
                    {/* hours for each included user */}
                    <p className="text-xs text-gray-400">
                      {/* user1 */}
                      <Hours mins={g.user1_playtime} />
                      {/* user2 */}
                      {data.usernames?.[1] && <> | <Hours mins={g.user2_playtime} /></>}
                      {/* user3 */}
                      {data.usernames?.[2] && <> | <Hours mins={g.user3_playtime} /></>}
                      {/* user4 */}
                      {data.usernames?.[3] && <> | <Hours mins={g.user4_playtime} /></>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Only You */}
          <div className="bg-white/10 dark:bg-white/5 p-6 rounded-2xl border border-white/10 shadow-md">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-green-400">
                Only {data.usernames?.[0] ?? "You"} ({data.onlyYou?.length || 0})
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
                  <div key={i} className="flex flex-col items-center bg-white/10 p-2 rounded-lg">
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                      alt={g.name}
                      className="rounded mb-2"
                    />
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
                  Only {data.usernames?.[1]} ({data.onlyFriend1?.length || 0})
                </h2>
                <button
                  className="text-sm text-gray-400 hover:text-pink-400"
                  onClick={() =>
                    setExpanded((p) => ({ ...p, onlyFriend1: !p.onlyFriend1 }))
                  }
                >
                  {expanded.onlyFriend1 ? "▾ Hide" : "▸ Show"}
                </button>
              </div>

              {expanded.onlyFriend1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                  {(data.onlyFriend1 || []).map((g, i) => (
                    <div key={i} className="flex flex-col items-center bg-white/10 p-2 rounded-lg">
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                        alt={g.name}
                        className="rounded mb-2"
                      />
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
                  Only {data.usernames?.[2]} ({data.onlyFriend2?.length || 0})
                </h2>
                <button
                  className="text-sm text-gray-400 hover:text-yellow-400"
                  onClick={() =>
                    setExpanded((p) => ({ ...p, onlyFriend2: !p.onlyFriend2 }))
                  }
                >
                  {expanded.onlyFriend2 ? "▾ Hide" : "▸ Show"}
                </button>
              </div>

              {expanded.onlyFriend2 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                  {(data.onlyFriend2 || []).map((g, i) => (
                    <div key={i} className="flex flex-col items-center bg-white/10 p-2 rounded-lg">
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                        alt={g.name}
                        className="rounded mb-2"
                      />
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
                  Only {data.usernames?.[3]} ({data.onlyFriend3?.length || 0})
                </h2>
                <button
                  className="text-sm text-gray-400 hover:text-purple-400"
                  onClick={() =>
                    setExpanded((p) => ({ ...p, onlyFriend3: !p.onlyFriend3 }))
                  }
                >
                  {expanded.onlyFriend3 ? "▾ Hide" : "▸ Show"}
                </button>
              </div>

              {expanded.onlyFriend3 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                  {(data.onlyFriend3 || []).map((g, i) => (
                    <div key={i} className="flex flex-col items-center bg-white/10 p-2 rounded-lg">
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`}
                        alt={g.name}
                        className="rounded mb-2"
                      />
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
    </main>
  );
}
