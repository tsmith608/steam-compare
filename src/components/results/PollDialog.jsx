"use client";
import { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import CopyButton from "@/components/results/CopyButton";
import { Cover } from "@/components/results/GameCard";
import { Icon } from "@/components/Icon";
import { track } from "@/lib/track";

export default function PollDialog({ data, games, onClose }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: data.profiles.filter((p) => !p.isPrivate).map((p) => p.steamid), appids: games.map((g) => g.appid) }),
    })
      .then(async (r) => ({ ok: r.ok, body: await r.json().catch(() => ({})) }))
      .then(({ ok, body }) => {
        if (!alive) return;
        setState(ok ? { status: "ready", ...body } : { status: "error", error: body.error });
        if (ok) track("poll_created", { options: games.length });
      })
      .catch(() => alive && setState({ status: "error", error: "Couldn't create the vote." }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog title="Put it to a vote" description="Everyone taps the games they'd play. One veto each. Highest score wins." onClose={onClose}>
      <ul className="mb-5 grid grid-cols-2 gap-2">
        {games.map((g) => (
          <li key={g.appid} className="overflow-hidden rounded-md border border-line">
            <Cover appid={g.appid} name={g.name} className="aspect-[460/215] w-full" />
            <p className="truncate px-2 py-1.5 text-xs font-medium">{g.name}</p>
          </li>
        ))}
      </ul>
      {state.status === "loading" && <p className="text-ink-3" aria-live="polite">Creating your vote link…</p>}
      {state.status === "error" && <p role="alert" className="text-danger">{state.error}</p>}
      {state.status === "ready" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-md border border-line-strong bg-bg-raised p-1.5 pl-3">
            <span className="mono min-w-0 flex-1 truncate text-sm text-ink-2">{state.url}</span>
            <CopyButton text={state.url} label="Copy link" className="btn btn-primary btn-sm" onCopied={() => track("result_shared", { channel: "poll_link" })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={`🗳️ Vote on tonight's game (one veto each): ${state.url}`} label="Copy for Discord" icon="discord" onCopied={() => track("result_shared", { channel: "poll_discord" })} />
            <a href={state.url} className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">
              Open the vote <Icon name="arrow-up-right" className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </Dialog>
  );
}
