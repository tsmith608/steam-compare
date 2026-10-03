import Link from "next/link";
import { SITE_URL } from "@/lib/site";

/** Article shell with breadcrumb + Article/BreadcrumbList structured data. */
export default function GuideLayout({ slug, title, description, updated, children }) {
  const url = `${SITE_URL}/guides/${slug}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      dateModified: updated,
      author: { "@type": "Organization", name: "WeBothPlay", url: SITE_URL },
      publisher: { "@type": "Organization", name: "WeBothPlay", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    },
  ];
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
        <Link href="/guides" className="hover:text-ink-1">Guides</Link> <span aria-hidden>/</span> <span className="text-ink-2">{title}</span>
      </nav>
      <article className="mt-6">
        <h1 className="display-wide max-w-3xl text-display-lg">{title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-2">{description}</p>
        <p className="mt-3 text-xs text-ink-3">Updated {new Date(updated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        <div className="prose-wbp mt-10">{children}</div>
      </article>
      <aside className="surface mt-14 flex max-w-3xl flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">See what your group owns</p>
          <p className="text-sm text-ink-3">Paste everyone's Steam profiles — free for up to 8 players.</p>
        </div>
        <Link href={`/?utm_source=guide&utm_campaign=${slug}`} className="btn btn-primary">Compare libraries</Link>
      </aside>
    </main>
  );
}
