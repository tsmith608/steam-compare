"use client";
import { useEffect, useState } from "react";
import FriendPickerModal from "./FriendPickerModal";

/* Robust URL param getter (supports /?a=b and /#/?a=b) */
function getParam(name) {
  try {
    const u = new URL(window.location.href);
    const fromSearch = u.searchParams.get(name);
    if (fromSearch) return fromSearch;
    // also check hash query e.g. http://site/#/?steamid=123
    if (u.hash && u.hash.includes("?")) {
      const hashQ = new URLSearchParams(u.hash.split("?")[1]);
      return hashQ.get(name);
    }
  } catch { }
  return null;
}

export default function FriendPickerBridge({ setUsers, isPremium, tier, steamId: propSteamId }) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [currentSteamId, setCurrentSteamId] = useState("");
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const getMaxUsers = () => {
    if (!isPremium) return 4;
    if (tier === 'Bronze') return 6;
    if (tier === 'Silver') return 10;
    if (tier === 'Gold') return 16;
    return 12; // Default for admin or legacy
  };

  const limit = getMaxUsers() - 1; // slots available for friends

  useEffect(() => {
    // 1) find steamid from URL or session or prop
    let steamid = propSteamId || getParam("steamid");
    const name = getParam("name");
    const avatar = getParam("avatar");
    const shouldAutoOpen = getParam("autopick") === "1";

    // fallback to sessionStorage if URL/prop lacks steamid
    if (!steamid) {
      try { steamid = sessionStorage.getItem("wb.steamid") || ""; } catch { }
    }

    if (steamid) {
      setCurrentSteamId(steamid);
      // keep it around for subsequent loads
      try { sessionStorage.setItem("wb.steamid", steamid); } catch { }

      // 2) fill first input immediately (if not already set by parent)
      // Actually, parent (page.jsx) now handles restoration from session too.
      // But we keep this for redundancy or standalone usage.
      setUsers(prev => {
        if (prev[0] === steamid) return prev;
        const n = [...prev];
        n[0] = steamid;
        return n;
      });

      // show "me" in the modal header if we have it
      if (name || avatar) {
        setMe({
          personaname: name ? decodeURIComponent(name) : "",
          avatar: avatar ? decodeURIComponent(avatar) : "",
        });
      }

      // 3) always fetch friends when we have a steamid
      setLoading(true);
      setErrMsg("");
      setFetchAttempted(false);
      console.log("[FriendPickerBridge] Fetching friends for:", steamid);
      fetch(`/api/compare/auth/steam/friends?steamid=${encodeURIComponent(steamid)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: { "Accept": "application/json" },
      })
        .then(async (r) => {
          if (!r.ok) {
            console.error("[FriendPickerBridge] HTTP Error:", r.status);
            throw new Error(`Friends HTTP ${r.status}`);
          }
          return r.json();
        })
        .then(({ friends }) => {
          const list = Array.isArray(friends) ? friends : [];
          setFriends(list);
        })
        .catch((e) => {
          console.warn("[friend-fetch] error:", e);
          setErrMsg("Couldn’t load your friends. Make sure their lists are public.");
          setFriends([]);
        })
        .finally(() => {
          setLoading(false);
          setFetchAttempted(true);
          // 4) open modal only if autopick=1
          if (shouldAutoOpen) setOpen(true);

          // clean only the autopick flag (leave steamid so refresh still pre-fills #1)
          try {
            const u = new URL(window.location.href);
            u.searchParams.delete("autopick");
            window.history.replaceState({}, "", u);
          } catch { }
        });
    } else {
      // no steamid detected
      setErrMsg("No SteamID found. Log in via Steam first.");
    }
  }, [propSteamId, setUsers]); // Add propSteamId to deps

  if (!open) {
    if (currentSteamId) {
      // Condition: We have an ID, we tried to fetch, but got no friends (likely private)
      // OR we have an error message about loading friends.
      const showPublicSettingsLink = !loading && fetchAttempted && friends.length === 0;

      if (showPublicSettingsLink) {
        return (
          <div className="mt-2 flex justify-center w-full">
            <a
              href={`https://steamcommunity.com/profiles/${currentSteamId}/edit/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-bold transition-all shadow-lg hover:shadow-amber-900/10 flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
            >
              <span>⚠️ Set Friend Details to Public</span>
            </a>
          </div>
        );
      }

      // Standard button if we have friends or haven't fetched yet (but have ID)
      // Or if we are still loading, maybe just show the button (it will show loading spinner inside modal if clicked? 
      // or we can show a loading state here too, but original code just showed if friends > 0.
      // The original code was: if (currentSteamId || friends.length > 0)
      // We'll keep the standard button if we have friends OR if we are loading/haven't attempted yet.
      if (friends.length > 0 || loading || !fetchAttempted) {
        return (
          <div className="mt-2 flex justify-center w-full">
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 font-bold transition-all shadow-lg hover:shadow-blue-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Loading Friends..." : "👥 Pick Friends to Compare"}</span>
            </button>
          </div>
        );
      }
    }
    return null;
  }

  return (
    <FriendPickerModal
      me={me}
      friends={friends}
      loading={loading}
      limit={limit}
      error={errMsg}
      onPicked={(ids) => {
        setUsers(prev => {
          const next = [...prev];
          let slot = 1;
          const maxSlots = getMaxUsers();

          ids.forEach(friendId => {
            // Fill existing slots first
            if (slot < next.length) {
              next[slot] = friendId;
            } else if (next.length < maxSlots) {
              // Expand if under max limit
              next.push(friendId);
            }
            slot++;
          });
          return next;
        });
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  );
}
