import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";
import { GUIDES, TOOLS } from "@/lib/guides";

export const metadata = {
  title: "Guides",
  description: "Practical guides for finding games you and your friends can play together on Steam.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Guides" title="Get your group playing faster." />
      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="surface block h-full p-6 transition hover:border-line-strong">
              <h2 className="display text-xl">{g.title}</h2>
              <p className="mt-2 text-sm text-ink-2">{g.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="label mt-16">Tools</h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block h-full rounded-lg border border-line p-5 transition hover:border-line-strong">
              <p className="font-semibold">{t.title}</p>
              <p className="mt-1 text-sm text-ink-3">{t.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
