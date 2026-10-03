import { SITE_URL } from "@/lib/site";
import { GUIDES } from "@/lib/guides";
import { blogPosts } from "./blog/data";

// Only indexable, evergreen pages. Comparison, share, vote and profile pages
// are per-user and carry noindex. Google ignores priority/changefreq.
const UPDATED = "2026-10-03";

export default function sitemap() {
  const pages = ["/", "/roulette", "/backlog", "/coop", "/discord", "/upgrade", "/guides", "/help", "/about", "/blog", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}`, lastModified: UPDATED })),
    ...GUIDES.map((g) => ({ url: `${SITE_URL}/guides/${g.slug}`, lastModified: g.updated })),
    ...blogPosts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.date).toISOString().slice(0, 10) })),
  ];
}
