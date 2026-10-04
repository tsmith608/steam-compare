"use client";
import { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import CopyButton from "@/components/results/CopyButton";
import { Icon } from "@/components/Icon";
import { track } from "@/lib/track";

export default function ShareDialog({ data, onClose }) {
  const [state, setState] = useState({ status: "loading" });
  const ids = data.profiles.filter((p) => !p.isPrivate).map((p) => p.steamid);

  useEffect(() => {
    let alive = true;
    fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ users: ids }) })
      .then(async (r) => ({ ok: r.ok, body: await r.json().catch(() => ({})) }))
      .then(({ ok, body }) => alive && setState(ok ? { status: "ready", ...body } : { status: "error", error: body.error }))
      .catch(() => alive && setState({ status: "error", error: "Couldn't create a link." }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = data.stats;
  const chatText = (url) =>
    `We own ${s.sharedCount} games in common (${s.unionCount} between us)${s.forgotten ? ` — and somehow nobody's launched ${s.forgotten.name}` : ""}. ${url}`;

  return (
    <Dialog title="Share this comparison" description="Anyone with the link sees the overlap — and can open the full list." onClose={onClose}>
      {state.status === "loading" && <div className="aspect-[1200/630] w-full rounded-lg shimmer" aria-label="Creating your share card" />}
      {state.status === "error" && <p role="alert" className="text-danger">{state.error}</p>}
      {state.status === "ready" && (
        <div className="space-y-4">
          <img
            src={`/s/${state.id}/opengraph-image`}
            alt="Preview of the share card"
            width={1200}
            height={630}
            className="aspect-[1200/630] w-full rounded-lg border border-line bg-surface-2"
          />
          <div className="flex items-center gap-2 rounded-md border border-line-strong bg-bg-raised p-1.5 pl-3">
            <span className="mono min-w-0 flex-1 truncate text-sm text-ink-2">{state.url}</span>
            <CopyButton text={state.url} label="Copy link" className="btn btn-primary btn-sm" onCopied={() => track("result_shared", { channel: "link" })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={chatText(state.url)} label="Copy for Discord" icon="discord" onCopied={() => track("result_shared", { channel: "discord_copy" })} />
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  navigator
                    .share({ title: "What we can play together", text: chatText(""), url: state.url })
                    .then(() => track("result_shared", { channel: "native" }))
                    .catch(() => {})
                }
              >
                <Icon name="share" className="h-4 w-4" /> More…
              </button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
