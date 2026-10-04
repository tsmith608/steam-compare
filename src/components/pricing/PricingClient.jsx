"use client";
import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signInHref, useSession } from "@/components/SessionProvider";
import { Icon } from "@/components/Icon";
import { PLAN_FEATURES, PRICING } from "@/lib/plans";
import { trackContext } from "@/lib/track";

const FAQ = [
  { q: "Can I cancel any time?", a: "Yes — from Plan & billing in your account menu, in two clicks. You keep Premium until the end of the period you've paid for, and you won't be charged again." },
  { q: "Do I need Premium to use WeBothPlay?", a: "No. Comparing up to 8 players, every filter, the roulette, group votes and share links are free and staying free. Premium is for big groups, Discord communities and people who want to support the project." },
  { q: "Does my whole group need Premium?", a: "No. If anyone in a comparison has Premium, the bigger group limit applies to that comparison." },
  { q: "How does payment work?", a: "Checkout is handled by Stripe; we never see your card number. You'll get a receipt by email, and you can update your card or see invoices in the billing portal." },
  { q: "Something went wrong with a charge.", a: "Contact us from the Contact page and we'll sort it out — including refunds when something isn't right." },
  { q: "I paid through Ko-fi before.", a: "Ko-fi memberships still work. Sign in and use the Ko-fi claim page to link your transaction to your Steam account." },
];

function Price({ tier, interval }) {
  if (tier === "Noob") return <><span className="num text-5xl font-bold text-ink-1">$0</span><span className="ml-1 text-ink-3">forever</span></>;
  const p = PRICING[tier][interval];
  return (
    <>
      <span className="num text-5xl font-bold text-ink-1">${p}</span>
      <span className="ml-1 text-ink-3">/{interval === "year" ? "year" : "month"}</span>
    </>
  );
}

// Only this notice depends on the URL, so the rest of the page is server-rendered.
function CanceledNotice() {
  const sp = useSearchParams();
  if (sp.get("canceled") !== "1") return null;
  return <p className="mb-8 rounded-lg border border-line bg-surface-1 px-4 py-3 text-sm text-ink-2">Checkout canceled — you weren't charged.</p>;
}

export default function PricingClient({ annualAvailable, configured }) {
  const { user, loading } = useSession();
  const [interval, setBillingInterval] = useState("month");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const tier = user?.tier || "Noob";

  async function checkout(target) {
    setBusy(target);
    setError("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: target, interval, ctx: trackContext() }) });
      const d = await r.json().catch(() => ({}));
      if (d.url) window.location.assign(d.url);
      else throw new Error(d.error || "Couldn't start checkout.");
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  }

  async function portal() {
    setBusy("portal");
    setError("");
    try {
      const r = await fetch("/api/portal", { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (d.url) window.location.assign(d.url);
      else throw new Error(d.error || "Couldn't open billing.");
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  }

  function cta(target) {
    if (target === "Noob") {
      return tier === "Noob" ? <span className="btn btn-ghost w-full cursor-default opacity-70">{user ? "Your plan" : "Free forever"}</span> : null;
    }
    if (loading) return <span className="btn btn-ghost w-full opacity-50">…</span>;
    if (!user) return <a href={signInHref("/upgrade")} className={`btn w-full ${target === "Pro" ? "btn-amber" : "btn-ghost"}`}>Sign in through Steam to upgrade</a>;
    if (tier === target) return <button type="button" onClick={portal} disabled={busy === "portal"} className="btn btn-ghost w-full">{busy === "portal" ? "Opening…" : "Manage plan"}</button>;
    if (user.hasBilling && tier !== "Noob") {
      return <button type="button" onClick={portal} disabled={busy === "portal"} className="btn btn-ghost w-full">Switch in billing portal</button>;
    }
    return (
      <button type="button" onClick={() => checkout(target)} disabled={!configured || !!busy} className={`btn w-full ${target === "Pro" ? "btn-amber" : "btn-ghost"}`}>
        {busy === target ? "Opening checkout…" : configured ? `Go ${target}` : "Coming soon"}
      </button>
    );
  }

  const plans = [
    { tier: "Noob", name: "Noob", pitch: "Everything a normal group needs." },
    { tier: "Pro", name: "Pro", pitch: "Big groups and the full Discord bot.", highlight: true },
    { tier: "Hacker", name: "Hacker", pitch: "For people who run the server." },
  ];

  return (
    <div className="container-page py-12 sm:py-16">
      <Suspense fallback={null}>
        <CanceledNotice />
      </Suspense>
      {user?.billingStatus === "past_due" && (
        <p className="mb-8 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink-1">
          Your last payment didn't go through. <button type="button" className="underline" onClick={portal}>Update your card</button> to keep Premium.
        </p>
      )}

      <div className="max-w-3xl">
        <p className="label !text-amber-hi">Premium</p>
        <h1 className="display-wide mt-3 text-display-lg">Free for most groups. Premium for the big ones.</h1>
        <p className="mt-4 text-body-lg text-ink-2">
          The core of WeBothPlay — finding what your group can play and picking it — is free. Premium adds bigger groups, saved groups and
          the full Discord bot, and keeps the project independent.
        </p>
      </div>

      {annualAvailable && (
        <div className="mt-8 inline-flex rounded-full border border-line-strong p-1" role="group" aria-label="Billing period">
          {["month", "year"].map((i) => (
            <button key={i} type="button" aria-pressed={interval === i} onClick={() => setBillingInterval(i)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${interval === i ? "bg-surface-3 text-ink-1" : "text-ink-3"}`}>
              {i === "month" ? "Monthly" : "Yearly · save ~37%"}
            </button>
          ))}
        </div>
      )}

      {error && <p role="alert" className="mt-6 text-danger">{error}</p>}

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <section
            key={p.tier}
            aria-labelledby={`plan-${p.tier}`}
            className={`flex flex-col rounded-xl border p-6 sm:p-7 ${p.highlight ? "border-amber/50 bg-[linear-gradient(180deg,rgba(245,165,36,0.08),transparent_40%)]" : "border-line bg-surface-1"}`}
          >
            <div className="flex items-center justify-between">
              <h2 id={`plan-${p.tier}`} className="display text-2xl">{p.name}</h2>
              {tier === p.tier && user && <span className="tag !bg-accent-wash !text-accent-hi">Current</span>}
              {p.highlight && tier !== p.tier && <span className="tag !bg-amber-wash !text-amber-hi">Recommended</span>}
            </div>
            <p className="mt-1 text-sm text-ink-3">{p.pitch}</p>
            <p className="mt-6 flex items-baseline"><Price tier={p.tier} interval={interval} /></p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {PLAN_FEATURES[p.tier].map((f) => (
                <li key={f} className="flex gap-2.5 text-ink-2">
                  <Icon name="check" className={`mt-0.5 h-4 w-4 shrink-0 ${p.tier === "Noob" ? "text-ink-3" : "text-amber-hi"}`} strokeWidth={2.25} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-2">
              {cta(p.tier)}
              {p.tier !== "Noob" && (
                <p className="text-center text-xs text-ink-3">
                  Renews every {interval === "year" ? "year" : "month"} until you cancel. Cancel any time in billing.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <section aria-labelledby="pricing-faq" className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 id="pricing-faq" className="display-wide text-display-md">Billing questions</h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <Icon name="plus" className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-5 pr-8 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-ink-3">
        Paid with Ko-fi? <Link href="/upgrade/claim" className="text-accent-hi underline">Claim your membership</Link>
      </p>
    </div>
  );
}
