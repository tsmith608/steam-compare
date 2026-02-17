import { blogPosts } from '../data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} - We Both Play Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-24 pb-12 px-6">
            <article className="max-w-3xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-white mb-8 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Blog
                </Link>

                <header className="mb-10 text-center">
                    <div className="text-blue-400 font-medium mb-3">{post.date}</div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                        {post.title}
                    </h1>
                </header>

                <div
                    className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />


                <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                    <div className="text-gray-500 text-sm">
                        Share this post
                    </div>
                    <div className="flex gap-4">
                        {/* Placeholder generic share buttons or just simple text */}
                        <button className="text-gray-400 hover:text-white transition">
                            Copy Link
                        </button>
                    </div>
                </div>
            </article>
        </main>
    );
}
