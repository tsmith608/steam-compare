"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LinkContent() {
  const params = useSearchParams();
  const discordId = params.get("discord_id");
  const exp = params.get("exp");
  const sig = params.get("sig");

  const [user, setUser] = useState(undefined);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const signInHref = `/api/compare/auth/steam/start?next=${encodeURIComponent(
    `/auth/discord?${params.toString()}`
  )}`;

  async function link() {
    setStatus("loading");
    try {
      const res = await fetch("/api/discord/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId, exp, sig }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't link your accounts.");
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setMessage(e.message);
    }
  }

  return (
    <main id="main" className="min-h-[80vh] grid place-items-center px-4 py-16">
      <div className="w-full max-w-md surface-raised p-8 text-center">
        <p className="label text-accent mb-3">Discord × Steam</p>
        {status === "success" ? (
          <>
            <h1 className="text-display-sm mb-3">You're linked.</h1>
            <p className="text-ink-2 mb-6">Head back to Discord and run <code className="kbd">/compare</code> with your friends.</p>
            <Link href="/" className="btn btn-ghost">Back to WeBothPlay</Link>
          </>
        ) : !discordId ? (
          <>
            <h1 className="text-display-sm mb-3">This link is incomplete</h1>
            <p className="text-ink-2">Run <code className="kbd">/link</code> in Discord to get a fresh link.</p>
          </>
        ) : (
          <>
            <h1 className="text-display-sm mb-3">Link your Steam account</h1>
            <p className="text-ink-2 mb-6">
              This lets the WeBothPlay bot compare your public Steam library when friends run <code className="kbd">/compare</code>.
            </p>
            {status === "error" && (
              <p role="alert" className="mb-5 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink-1">{message}</p>
            )}
            {user === undefined ? (
              <p className="text-ink-3" aria-live="polite">Checking your session…</p>
            ) : user ? (
              <div className="space-y-4">
                <p className="text-sm text-ink-2">
                  Signed in as <strong className="text-ink-1">{user.name}</strong>
                </p>
                <button type="button" onClick={link} disabled={status === "loading"} className="btn btn-primary w-full">
                  {status === "loading" ? "Linking…" : "Link to Discord"}
                </button>
              </div>
            ) : (
              <a href={signInHref} className="btn btn-steam w-full">Sign in through Steam</a>
            )}
            <p className="mt-6 text-xs text-ink-3">We only read public library data. You can unlink any time by contacting support.</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function DiscordAuthPage() {
  return (
    <Suspense fallback={<main className="min-h-[80vh]" />}>
      <LinkContent />
    </Suspense>
  );
}
