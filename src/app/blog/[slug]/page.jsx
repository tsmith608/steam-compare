import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "../data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt, alternates: { canonical: `/blog/${slug}` } };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <Link href="/blog" className="text-sm text-ink-3 hover:text-ink-1">← All updates</Link>
      <article className="mt-6">
        <p className="label">{post.date}</p>
        <h1 className="display-wide mt-3 max-w-3xl text-display-lg">{post.title}</h1>
        {/* Post bodies are static, first-party HTML from ./data.js. */}
        <div className="prose-wbp mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </main>
  );
}
