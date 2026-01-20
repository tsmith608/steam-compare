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
  } catch {}
  return null;
}

export default function FriendPickerBridge({ setUser1, setUser2, setUser3, setUser4 }) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    // 1) find steamid from URL or session
    let steamid = getParam("steamid");
    const name   = getParam("name");
    const avatar = getParam("avatar");
    const shouldAutoOpen = getParam("autopick") === "1";

    // fallback to sessionStorage if URL lacks steamid
    if (!steamid) {
      try { steamid = sessionStorage.getItem("wb.steamid") || ""; } catch {}
    }

    if (steamid) {
      // keep it around for subsequent loads
      try { sessionStorage.setItem("wb.steamid", steamid); } catch {}

      // 2) fill first input immediately
      try { setUser1?.(steamid); } catch {}

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
      fetch(`/api/compare/auth/steam/friends?steamid=${encodeURIComponent(steamid)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: { "Accept": "application/json" },
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`Friends HTTP ${r.status}`);
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
          } catch {}
        });
    } else {
      // no steamid detected
      setErrMsg("No SteamID found. Log in via Steam first.");
    }
  }, [setUser1]);

  if (!open) return null;

  return (
    <FriendPickerModal
      me={me}
      friends={friends}
      loading={loading}
      onPicked={(ids) => {
        setUser2?.(ids[0] || "");
        setUser3?.(ids[1] || "");
        setUser4?.(ids[2] || "");
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  );
}
