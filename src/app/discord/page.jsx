import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";
import { Icon } from "@/components/Icon";
import { BOT_INSTALL_URL, COMMUNITY_URL } from "@/lib/site";
import { PLAN_LIMITS } from "@/lib/plans";

export const metadata = {
  title: "Discord bot — compare Steam libraries in your server",
  description: "Add the WeBothPlay bot to Discord: /compare your friends right in chat. Premium adds voice-channel compare, /roulette and /backlog.",
  alternates: { canonical: "/discord" },
};

const COMMANDS = [
  { cmd: "/link", desc: "Connect your Steam account (once). Uses Steam's own sign-in; we only read public library data.", plan: "Free" },
  { cmd: "/compare", desc: "Compare yourself and up to three friends — mention them. Add search: to find a specific shared game.", plan: "Free" },
  { cmd: "/compare (voice)", desc: `Run it in a voice channel to check everyone there — up to ${PLAN_LIMITS.Pro.maxPlayers} people on Pro, ${PLAN_LIMITS.Hacker.maxPlayers} on Hacker.`, plan: "Premium" },
  { cmd: "/help", desc: "Every command, right in Discord.", plan: "Free" },
  { cmd: "/roulette", desc: "Pick a random game everyone in the group owns.", plan: "Premium" },
  { cmd: "/backlog", desc: "Games you all own that nobody has really played.", plan: "Premium" },
  { cmd: "/compatibility", desc: "How much of your library overlaps with a friend's.", plan: "Premium" },
  { cmd: "/stats", desc: "Your gamer résumé: library size, hours, top games.", plan: "Premium" },
  { cmd: "/flex", desc: "Compare achievement progress on a game.", plan: "Premium" },
  { cmd: "/hype", desc: "What people in this server have been playing lately.", plan: "Premium" },
  { cmd: "/leaderboard", desc: "Server rankings by library size and recent playtime.", plan: "Premium" },
];

export default function DiscordPage() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Discord bot"
        accent="!text-[#8b95f5]"
        title="Settle it without leaving the voice channel."
        lede="The WeBothPlay bot compares everyone's Steam libraries right in your server, and links to the full results here when you want to dig in."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={BOT_INSTALL_URL} data-track="discord_cta_clicked" data-track-location="discord_page_bot" target="_blank" rel="noopener noreferrer" className="btn btn-discord btn-lg">
            <Icon name="discord" className="h-5 w-5" /> Add to your server
          </a>
          <a href={COMMUNITY_URL} data-track="discord_cta_clicked" data-track-location="discord_page_community" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">Join our community</a>
        </div>
      </PageHeader>

      <section aria-labelledby="setup" className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
        <h2 id="setup" className="sr-only">Setup</h2>
        {[
          ["01", "Add the bot", "A server admin adds it with the button above. It needs to read slash commands and send messages."],
          ["02", "Everyone runs /link", "Each friend links their Steam account once, through Steam's sign-in page."],
          ["03", "Run /compare", "Mention up to three friends. With Premium, run it in a voice channel to check everyone there."],
        ].map(([n, t, d]) => (
          <div key={n} className="bg-bg p-6">
            <span className="num text-sm text-accent-hi">{n}</span>
            <h3 className="display mt-3 text-xl">{t}</h3>
            <p className="mt-2 text-ink-2">{d}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="commands" className="mt-16">
        <h2 id="commands" className="display-wide text-display-md">Commands</h2>
        <div className="mt-6 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-1 text-ink-3">
              <tr>
                <th scope="col" className="label px-4 py-3">Command</th>
                <th scope="col" className="label px-4 py-3">What it does</th>
                <th scope="col" className="label px-4 py-3">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMMANDS.map((c) => (
                <tr key={c.cmd}>
                  <td className="whitespace-nowrap px-4 py-3"><code className="kbd">{c.cmd}</code></td>
                  <td className="px-4 py-3 text-ink-2">{c.desc}</td>
                  <td className={`whitespace-nowrap px-4 py-3 font-semibold ${c.plan === "Free" ? "text-ink-2" : "text-amber-hi"}`}>{c.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink-3">
          Premium commands unlock for anyone on <Link href="/upgrade" className="text-accent-hi underline">Pro or Hacker</Link> — and for the whole server when a Hacker member is in it.
        </p>
      </section>

      <section aria-labelledby="privacy" className="mt-16 max-w-3xl">
        <h2 id="privacy" className="display text-2xl">What the bot can see</h2>
        <p className="mt-3 text-ink-2">
          Only public Steam data for people who have run <code className="kbd">/link</code>: their game library, playtime and recent games — and only when someone runs a
          command. It doesn't read your messages. Unlinking is a message to us away (see <Link href="/contact" className="text-accent-hi underline">Contact</Link>).
        </p>
      </section>
    </main>
  );
}
