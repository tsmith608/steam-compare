"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ResultsView from "@/components/results/ResultsView";
import Scanning from "@/components/results/Scanning";
import CompareForm from "@/components/compare/CompareForm";
import { PrivateHelp } from "@/components/results/PrivateBanner";
import { Icon } from "@/components/Icon";
import { DEMO_STEAM_IDS } from "@/lib/demo-ids";
import { rememberGroup } from "@/lib/recent-groups";
import { track } from "@/lib/track";

/** Reads the group from the URL (?p=a,b or legacy ?steamid=a&steamid=b, ?demo=1). */
function useGroupFromUrl() {
  const sp = useSearchParams();
  return useMemo(() => {
    if (sp.get("demo") === "1") return { ids: DEMO_STEAM_IDS, demo: true };
    const fromP = (sp.get("p") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const legacy = sp.getAll("steamid").filter(Boolean);
    const ids = [...new Set([...fromP, ...legacy])].slice(0, 16);
    return { ids, demo: false };
  }, [sp]);
}

function ErrorPanel({ title, children, actions }) {
  return (
    <div className="container-page py-16">
      <div className="surface-raised mx-auto max-w-2xl p-6 sm:p-10">
        <Icon name="alert" className="h-7 w-7 text-warning" />
        <h1 className="display mt-4 text-display-sm">{title}</h1>
        <div className="mt-3 space-y-3 text-ink-2">{children}</div>
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { ids, demo } = useGroupFromUrl();
  const key = ids.join(",");
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    if (ids.length < 2) {
      setState({ status: "empty" });
      return;
    }
    let alive = true;
    setState({ status: "loading" });
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: ids }),
    })
      .then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) }))
      .then(({ ok, status, body }) => {
        if (!alive) return;
        if (!ok) {
          setState({ status: "error", http: status, ...body });
          return;
        }
        setState({ status: "ready", data: body });
        if (!body.demo) rememberGroup(body.profiles.filter((p) => !p.isPrivate));
        if (demo) track("demo_viewed", { location: "results" });
      })
      .catch(() => alive && setState({ status: "error", code: "network", error: "We couldn't reach WeBothPlay. Check your connection and try again." }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const editHref = `/?p=${ids.map(encodeURIComponent).join(",")}`;

  if (state.status === "empty") {
    return (
      <div className="container-page py-14">
        <h1 className="display-wide text-display-md">Who's playing?</h1>
        <p className="mt-3 max-w-xl text-ink-2">Add at least two Steam profiles to see the games you all own.</p>
        <div className="mt-8 max-w-2xl">
          <CompareForm />
        </div>
      </div>
    );
  }

  if (state.status === "loading" || state.status === "idle") return <Scanning count={ids.length} />;

  if (state.status === "error") {
    if (state.code === "bad_profiles" && state.fieldErrors?.length) {
      return (
        <ErrorPanel
          title="We couldn't find some of those profiles"
          actions={
            <>
              <Link href={editHref} className="btn btn-primary">Edit the group</Link>
              <Link href="/guides/compare-steam-libraries#find-profile" className="btn btn-ghost">How to find a profile link</Link>
            </>
          }
        >
          <ul className="space-y-2">
            {state.fieldErrors.map((e) => (
              <li key={e.index} className="flex gap-2">
                <Icon name="close" className="mt-1 h-4 w-4 shrink-0 text-danger" />
                <span>
                  <code className="mono text-ink-1">{String(e.input).slice(0, 60)}</code> — {e.message}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-3">Tip: custom URL names are the part after steamcommunity.com/id/ — not the display name.</p>
        </ErrorPanel>
      );
    }
    if (state.code === "private_profiles") {
      return (
        <ErrorPanel title="Not enough public libraries yet" actions={<Link href={editHref} className="btn btn-ghost">Edit the group</Link>}>
          <p>We need at least two people whose Steam "Game details" are public.</p>
          <PrivateHelp blocked={state.blocked || []} />
        </ErrorPanel>
      );
    }
    if (state.code === "plan_limit") {
      return (
        <ErrorPanel
          title={`That's a big group — free comparisons cover ${state.maxPlayers}`}
          actions={
            <>
              <Link href="/upgrade" className="btn btn-amber">See Premium</Link>
              <Link href={editHref} className="btn btn-ghost">Trim the group</Link>
            </>
          }
        >
          <p>{state.error}</p>
          <p className="text-sm text-ink-3">If anyone in the group has Premium, bigger groups unlock for everyone in it.</p>
        </ErrorPanel>
      );
    }
    return (
      <ErrorPanel
        title="That didn't work"
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              <Icon name="refresh" className="h-4 w-4" /> Try again
            </button>
            <Link href={editHref} className="btn btn-ghost">Edit the group</Link>
          </>
        }
      >
        <p>{state.error || "Something went wrong."}</p>
      </ErrorPanel>
    );
  }

  return <ResultsView data={state.data} groupKey={key} editHref={editHref} />;
}
