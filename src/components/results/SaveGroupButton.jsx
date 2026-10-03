"use client";
import { useState } from "react";
import Link from "next/link";
import Dialog from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { signInHref, useSession } from "@/components/SessionProvider";

export default function SaveGroupButton({ profiles, demo }) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState({ status: "idle" });
  if (demo) return null;

  if (!user) {
    return (
      <a href={signInHref(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/")} className="btn btn-quiet">
        <Icon name="bookmark" className="h-4 w-4" /> Save group
      </a>
    );
  }

  async function save(e) {
    e.preventDefault();
    setState({ status: "loading" });
    const r = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, steamIds: profiles.map((p) => p.steamid) }),
    });
    const d = await r.json().catch(() => ({}));
    setState(r.ok ? { status: "done" } : { status: "error", error: d.error, upsell: d.code === "plan_limit" });
  }

  return (
    <>
      <button type="button" className="btn btn-quiet" onClick={() => setOpen(true)}>
        <Icon name="bookmark" className="h-4 w-4" /> Save group
      </button>
      {open && (
        <Dialog title="Save this group" description="One click to compare them again — on any device you sign in on." onClose={() => setOpen(false)} size="sm">
          {state.status === "done" ? (
            <p className="text-ink-2">Saved. You'll find it under your group on the home page.</p>
          ) : (
            <form onSubmit={save} className="space-y-3">
              <label className="block">
                <span className="label mb-2 block">Group name</span>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Friday squad" autoFocus required />
              </label>
              {state.status === "error" && (
                <p role="alert" className="text-sm text-danger">
                  {state.error} {state.upsell && <Link href="/upgrade" className="underline">See Premium</Link>}
                </p>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={state.status === "loading"}>Save</button>
            </form>
          )}
        </Dialog>
      )}
    </>
  );
}
