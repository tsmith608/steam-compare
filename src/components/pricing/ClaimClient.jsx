"use client";
import { useState } from "react";
import Link from "next/link";
import { signInHref, useSession } from "@/components/SessionProvider";

export default function ClaimClient() {
  const { user, loading, refresh } = useSession();
  const [tx, setTx] = useState("");
  const [state, setState] = useState({ status: "idle" });

  async function submit(e) {
    e.preventDefault();
    setState({ status: "loading" });
    const r = await fetch("/api/claim-premium", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transactionId: tx.trim() }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setState({ status: "done", tier: d.tier });
      refresh();
    } else setState({ status: "error", error: d.error || "That didn't work." });
  }

  return (
    <div className="container-page py-16">
      <div className="surface-raised mx-auto max-w-lg p-8">
        <p className="label">Ko-fi</p>
        <h1 className="display-wide mt-3 text-display-sm">Claim your Ko-fi membership</h1>
        <p className="mt-3 text-ink-2">Paste the transaction ID from your Ko-fi receipt email and we'll link it to your Steam account.</p>
        {loading ? null : !user ? (
          <a href={signInHref("/upgrade/claim")} className="btn btn-steam mt-6 w-full">Sign in through Steam first</a>
        ) : state.status === "done" ? (
          <p className="mt-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3">Done — you're on {state.tier}. <Link href="/" className="underline">Start comparing</Link></p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block">
              <span className="label mb-2 block">Transaction ID</span>
              <input className="field mono" value={tx} onChange={(e) => setTx(e.target.value)} required maxLength={100} placeholder="e.g. 00000000-1111-2222-3333-444444444444" />
            </label>
            {state.status === "error" && <p role="alert" className="text-sm text-danger">{state.error}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={state.status === "loading"}>{state.status === "loading" ? "Checking…" : `Link to ${user.name}`}</button>
          </form>
        )}
      </div>
    </div>
  );
}
