import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";
import { Icon } from "@/components/Icon";
import { COMMUNITY_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata = { title: "Contact", description: "Get help with WeBothPlay, billing or the Discord bot.", alternates: { canonical: "/contact" } };

const TOPICS = [
  ["A friend's games don't show up", "/guides/steam-game-details-private", "Almost always the Steam “Game details” privacy setting. The fix takes 30 seconds."],
  ["Billing, receipts or cancelling", "/upgrade", "Open Plan & billing from your account menu to change or cancel your plan, update your card or download invoices."],
  ["Discord bot questions", "/discord", "Setup steps and every command."],
];

export default function ContactPage() {
  const subject = encodeURIComponent("WeBothPlay help");
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Contact" title="Need a hand?" lede="Most answers are one click away. If not, email us — a real person reads every message." />
      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {TOPICS.map(([t, href, d]) => (
          <li key={t}>
            <Link href={href} className="surface block h-full p-5 transition hover:border-line-strong">
              <p className="font-semibold text-ink-1">{t}</p>
              <p className="mt-2 text-sm text-ink-2">{d}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="surface-raised mt-8 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="display text-xl">Email support</h2>
          <p className="mt-1 text-ink-2">
            Include your Steam profile link and, for billing, the email on your receipt. We usually reply within two working days.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`mailto:${SUPPORT_EMAIL}?subject=${subject}`} className="btn btn-primary">Email us</a>
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><Icon name="discord" className="h-4 w-4" /> Discord</a>
        </div>
      </div>
    </main>
  );
}
