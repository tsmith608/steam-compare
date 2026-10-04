import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";
import { blogPosts } from "./data";

export const metadata = {
  title: "Updates",
  description: "What's new in WeBothPlay.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Updates" title="What's new" lede="Product updates, in plain words. Looking for how-tos? See the guides." />
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {blogPosts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group grid grid-cols-1 gap-2 py-6 sm:grid-cols-[10rem_1fr]">
              <span className="text-sm text-ink-3">{p.date}</span>
              <span>
                <span className="display block text-xl group-hover:text-accent-hi">{p.title}</span>
                <span className="mt-1 block text-ink-2">{p.excerpt}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-ink-3">
        <Link href="/guides" className="text-accent-hi underline">Browse the guides</Link>
      </p>
    </main>
  );
}
