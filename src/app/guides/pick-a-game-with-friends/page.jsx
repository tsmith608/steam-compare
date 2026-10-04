import Link from "next/link";
import GuideLayout from "@/components/content/GuideLayout";
import { GUIDES } from "@/lib/guides";

const g = GUIDES.find((x) => x.slug === "pick-a-game-with-friends");
export const metadata = { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` } };

export default function Guide() {
  return (
    <GuideLayout {...g}>
      <p>
        Every group has had the night where choosing the game takes longer than playing it. This routine gets you from “what do you guys want to play?”
        to launching something in a few minutes — and nobody gets stuck with a game they hate.
      </p>

      <h2>1. Start from what everyone already owns</h2>
      <p>
        Nothing kills momentum like “I'd have to buy it”. Begin with the overlap — the games every person already has. <Link href="/">Compare your
        libraries</Link> to see it; most groups are surprised how long the list is.
      </p>

      <h2>2. Filter for tonight, not forever</h2>
      <ul>
        <li><strong>Co-op or competitive?</strong> Decide the mood first; it halves the list.</li>
        <li><strong>How long do you have?</strong> An hour suits roguelikes, party games and quick matches. A whole evening suits survival, crafting and campaigns.</li>
        <li><strong>Same room?</strong> Look for couch or Remote Play options and controller support.</li>
      </ul>

      <h2>3. Check the headcount</h2>
      <p>
        Many co-op games cap players — Deep Rock Galactic, Lethal Company and Phasmophobia are four-player games, It Takes Two is two, while Valheim allows
        up to ten. Steam doesn't publish player limits in its data, so check the store page when your group is big.
      </p>

      <h2>4. Shortlist three to five, then vote</h2>
      <p>
        Pick a handful of candidates and let everyone vote on all of them. Give each person <strong>one veto</strong>: it protects people from the game
        they really don't want, without letting one person block everything. On WeBothPlay, star games and press <strong>Start a vote</strong> to get a
        link for the group chat.
      </p>

      <h2>5. Still tied? Let the dice decide</h2>
      <p>Spin among the games nobody vetoed. Agreeing to accept the roulette's pick in advance is what makes it work.</p>

      <h2>When one person doesn't own the game</h2>
      <ul>
        <li><strong>Remote Play Together:</strong> for games that support it, only the host needs a copy — friends join through Steam.</li>
        <li><strong>One copy away:</strong> if everyone but one person owns something, it may be worth picking up on sale. WeBothPlay lists these for groups of three or more.</li>
        <li><strong>Free-to-play:</strong> keep a free fallback everyone can install.</li>
      </ul>

      <h2>Keep a default</h2>
      <p>Every group should have one comfort game everyone's happy to fall back on. When the vote stalls, play that — and try the roulette next time.</p>
    </GuideLayout>
  );
}
