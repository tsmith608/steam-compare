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

export default function FriendPickerBridge({ setUsers, isPremium, tier }) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [currentSteamId, setCurrentSteamId] = useState("");

  const getMaxUsers = () => {
    if (!isPremium) return 4;
    if (tier === 'Bronze') return 6;
    if (tier === 'Silver') return 10;
    if (tier === 'Gold') return 16;
    return 12; // Default for admin or legacy
  };

  const limit = getMaxUsers() - 1; // slots available for friends

  useEffect(() => {
    // 1) find steamid from URL or session
    let steamid = getParam("steamid");
    const name = getParam("name");
    const avatar = getParam("avatar");
    const shouldAutoOpen = getParam("autopick") === "1";

    // fallback to sessionStorage if URL lacks steamid
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
  }, [setUsers]);

  if (!open) {
    if (currentSteamId || friends.length > 0) {
      return (
        <div className="mt-2 flex justify-center w-full">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 font-bold transition-all shadow-lg hover:shadow-blue-900/10 flex items-center justify-center gap-2"
          >
            <span>👥 Pick Friends to Compare</span>
          </button>
        </div>
      );
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
