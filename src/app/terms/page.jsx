import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata = { title: "Terms", description: "The terms for using WeBothPlay and its Discord bot.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Last updated 3 October 2026" title="Terms of use" />
      <div className="prose-wbp mt-10">
        <h2>The service</h2>
        <p>
          WeBothPlay compares publicly available Steam data to show which games a group of people own. Results depend on Steam's data and each
          person's privacy settings, so they can be incomplete or out of date. WeBothPlay is independent and is not affiliated with, endorsed or
          sponsored by Valve Corporation. Steam and the Steam logo are trademarks of Valve Corporation.
        </p>
        <h2>Using it fairly</h2>
        <ul>
          <li>Don't use WeBothPlay to harass people or to collect data about them at scale.</li>
          <li>Don't scrape, overload or try to break the site, its API or the Discord bot.</li>
          <li>Don't put unlawful or abusive content in profile pages, collections, group names or votes.</li>
        </ul>
        <p>We may limit or remove access that breaks these rules.</p>
        <h2>Premium subscriptions</h2>
        <ul>
          <li>Premium plans renew automatically each month or year until you cancel.</li>
          <li>You can cancel at any time from Plan &amp; billing; you keep Premium until the end of the period you've paid for.</li>
          <li>Prices are shown on the <Link href="/upgrade">Premium page</Link> before you pay. If a price changes we'll tell you before it applies to you.</li>
          <li>If something goes wrong with a charge, contact us and we'll make it right, including refunds where appropriate.</li>
          <li>Payments are processed by Stripe under its own terms.</li>
        </ul>
        <h2>Your content</h2>
        <p>You keep ownership of what you add (profile text, collections, group names). You let us store and display it so the features work.</p>
        <h2>No warranty</h2>
        <p>
          WeBothPlay is provided "as is". We work to keep it fast and accurate, but we can't promise it will always be available or error-free. To the
          extent the law allows, we aren't liable for indirect losses arising from using it.
        </p>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms; the date above will change when we do. Questions: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </div>
    </main>
  );
}
