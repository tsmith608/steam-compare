import Link from "next/link";
import CompareForm from "@/components/compare/CompareForm";
import { Icon } from "@/components/Icon";
import { SITE_URL } from "@/lib/site";

/** Landing page for one job (roulette, backlog, co-op) that opens results in that mode. */
export default function ToolLanding({ eyebrow, title, lede, extraQuery, submitLabel, points, faq, related, path }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "WeBothPlay", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${path}` },
    ],
  };
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div>
          <p className="label !text-accent-hi">{eyebrow}</p>
          <h1 className="display-wide mt-3 text-display-lg">{title}</h1>
          <p className="mt-4 text-body-lg text-ink-2">{lede}</p>
          <ul className="mt-8 space-y-4">
            {points.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-accent-hi" strokeWidth={2.25} />
                <span>
                  <strong className="text-ink-1">{t}</strong> <span className="text-ink-2">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <CompareForm extraQuery={extraQuery} submitLabel={submitLabel} />
        </div>
      </div>

      <section className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="tool-faq">
        <h2 id="tool-faq" className="display-wide text-display-md">Questions</h2>
        <div className="divide-y divide-line border-y border-line">
          {faq.map(([q, a]) => (
            <details key={q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <Icon name="plus" className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-5 pr-8 text-ink-2">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {related?.length > 0 && (
        <p className="mt-10 text-sm text-ink-3">
          Related:{" "}
          {related.map(([href, label], i) => (
            <span key={href}>
              {i > 0 && " · "}
              <Link href={href} className="text-accent-hi underline">{label}</Link>
            </span>
          ))}
        </p>
      )}
    </main>
  );
}
