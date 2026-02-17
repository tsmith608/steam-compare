"use client";

import Link from "next/link";
import GoogleAdSense from "../components/GoogleAdSense";

export default function AboutPage() {
    return (
        <main className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">

            {/* Background radial gradient sync */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
                }}
            />

            <div className="flex-grow w-full max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10 flex flex-col items-center">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extralight tracking-tight bg-gradient-to-b from-white via-white/80 to-white/50 bg-clip-text text-transparent">
                        About <span className="font-semibold block mt-2 text-blue-400">We Both Play</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        The easiest way to find common ground in your Steam libraries.
                    </p>
                </div>

                {/* Content Cards */}
                <div className="space-y-8 text-sm md:text-base">

                    {/* Mission Card */}
                    <div className="glass-panel p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            </span>
                            Why we built this
                        </h2>
                        <div className="space-y-6 text-gray-300 leading-relaxed">
                            <p>
                                We Both Play was built to solve a simple yet frustrating problem: figuring out what games you and your friends can play together without manually scrolling through hundreds of library items.
                            </p>
                            <p>
                                Whether you're looking for a co-op adventure to tackle over the weekend, a competitive shooter to grind ranks in, or just want to see who owns that one niche indie game, we've got you covered.
                            </p>
                        </div>
                    </div>

                    {/* Privacy & Tech Card */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8">
                            <h3 className="text-xl font-bold text-white mb-3">Privacy First</h3>
                            <p className="text-gray-400 leading-relaxed">
                                We respect your privacy. This tool only uses <strong>public</strong> Steam data to generate comparisons. We don't store your library data permanently, and we don't ask for your password.
                            </p>
                        </div>

                        <div className="glass-panel p-8">
                            <h3 className="text-xl font-medium text-white mb-3">Built for Gamers</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Created by gamers, for gamers. We're constantly adding new features like "Backlog Slayer" and "Game Roulette" to make your gaming sessions easier to plan.
                            </p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center pt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
                        >
                            Start Comparing
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                </div>

                {/* Footer Note */}
                <div className="text-center mt-20 text-xs text-gray-500 uppercase tracking-widest mb-10">
                    <p>We Both Play is not affiliated with Valve Corporation.</p>
                </div>

                {/* Bottom Ad Slot */}
                <div className="w-full max-w-xl mx-auto py-10 opacity-50 hover:opacity-100 transition-opacity">
                    <GoogleAdSense slot="8627342981" />
                </div>

            </div>
        </main>
    );
}
