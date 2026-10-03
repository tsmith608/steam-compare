import PageHeader from "@/components/content/PageHeader";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Privacy",
  description: "What WeBothPlay collects, why, where it's stored and how to delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Last updated 3 October 2026" title="Privacy" lede="The short version: we read public Steam data to compare libraries, we don't sell anything, and we keep as little as we can." />
      <div className="prose-wbp mt-10">
        <h2>What we collect and why</h2>
        <h3>When you compare libraries</h3>
        <p>
          You give us Steam profile links, SteamID64s or custom URL names. We use the official Steam Web API to fetch the public data for
          those profiles — display name, avatar, owned games, playtime, recently played games and wishlist — and compare them. We don't save
          those libraries; Steam responses are held in server memory for up to an hour so repeat requests are fast, then discarded. We do
          keep public store information about games (genres, categories, price) to power filters.
        </p>
        <h3>When you sign in through Steam</h3>
        <p>
          Sign-in happens on Steam's website; we never see your password. Steam tells us your SteamID64, and we store it with your display
          name, avatar and custom URL. If you use them, we also store your profile customizations, collections, saved groups, your plan status
          and — if you link the Discord bot — your Discord user ID.
        </p>
        <h3>Share links and votes</h3>
        <p>
          A share link stores the SteamID64s in that comparison and a summary (names, avatars, counts and a few game titles) so the link and its
          preview card work. A vote stores a random voter ID kept in your browser, the name you type (optional) and your choices.
        </p>
        <h3>Payments</h3>
        <p>
          Subscriptions are processed by Stripe. We receive a customer ID, subscription status and renewal date; your card details and billing
          email stay with Stripe. Older Ko-fi payments: we store the Ko-fi transaction ID, amount, tier, supporter name, email and message so we can
          match the payment to your account.
        </p>
        <h3>Analytics</h3>
        <p>
          We count product events (for example "comparison started" or "vote cast") with a random browser ID, the page path, the referring
          website's domain and campaign tags. No Steam IDs, names or IP addresses are stored with these events. We also use Google Analytics,
          which sets cookies to measure visits.
        </p>

        <h2>Cookies and browser storage</h2>
        <ul>
          <li><strong>wbp_session</strong> — keeps you signed in (30 days, HttpOnly).</li>
          <li><strong>steam_nonce, wbp_next</strong> — protect the sign-in round trip (10 minutes).</li>
          <li>Local storage — your random analytics ID, recent groups, layout preference and voter name.</li>
          <li>Session storage — your shortlist and where this visit came from.</li>
          <li>Google Analytics cookies (<strong>_ga</strong> and similar).</li>
        </ul>

        <h2>Who processes data for us</h2>
        <p>
          Valve (Steam Web API, sign-in), Vercel (hosting), Supabase (database), Stripe (payments), Ko-fi (legacy payments), Google (analytics) and
          Discord (the bot). We don't sell or rent personal data, and we don't use it for advertising.
        </p>

        <h2>Where data is stored</h2>
        <p>Our database and servers are in the United States.</p>

        <h2>How long we keep it</h2>
        <ul>
          <li>Account data: until you ask us to delete it.</li>
          <li>Share links and votes: until you ask us to remove them.</li>
          <li>Analytics events: 13 months.</li>
          <li>Payment records: as long as tax and accounting rules require.</li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can ask us to export or delete your data, unlink Discord, or remove a share link: email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          You can also make your Steam game details private at any time — we'll then be unable to read them.
        </p>

        <h2>Children</h2>
        <p>WeBothPlay isn't directed at children under 13, and we don't knowingly collect their data.</p>

        <h2>Changes</h2>
        <p>If we change this policy in a way that matters, we'll update the date above and mention it on the site.</p>
      </div>
    </main>
  );
}
