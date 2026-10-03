"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseSteamInput, splitPastedProfiles, displayInput } from "@/lib/steam-input";
import { loadRecentGroups, groupLabel, forgetGroup } from "@/lib/recent-groups";
import { signInHref, useSession } from "@/components/SessionProvider";
import { Icon } from "@/components/Icon";
import { PlayerDot } from "@/components/compare/PlayerDot";
import FriendPicker from "@/components/compare/FriendPicker";
import { track } from "@/lib/track";

const HARD_MAX = 16;
const FREE_MAX = 8;

const normalize = (raw) => {
  const p = parseSteamInput(raw);
  return p ? (p.kind === "id" ? p.steamid : p.vanity) : null;
};

/**
 * The group builder. Submitting navigates to /compare?p=<a,b,c>, so results
 * are linkable, refreshable and shareable.
 */
export default function CompareForm({ initial = [], autoPick = false, compact = false, extraQuery = "", submitLabel = "Compare libraries" }) {
  const router = useRouter();
  const formId = useId();
  const { user, loading: sessionLoading } = useSession();
  const [rows, setRows] = useState(() => {
    const start = initial.filter(Boolean).slice(0, HARD_MAX).map((v) => ({ value: v, touched: false }));
    while (start.length < 2) start.push({ value: "", touched: false });
    return start;
  });
  const [selfName, setSelfName] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const inputs = useRef([]);
  const enteredOnce = useRef(new Set());

  const [saved, setSaved] = useState([]);
  useEffect(() => setRecent(loadRecentGroups()), []);
  useEffect(() => {
    if (!user) return;
    fetch("/api/groups", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSaved(d.groups || []))
      .catch(() => {});
  }, [user]);

  // Signed in: the first row is you.
  useEffect(() => {
    if (!user || initial.length) return;
    setRows((prev) => {
      if (prev.some((r) => normalize(r.value) === user.steamid)) return prev;
      const next = [...prev];
      if (!next[0].value) next[0] = { value: user.steamid, touched: false };
      else next.unshift({ value: user.steamid, touched: false });
      return next.slice(0, HARD_MAX);
    });
    setSelfName(user.name);
  }, [user, initial.length]);

  useEffect(() => {
    if (autoPick && user) setPickerOpen(true);
  }, [autoPick, user]);

  const ownMax = user?.maxPlayers || FREE_MAX;
  const filled = rows.filter((r) => r.value.trim()).length;

  const errors = useMemo(
    () => rows.map((r) => (r.value.trim() && !parseSteamInput(r.value) ? "That doesn't look like a Steam profile link, ID or custom URL name." : "")),
    [rows]
  );

  function setValue(i, value) {
    setFormError("");
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, value } : r)));
  }

  function onBlur(i) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, touched: true } : r)));
    const v = rows[i]?.value;
    if (v && parseSteamInput(v) && !enteredOnce.current.has(i)) {
      enteredOnce.current.add(i);
      track("profile_entered", { position: i + 1 });
    }
  }

  function onPaste(i, e) {
    const text = e.clipboardData?.getData("text") || "";
    const found = splitPastedProfiles(text);
    if (found.length < 2) return;
    e.preventDefault();
    setRows((prev) => {
      const next = [...prev];
      let slot = i;
      for (const v of found) {
        while (slot < next.length && next[slot].value.trim() && slot !== i) slot++;
        if (slot >= HARD_MAX) break;
        if (slot >= next.length) next.push({ value: "", touched: false });
        next[slot] = { value: v, touched: true };
        slot++;
      }
      return next;
    });
  }

  function addRow() {
    if (rows.length >= HARD_MAX) return;
    setRows((prev) => [...prev, { value: "", touched: false }]);
    requestAnimationFrame(() => inputs.current[rows.length]?.focus());
  }

  function removeRow(i) {
    setRows((prev) => {
      const next = prev.filter((_, j) => j !== i);
      while (next.length < 2) next.push({ value: "", touched: false });
      return next;
    });
    if (i === 0) setSelfName(null);
  }

  function addFriends(ids) {
    setRows((prev) => {
      const existing = new Set(prev.map((r) => normalize(r.value)).filter(Boolean));
      const next = prev.filter((r) => r.value.trim());
      for (const id of ids) if (!existing.has(id) && next.length < HARD_MAX) next.push({ value: id, touched: true });
      while (next.length < 2) next.push({ value: "", touched: false });
      return next;
    });
  }

  function go(values) {
    const ids = [...new Set(values.map(normalize).filter(Boolean))];
    if (ids.length < 2) {
      setFormError("Add at least two different Steam profiles.");
      return;
    }
    setSubmitting(true);
    track("comparison_started", { players: ids.length, signed_in: !!user });
    router.push(`/compare?p=${ids.map(encodeURIComponent).join(",")}${extraQuery ? `&${extraQuery}` : ""}`);
  }

  function onSubmit(e) {
    e.preventDefault();
    track("compare_cta_clicked", { location: compact ? "compact" : "hero" });
    setRows((prev) => prev.map((r) => ({ ...r, touched: true })));
    const firstBad = errors.findIndex(Boolean);
    if (firstBad !== -1) {
      inputs.current[firstBad]?.focus();
      return;
    }
    go(rows.map((r) => r.value));
  }

  return (
    <div className={compact ? "" : "surface-raised p-4 sm:p-6"}>
      <form onSubmit={onSubmit} noValidate aria-describedby={`${formId}-hint`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="label !text-ink-2">Your group</h2>
          <span className="num text-xs text-ink-3" aria-live="polite">
            {filled}/{Math.max(ownMax, rows.length)} players
          </span>
        </div>

        <ol className="space-y-2.5">
          {rows.map((row, i) => {
            const isSelf = user && normalize(row.value) === user.steamid && selfName;
            const showErr = row.touched && errors[i];
            return (
              <li key={i} className="flex items-start gap-2.5">
                <PlayerDot index={i} className="mt-2.5" />
                <div className="min-w-0 flex-1">
                  <label htmlFor={`${formId}-p${i}`} className="sr-only">
                    {i === 0 ? "Your Steam profile" : `Friend ${i}'s Steam profile`}
                  </label>
                  {isSelf ? (
                    <div className="field flex items-center justify-between !bg-surface-1">
                      <span className="truncate">
                        <span className="font-semibold">{selfName}</span> <span className="text-ink-3">· you</span>
                      </span>
                      <button type="button" className="text-xs text-ink-3 underline hover:text-ink-1" onClick={() => { setSelfName(null); setValue(i, ""); }}>
                        change
                      </button>
                    </div>
                  ) : (
                    <input
                      id={`${formId}-p${i}`}
                      ref={(el) => (inputs.current[i] = el)}
                      className="field"
                      value={row.value}
                      onChange={(e) => setValue(i, e.target.value)}
                      onBlur={() => onBlur(i)}
                      onPaste={(e) => onPaste(i, e)}
                      placeholder={i === 0 ? "Your Steam profile or ID" : "A friend's Steam profile or ID"}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint={i === rows.length - 1 ? "go" : "next"}
                      inputMode="url"
                      aria-invalid={showErr ? "true" : undefined}
                      aria-describedby={showErr ? `${formId}-e${i}` : undefined}
                    />
                  )}
                  {showErr && (
                    <p id={`${formId}-e${i}`} className="mt-1.5 text-xs text-danger">
                      {errors[i]}{" "}
                      <Link href="/guides/compare-steam-libraries#find-profile" className="underline">Where do I find it?</Link>
                    </p>
                  )}
                </div>
                {rows.length > 2 && (
                  <button type="button" onClick={() => removeRow(i)} className="btn btn-quiet btn-sm mt-1.5 !px-2" aria-label={`Remove player ${i + 1}`}>
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
          {rows.length < HARD_MAX && (
            <button type="button" onClick={addRow} className="btn btn-quiet btn-sm">
              <Icon name="plus" className="h-4 w-4" /> Add a friend
            </button>
          )}
          {!sessionLoading &&
            (user ? (
              <button type="button" onClick={() => setPickerOpen(true)} className="btn btn-quiet btn-sm">
                <Icon name="users" className="h-4 w-4" /> Pick from Steam friends
              </button>
            ) : (
              <a href={signInHref("/?pick=1")} className="btn btn-quiet btn-sm">
                <Icon name="steam" className="h-4 w-4" /> Sign in to pick friends
              </a>
            ))}
        </div>

        {rows.length > ownMax && (
          <p className="mt-2 rounded-md border border-amber/30 bg-amber-wash px-3 py-2 text-xs text-ink-2">
            Free comparisons cover up to {FREE_MAX} players. Bigger groups work when anyone in the group has{" "}
            <Link href="/upgrade" className="font-semibold text-amber-hi underline">Premium</Link>.
          </p>
        )}

        {formError && (
          <p role="alert" className="mt-3 text-sm text-danger">{formError}</p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Opening results…" : submitLabel}
            {!submitting && <Icon name="arrow-right" className="h-4 w-4" />}
          </button>
          <Link href="/compare?demo=1" className="btn btn-quiet" onClick={() => track("demo_viewed", { location: "form" })}>
            See an example first
          </Link>
        </div>
        <p id={`${formId}-hint`} className="mt-4 text-xs leading-relaxed text-ink-3">
          Paste profile links, SteamID64s or custom URL names — even several at once. Each friend's{" "}
          <Link href="/guides/steam-game-details-private" className="underline hover:text-ink-1">Game details</Link> must be public. No passwords, ever.
        </p>
      </form>

      {saved.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="label mb-2.5">Saved groups</h3>
          <ul className="flex flex-wrap gap-2">
            {saved.map((g) => (
              <li key={g.id}>
                <button type="button" className="chip" onClick={() => go(g.ids)}>
                  <Icon name="bookmark" className="h-3.5 w-3.5" /> {g.name} <span className="count">{g.ids.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="label mb-2.5">Recent groups</h3>
          <ul className="flex flex-wrap gap-2">
            {recent.map((g) => (
              <li key={g.ids.join(",")} className="group relative">
                <button type="button" className="chip pr-8" onClick={() => go(g.ids)} title={g.names.join(", ")}>
                  <Icon name="users" className="h-3.5 w-3.5" /> {groupLabel(g.names)}
                </button>
                <button
                  type="button"
                  aria-label={`Forget ${groupLabel(g.names)}`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-4 hover:text-ink-1"
                  onClick={() => {
                    forgetGroup(g.ids);
                    setRecent(loadRecentGroups());
                  }}
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pickerOpen && (
        <FriendPicker
          onClose={() => setPickerOpen(false)}
          onConfirm={(ids) => {
            addFriends(ids);
            setPickerOpen(false);
          }}
          already={rows.map((r) => normalize(r.value)).filter(Boolean)}
          slots={HARD_MAX - rows.filter((r) => r.value.trim()).length}
        />
      )}
    </div>
  );
}

export { displayInput };
