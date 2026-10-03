"use client";
import Link from "next/link";
import CopyButton from "@/components/results/CopyButton";
import { Icon } from "@/components/Icon";
import { SITE_URL } from "@/lib/site";

const message = (name) =>
  `Hey${name ? ` ${name}` : ""}! Can you make your Steam game list visible so we can see what we all own? ` +
  `Steam → your profile → Edit Profile → Privacy Settings → set "Game details" to Public (and untick "Always keep my total playtime private"). ` +
  `Takes 30 seconds: ${SITE_URL}/guides/steam-game-details-private`;

export function PrivateHelp({ blocked }) {
  return (
    <ul className="space-y-3">
      {blocked.map((b) => (
        <li key={b.steamid} className="flex flex-col gap-2 rounded-lg border border-line bg-bg-raised p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Icon name="eye-off" className="h-4 w-4 text-warning" />
            <strong className="text-ink-1">{b.username}</strong>
            <span className="text-ink-3">— game details are private</span>
          </span>
          <CopyButton text={message(b.username)} label="Copy a message for them" done="Message copied" />
        </li>
      ))}
    </ul>
  );
}

export default function PrivateBanner({ blocked }) {
  if (!blocked?.length) return null;
  const names = blocked.map((b) => b.username);
  return (
    <section aria-label="Hidden libraries" className="rounded-lg border border-warning/30 bg-warning/[0.06] p-4 sm:p-5">
      <p className="text-sm text-ink-1">
        <strong>{names.length === 1 ? names[0] : `${names.length} friends`}</strong>{" "}
        {names.length === 1 ? "isn't" : "aren't"} included — their Steam game details are private. Everything below is for the rest of
        the group.{" "}
        <Link href="/guides/steam-game-details-private" className="text-accent-hi underline">How to fix it</Link>
      </p>
      <div className="mt-3">
        <PrivateHelp blocked={blocked} />
      </div>
    </section>
  );
}
