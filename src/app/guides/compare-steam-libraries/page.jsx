import Link from "next/link";
import GuideLayout from "@/components/content/GuideLayout";
import { GUIDES } from "@/lib/guides";

const g = GUIDES.find((x) => x.slug === "compare-steam-libraries");
export const metadata = { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` } };

export default function Guide() {
  return (
    <GuideLayout {...g}>
      <p>
        Most friend groups own far more games in common than they think — the problem is seeing it. Here are the two quickest ways to find the overlap,
        plus the one setting that trips everyone up.
      </p>

      <h2>The quick way: compare everyone at once</h2>
      <ol>
        <li>Open <Link href="/">WeBothPlay</Link>.</li>
        <li>Paste each person's Steam profile link (or SteamID64, or custom URL name). You can paste several at once.</li>
        <li>Press <strong>Compare libraries</strong>. You'll see every game you all own, sorted by what your group actually plays.</li>
      </ol>
      <p>
        From there you can filter to co-op or PvP, see games only one person is missing (“one copy away”), find games nobody has launched, spin a
        roulette or send the group a vote. It's free for up to eight people.
      </p>

      <h2>Steam's built-in option</h2>
      <p>
        The Steam desktop client can also suggest games to play together from a chat with your friends. It's handy for a quick look. What it doesn't do
        is show who has played what, which games a single purchase would unlock, or let the group vote — and it isn't on your phone. Menu names in Steam
        change from time to time, so if you can't find it, the comparison above always works in a browser.
      </p>

      <h2 id="find-profile">How to find a Steam profile link</h2>
      <ul>
        <li><strong>Steam desktop app:</strong> open the profile, right-click an empty area of the page and choose <em>Copy Page URL</em>.</li>
        <li><strong>Browser:</strong> go to the profile on steamcommunity.com and copy the address from the address bar.</li>
        <li><strong>Steam mobile app:</strong> open the profile and use the share or copy-link option.</li>
      </ul>
      <p>A profile link looks like one of these:</p>
      <ul>
        <li><code>https://steamcommunity.com/profiles/76561198000000000</code> — the 17-digit number is the SteamID64.</li>
        <li><code>https://steamcommunity.com/id/yourname</code> — <code>yourname</code> is the custom URL name.</li>
      </ul>
      <p>
        A <strong>display name</strong> (the name people see in chat) is not the same as a custom URL name, and it isn't unique — so paste the link if
        you're not sure.
      </p>

      <h2>Why someone's games are missing</h2>
      <p>
        Comparison tools can only read libraries whose <strong>Game details</strong> privacy setting is public. It's separate from profile visibility,
        which is why “my profile is public!” doesn't always fix it. Here's <Link href="/guides/steam-game-details-private">the 30-second fix</Link>.
      </p>

      <h2>Good to know</h2>
      <ul>
        <li><strong>Family Sharing:</strong> Steam's API lists games each person owns. Borrowed games only count if they've been played in the last two weeks.</li>
        <li><strong>Free-to-play games</strong> only appear in a library after they've been launched once.</li>
        <li><strong>Hidden playtime:</strong> if someone ticks “Always keep my total playtime private”, their games still appear but show zero hours.</li>
      </ul>
    </GuideLayout>
  );
}
