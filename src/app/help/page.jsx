import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";
import { Icon } from "@/components/Icon";
import { HOME_FAQ } from "@/lib/faq";

export const metadata = {
  title: "Help & troubleshooting",
  description: "Fix missing games, private Steam libraries, sign-in, billing and Discord bot problems.",
  alternates: { canonical: "/help" },
};

const TROUBLE = [
  {
    q: "A friend shows as private",
    a: (
      <>
        Their Steam <strong>Game details</strong> setting isn't public. On Steam: profile → <em>Edit Profile</em> → <em>Privacy Settings</em> → set{" "}
        <em>Game details</em> to <strong>Public</strong>. Changes usually show up within a few minutes. <Link href="/guides/steam-game-details-private">Step-by-step guide</Link>.
      </>
    ),
  },
  {
    q: "Everyone shows 0 hours",
    a: "Steam has a separate “Always keep my total playtime private” checkbox under Game details. When it's ticked, games still appear but playtime reads as zero — which also makes them look unplayed.",
  },
  {
    q: "“We couldn't find that profile”",
    a: (
      <>
        Custom URL names are the part after <code>steamcommunity.com/id/</code> — not the display name you see in chat, which isn't unique. When in
        doubt, paste the full profile link. <Link href="/guides/compare-steam-libraries#find-profile">How to find a profile link</Link>.
      </>
    ),
  },
  {
    q: "A game we both play isn't listed",
    a: "Family Sharing: Steam's API lists games each person owns. Borrowed games only count if they were played in the last two weeks. Free-to-play games only appear once they've been launched.",
  },
  {
    q: "Steam is down or slow",
    a: "We depend on Steam's API. If it's having a moment, comparisons fail with a “Steam isn't responding” message — wait a minute and try again.",
  },
  {
    q: "Billing: cancel, change plan, invoices",
    a: (
      <>
        Open your account menu → <em>Plan &amp; billing</em>. You can switch plans, cancel (you keep Premium until the end of the paid period), update your
        card and download invoices. Still stuck? <Link href="/contact">Contact us</Link>.
      </>
    ),
  },
  {
    q: "The Discord bot says I'm not linked",
    a: (
      <>
        Run <code>/link</code> in Discord and open the link within an hour. Sign in through Steam on that page, then press <em>Link to Discord</em>.
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Help" title="Troubleshooting" lede="The fixes for the things that actually go wrong." />
      <section className="mt-10 divide-y divide-line border-y border-line" aria-label="Troubleshooting">
        {TROUBLE.map((t) => (
          <details key={t.q} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {t.q}
              <Icon name="plus" className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
            </summary>
            <div className="prose-wbp pb-5 pr-8">{t.a}</div>
          </details>
        ))}
      </section>
      <h2 className="display-wide mt-16 text-display-md">General questions</h2>
      <section className="mt-6 divide-y divide-line border-y border-line" aria-label="FAQ">
        {HOME_FAQ.map((f) => (
          <details key={f.q} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="plus" className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
            </summary>
            <p className="pb-5 pr-8 text-ink-2">{f.a}</p>
          </details>
        ))}
      </section>
      <p className="mt-10 text-ink-2">
        Didn't find it? <Link href="/contact" className="text-accent-hi underline">Contact us</Link>.
      </p>
    </main>
  );
}
