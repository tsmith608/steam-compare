import { Suspense } from "react";
import Link from "next/link";
import CompareForm from "@/components/compare/CompareForm";
import CompareFormFromURL from "@/components/compare/CompareFormFromURL";
import HeroDemo from "@/components/home/HeroDemo";
import OverlapMark from "@/components/home/OverlapMark";
import { Icon } from "@/components/Icon";
import { computeComparison } from "@/lib/compare";
import { DEMO_PROFILES, DEMO_STEAM_IDS, FIXTURE_GAMES, fixtureLibrary, fixtureRecent } from "@/lib/steam-fixtures";
import { BOT_INSTALL_URL, SITE_URL } from "@/lib/site";
import { PLAN_LIMITS } from "@/lib/plans";
import { HOME_FAQ } from "@/lib/faq";

export const metadata = {
  alternates: { canonical: "/" },
};

// Built at compile time from the fictional demo group.
function buildDemo() {
  const players = DEMO_STEAM_IDS.map((id) => ({ steamid: id, games: fixtureLibrary(id), recent: fixtureRecent(id) }));
  const r = computeComparison(players);
  const meta = new Map(FIXTURE_GAMES.map(([appid, , , cats]) => [appid, cats]));
  const tagsFor = (appid) => {
    const c = meta.get(appid) || [];
    return [
      c.includes("Online Co-op") && "Online co-op",
      c.includes("Shared/Split Screen Co-op") && "Couch co-op",
      c.includes("Online PvP") && "PvP",
      c.includes("Full controller support") && "Controller",
    ].filter(Boolean).slice(0, 3);
  };
  const picks = [
    r.shared.find((g) => g.recentBy >= 2),
    r.shared.find((g) => g.name === "Deep Rock Galactic"),
    r.backlog[0] && r.shared.find((g) => g.appid === r.backlog[0].appid),
    r.shared.find((g) => g.name === "Left 4 Dead 2"),
  ]
    .filter(Boolean)
    .filter((g, i, a) => a.findIndex((x) => x.appid === g.appid) === i)
    .map((g) => ({
      appid: g.appid,
      name: g.name,
      tags: tagsFor(g.appid),
      note: g.recentBy >= 2 ? "played lately" : g.totalMinutes === 0 ? "nobody's launched it" : `${Math.round(g.totalMinutes / 60)} h together`,
    }));
  return {
    sharedCount: r.stats.sharedCount,
    unionCount: r.stats.unionCount,
    nearMiss: r.nearMisses[0],
    backlogCount: r.stats.backlogCount,
    players: DEMO_STEAM_IDS.map((id) => ({ name: DEMO_PROFILES[id].personaname, avatar: DEMO_PROFILES[id].avatar, count: r.stats.libraryCounts[id] })),
    picks,
  };
}

const STEPS = [
  {
    n: "01",
    title: "Add your group",
    body: "Paste profile links, or sign in through Steam and tick friends off your list. Two to sixteen people.",
  },
  {
    n: "02",
    title: "See the overlap",
    body: "Every game you all own, sorted by what you actually play — plus the ones a single copy would unlock.",
  },
  {
    n: "03",
    title: "Actually decide",
    body: "Filter to co-op, shortlist a few, send a vote to the group chat, or let the roulette pick for you.",
  },
];

export default function HomePage() {
  const demo = buildDemo();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "WeBothPlay",
      url: SITE_URL,
      applicationCategory: "GameApplication",
      operatingSystem: "Any (web browser)",
      description: "Compare Steam libraries with friends to find the games everyone owns and decide what to play together.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    { "@context": "https://schema.org", "@type": "Organization", name: "WeBothPlay", url: SITE_URL, logo: `${SITE_URL}/icon.png` },
  ];

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <OverlapMark className="pointer-events-none absolute -right-40 top-6 hidden w-[760px] opacity-70 lg:block" />
        <div className="container-page relative grid grid-cols-1 items-start gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <p className="label mb-5 flex items-center gap-2 !text-accent-hi">
              <span className="h-px w-6 bg-accent-hi" aria-hidden /> Steam library compare · free for up to {PLAN_LIMITS.Noob.maxPlayers}
            </p>
            <h1 className="display-wide text-display-xl !leading-[1.02]">
              What are we
              <br />
              playing <span className="text-accent-hi">tonight?</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-body-lg text-ink-2">
              Drop in your friends' Steam profiles. In seconds you'll see every game your whole group already owns — and then
              actually pick one.
            </p>
            <div className="mt-8 max-w-[38rem]">
              <Suspense fallback={<CompareForm />}>
                <CompareFormFromURL />
              </Suspense>
            </div>
          </div>
          <div className="lg:pt-16">
            <HeroDemo demo={demo} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- How it works */}
      <section aria-labelledby="how" className="border-y border-line bg-bg-raised">
        <div className="container-page py-16 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 id="how" className="max-w-xl display-wide text-display-md">Thirty seconds from "what do we play" to launching it.</h2>
            <Link href="/compare?demo=1" className="btn btn-ghost self-start sm:self-auto">See an example</Link>
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-bg-raised p-6 sm:p-8">
                <span className="num text-sm text-accent-hi">{s.n}</span>
                <h3 className="mt-4 display text-2xl">{s.title}</h3>
                <p className="mt-3 text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section aria-labelledby="features" className="container-page py-20 sm:py-28">
        <p className="label mb-4">More than a list</p>
        <h2 id="features" className="max-w-3xl display-wide text-display-lg">
          Built for the part where everyone says <span className="text-ink-3">"I don't mind, you pick."</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6">
          <article className="surface p-6 md:col-span-4 sm:p-8">
            <Icon name="gift" className="h-6 w-6 text-accent-hi" />
            <h3 className="mt-5 display text-2xl">One copy away</h3>
            <p className="mt-2 max-w-lg text-ink-2">
              See the games everyone owns except one person — so you know which single purchase unlocks the most nights together.
            </p>
            {demo.nearMiss && (
              <div className="mt-6 flex items-center gap-3 rounded-lg border border-line bg-bg-raised p-3 text-sm">
                <span className="tag !bg-accent-wash !text-accent-hi">Example</span>
                <span className="truncate">
                  <strong className="text-ink-1">{demo.nearMiss.name}</strong>
                  <span className="text-ink-3"> — everyone owns it except {DEMO_PROFILES[demo.nearMiss.missing[0]].personaname.replace("Demo · ", "")}</span>
                </span>
              </div>
            )}
          </article>
          <article className="surface p-6 md:col-span-2 sm:p-8">
            <Icon name="ghost" className="h-6 w-6 text-accent-hi" />
            <h3 className="mt-5 display text-2xl">The shared backlog</h3>
            <p className="mt-2 text-ink-2">
              Games you all own and nobody has launched. Our example group has <span className="num text-ink-1">{demo.backlogCount}</span>.
            </p>
          </article>
          <article className="surface p-6 md:col-span-2 sm:p-8">
            <Icon name="dice" className="h-6 w-6 text-accent-hi" />
            <h3 className="mt-5 display text-2xl">Roulette</h3>
            <p className="mt-2 text-ink-2">Filter to what fits tonight, then spin. No more twenty-minute debates.</p>
          </article>
          <article className="surface p-6 md:col-span-2 sm:p-8">
            <Icon name="vote" className="h-6 w-6 text-accent-hi" />
            <h3 className="mt-5 display text-2xl">Group vote</h3>
            <p className="mt-2 text-ink-2">Shortlist a few and drop a vote link in the chat. Everyone taps, one veto each.</p>
          </article>
          <article className="surface p-6 md:col-span-2 sm:p-8">
            <Icon name="share" className="h-6 w-6 text-accent-hi" />
            <h3 className="mt-5 display text-2xl">Share the verdict</h3>
            <p className="mt-2 text-ink-2">A link with a proper preview card — "we own 39 games in common, somehow we still play CS2."</p>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------------------- Discord */}
      <section aria-labelledby="discord" className="container-page">
        <div className="surface-raised grid grid-cols-1 items-center gap-10 overflow-hidden p-6 sm:p-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="label mb-4 !text-[#8b95f5]">Discord bot</p>
            <h2 id="discord" className="display-wide text-display-md">Already in a voice channel?</h2>
            <p className="mt-3 max-w-xl text-ink-2">
              Type <code className="kbd">/compare</code> and the bot checks everyone in the channel. <code className="kbd">/roulette</code> picks
              for you. Results link back here when you want the full picture.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={BOT_INSTALL_URL} data-track="discord_cta_clicked" data-track-location="home_bot" target="_blank" rel="noopener noreferrer" className="btn btn-discord">
                <Icon name="discord" className="h-5 w-5" /> Add to your server
              </a>
              <Link href="/discord" className="btn btn-ghost">All commands</Link>
            </div>
          </div>
          <div className="hidden w-[320px] rounded-lg border border-line bg-[#1e1f22] p-4 font-sans text-sm md:block" aria-hidden>
            <p className="text-[#949ba4]"><span className="font-semibold text-[#f2f3f5]">nova</span> used <span className="text-[#c9cdfb]">/compare</span></p>
            <div className="mt-3 rounded border-l-4 border-[#60a5fa] bg-[#2b2d31] p-3">
              <p className="font-semibold text-[#f2f3f5]">4 players · 39 shared games</p>
              <p className="mt-1 text-[#b5bac1]">Top pick: Deep Rock Galactic</p>
              <p className="mt-2 text-xs text-[#949ba4]">View full comparison →</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- FAQ */}
      <section aria-labelledby="faq" className="container-page grid grid-cols-1 gap-10 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 id="faq" className="display-wide text-display-md">Questions, answered</h2>
          <p className="mt-3 text-ink-2">
            Still stuck? <Link href="/help" className="text-accent-hi underline">Help &amp; troubleshooting</Link> covers the rest.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {HOME_FAQ.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink-1 [&::-webkit-details-marker]:hidden">
                {f.q}
                <Icon name="plus" className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-5 pr-8 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- Final CTA */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-xl border border-line bg-bg-raised px-6 py-14 text-center sm:py-20">
          <OverlapMark className="pointer-events-none absolute left-1/2 top-1/2 w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-40" label={false} />
          <div className="relative">
            <h2 className="display-wide text-display-lg">Your group owns more games than you think.</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#main" className="btn btn-primary btn-lg">Compare your libraries</a>
              <Link href="/compare?demo=1" className="btn btn-ghost btn-lg">See an example</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
