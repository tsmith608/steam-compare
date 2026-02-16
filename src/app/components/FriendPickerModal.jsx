"use client";
import { useEffect, useMemo, useState } from "react";

export default function FriendPickerModal({ friends = [], loading = false, me = null, onPicked, onClose, limit = 3 }) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState(() => new Set());

  const normalized = useMemo(() => {
    const list = Array.isArray(friends) ? friends : [];
    return list.map(f => ({
      steamid: String(f.steamid || ""),
      personaname: String(f.personaname || "").trim(),
      avatar: f.avatarmedium || f.avatarfull || "",
      profileurl: f.profileurl || "",
    })).filter(f => f.steamid);
  }, [friends]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter(f =>
      f.personaname.toLowerCase().includes(q) || f.steamid.includes(q)
    );
  }, [normalized, query]);

  function toggle(id) {
    setChosen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < limit) next.add(id);
      return next;
    });
  }

  function useSelected() { onPicked?.(Array.from(chosen)); }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey, { passive: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#171a1d] text-gray-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            {me?.avatar && <img src={me.avatar} alt="" className="h-8 w-8 rounded-full ring-1 ring-white/20 object-cover" />}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Pick up to {limit} friends</h2>
              {me?.personaname && (
                <p className="text-[11px] text-gray-400">
                  Logged in as <span className="text-gray-300">{decodeURIComponent(me.personaname || "")}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-gray-300" aria-label="Close">×</button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-5 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
          />
        </div>

        {/* List */}
        <div className="px-4 sm:px-5 pb-3">
          <div className="h-[38vh] min-h-[280px] overflow-auto rounded-xl border border-white/10 bg-white/[0.04]">
            {loading ? (
              <div className="p-5 text-gray-400">Loading friends…</div>
            ) : filtered.length === 0 ? (
              <div className="p-5 text-gray-400">No friends to show. Their friend list may be private or filtered out.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {filtered.map(f => {
                  const selected = chosen.has(f.steamid);
                  return (
                    <li key={f.steamid}>
                      <button
                        type="button"
                        onClick={() => toggle(f.steamid)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-white/10 transition ${selected ? "bg-white/10" : ""}`}
                      >
                        <img src={f.avatar || "/steam-avatar-fallback.png"} alt="" className="h-9 w-9 rounded-full ring-1 ring-white/20 object-cover" />
                        <div className="flex-1">
                          <div className="font-medium truncate">{f.personaname || f.steamid}</div>
                          <div className="text-xs text-gray-400">{f.steamid}</div>
                        </div>
                        <div className={`h-5 w-5 rounded border ${selected ? "bg-blue-500 border-blue-500" : "border-white/20"}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border-t border-white/10">
          <div className="text-sm text-gray-400">Selected: <span className="text-gray-200">{chosen.size}</span>/{limit}</div>
          <div className="flex items-center gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">Cancel</button>
            <button onClick={useSelected} disabled={chosen.size === 0} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60">
              Use {chosen.size} {chosen.size === 1 ? "friend" : "friends"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
