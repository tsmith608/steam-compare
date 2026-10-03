import Link from "next/link";
import GuideLayout from "@/components/content/GuideLayout";
import { GUIDES } from "@/lib/guides";

const g = GUIDES.find((x) => x.slug === "steam-game-details-private");
export const metadata = { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` } };

export default function Guide() {
  return (
    <GuideLayout {...g}>
      <p>
        If a comparison tool says someone's library is private — even though their profile is public — it's almost always one setting:{" "}
        <strong>Game details</strong>.
      </p>

      <h2>Why it happens</h2>
      <p>
        Steam has separate privacy settings for your profile, your friends list, your inventory and your <strong>game details</strong> (the list of games
        you own and your playtime). Each can be Public, Friends Only or Private. Tools that use Steam's official API — including WeBothPlay — can only see
        game details that are set to <strong>Public</strong>. “Friends Only” looks private to them.
      </p>

      <h2>The fix (about 30 seconds)</h2>
      <ol>
        <li>In Steam (desktop or browser), go to your profile and choose <strong>Edit Profile</strong>.</li>
        <li>Open <strong>Privacy Settings</strong>. In a browser you can jump straight there: <code>steamcommunity.com/my/edit/settings</code>.</li>
        <li>Set <strong>Game details</strong> to <strong>Public</strong>. Steam saves the change automatically.</li>
        <li>Optional: untick <strong>Always keep my total playtime private</strong> if you want your hours to count (otherwise every game shows zero hours).</li>
      </ol>
      <p>
        In the Steam mobile app the same settings live under your profile's edit and privacy options; the wording can differ slightly between app
        versions.
      </p>

      <h2>How long until it works?</h2>
      <p>Usually right away. Occasionally Steam takes a few minutes to update what its API returns — try the comparison again shortly.</p>

      <h2>What becomes visible?</h2>
      <p>
        The games you own, your playtime and what you've played recently. It doesn't reveal purchases, payment details, your email or your password, and
        you can switch it back to private whenever you like.
      </p>

      <h2>Asking a friend to change it</h2>
      <p>On a WeBothPlay result, press <strong>Copy a message for them</strong> next to the private friend — it includes these steps. Or send:</p>
      <blockquote className="rounded-lg border border-line bg-surface-1 p-4 text-ink-1">
        Can you make your Steam game list visible so we can see what we all own? Steam → your profile → Edit Profile → Privacy Settings → set “Game
        details” to Public.
      </blockquote>
      <p className="mt-6">
        Then <Link href="/">compare your libraries</Link>.
      </p>
    </GuideLayout>
  );
}
