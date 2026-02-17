import Link from 'next/link';
import { blogPosts } from './data';

export const metadata = {
    title: 'Blog - We Both Play',
    description: 'Updates, news, and roadmap for We Both Play.',
};

export default function BlogListingPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Latest <span className="text-blue-500">Updates</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Follow our journey as we build the ultimate tool for finding shared games.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                    <article key={post.slug} className="bg-[#12141a] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col">
                        <Link href={`/blog/${post.slug}`} className="block flex-1 p-6">
                            <div className="text-sm text-blue-400 font-medium mb-3">
                                {post.date}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                {post.title}
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {post.excerpt}
                            </p>
                        </Link>
                        <div className="px-6 pb-6 mt-auto">
                            <Link
                                href={`/blog/${post.slug}`}
                                className="inline-flex items-center text-sm font-bold text-white hover:text-blue-400 transition-colors"
                            >
                                Read Article
                                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
