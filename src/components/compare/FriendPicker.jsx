"use client";
import { useEffect, useMemo, useState } from "react";
import Dialog from "@/components/Dialog";
import { Icon } from "@/components/Icon";

export default function FriendPicker({ onClose, onConfirm, already = [], slots = 7 }) {
  const [friends, setFriends] = useState(null);
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/compare/auth/steam/friends", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Couldn't load your friends list.");
        return d;
      })
      .then((d) => {
        if (!alive) return;
        setIsPrivate(!!d.private);
        setFriends(d.friends || []);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (friends || []).filter((f) => !already.includes(f.steamid) && (!term || f.personaname.toLowerCase().includes(term)));
  }, [friends, q, already]);

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= slots ? p : [...p, id]));

  return (
    <Dialog
      title="Pick friends"
      description={slots > 0 ? `Choose up to ${slots} more.` : "Your group is full."}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-3">{picked.length} selected</span>
          <button type="button" className="btn btn-primary" disabled={!picked.length} onClick={() => onConfirm(picked.map((id) => friends.find((f) => f.steamid === id)).filter(Boolean))}>
            Add {picked.length || ""} to group
          </button>
        </div>
      }
    >
      {error ? (
        <p role="alert" className="text-sm text-danger">{error}</p>
      ) : friends === null ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading friends">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg shimmer" />
          ))}
        </div>
      ) : isPrivate ? (
        <p className="text-sm text-ink-2">
          Your Steam friends list is private, so we can't load it. You can still paste friends' profile links, or make your friends
          list visible in Steam → Edit Profile → Privacy Settings.
        </p>
      ) : (
        <>
          <label className="relative mb-3 block">
            <span className="sr-only">Search friends</span>
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input className="field !pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search friends" autoFocus />
          </label>
          {list.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">No friends match "{q}".</p>
          ) : (
            <ul className="space-y-1">
              {list.map((f) => {
                const on = picked.includes(f.steamid);
                return (
                  <li key={f.steamid}>
                    <button
                      type="button"
                      onClick={() => toggle(f.steamid)}
                      aria-pressed={on}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${on ? "bg-accent-wash" : "hover:bg-surface-2"}`}
                    >
                      {f.avatar ? (
                        <img src={f.avatar} alt="" width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full" />
                      ) : (
                        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-surface-3 text-sm font-semibold text-ink-2">
                          {(f.personaname || "").match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{f.personaname}</span>
                        {!f.isPublic && <span className="text-xs text-ink-3">Profile is private — their games may be hidden</span>}
                      </span>
                      <span className={`grid h-5 w-5 place-items-center rounded border ${on ? "border-accent bg-accent text-white" : "border-line-strong"}`}>
                        {on && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Dialog>
  );
}
