import Link from "next/link";
import { Wordmark } from "@/components/SiteHeader";
import { BOT_INSTALL_URL, COMMUNITY_URL } from "@/lib/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Compare libraries" },
      { href: "/compare?demo=1", label: "See an example" },
      { href: "/discord", label: "Discord bot" },
      { href: "/upgrade", label: "Premium" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/guides/compare-steam-libraries", label: "Compare Steam libraries" },
      { href: "/guides/steam-game-details-private", label: "Fix a private library" },
      { href: "/guides/pick-a-game-with-friends", label: "Pick a game with friends" },
      { href: "/guides", label: "All guides" },
    ],
  },
  {
    title: "WeBothPlay",
    links: [
      { href: "/about", label: "About" },
      { href: "/help", label: "Help & FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Updates" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 max-w-sm md:col-span-1">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-ink-3">
            Find the games your whole group already owns, then actually pick one.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={BOT_INSTALL_URL} className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">Add the bot</a>
            <a href={COMMUNITY_URL} className="btn btn-quiet btn-sm" target="_blank" rel="noopener noreferrer">Join our Discord</a>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="label mb-4">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-2 transition-colors hover:text-ink-1">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} WeBothPlay ·{" "}
            <a href="https://steampowered.com" className="underline hover:text-ink-1" target="_blank" rel="noopener noreferrer">Powered by Steam</a>
            {" "}· Not affiliated with or endorsed by Valve Corporation. Steam is a trademark of Valve Corporation.
          </p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink-1">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-1">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
