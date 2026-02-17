"use client";
import { Suspense, useState, useEffect } from "react";
import GoogleAdSense from "../components/GoogleAdSense";
import Link from "next/link";

function CommandsContent() {
    const commands = [
        {
            name: "/link",
            icon: "🔗",
            description: "Link your Steam account to Discord",
            usage: "/link",
            details: "Generates a secure link to authenticate with Steam and connect your account to Discord. This is required before using other bot features.",
            premium: false
        },
        {
            name: "/compare",
            icon: "🎮",
            description: "Compare game libraries with friends",
            usage: "/compare [@user1] [voice]",
            details: "Discover shared games with friends. Automatically detects your Voice Channel if no users are provided. Limits: Noob (3), Pro (6), Hacker (12).",
            premium: "partial"
        },
        {
            name: "/hype",
            icon: "🔥",
            description: "See what's trending in the server",
            usage: "/hype",
            details: "Analyzes recent playtime across all linked server members to show which games are currently 'hot' in your community.",
            premium: "Pro+"
        },
        {
            name: "/leaderboard",
            icon: "🏆",
            description: "Server-wide gamer rankings",
            usage: "/leaderboard [category]",
            details: "Compare your standing with other server members in 'Playtime' or 'Library Size'. Only includes linked accounts.",
            premium: "Pro+"
        },
        {
            name: "/flex",
            icon: "💪",
            description: "Compare game achievements",
            usage: "/flex [game] [@user]",
            details: "Show off your achievement progress for a specific game and compare it directly with a friend.",
            premium: "Pro+"
        },
        {
            name: "/stats",
            icon: "📜",
            description: "View your Gamer Resume",
            usage: "/stats [@user]",
            details: "Generate a comprehensive overview showing total playtime, library size, and most-played games.",
            premium: "Pro+"
        },
        {
            name: "/roulette",
            icon: "🎰",
            description: "Pick a random shared game",
            usage: "/roulette [@user1] [@user2]",
            details: "Can't decide what to play? Let the bot choose a random game from your shared library!",
            premium: "Pro+"
        },
        {
            name: "/common",
            icon: "🔍",
            description: "Search shared games by name",
            usage: "/common [search term]",
            details: "Quickly find shared games matching your search. Perfect for checking for specific titles.",
            premium: "Pro+"
        },
        {
            name: "/backlog",
            icon: "🛑",
            description: "Find unplayed games in your library",
            usage: "/backlog",
            details: "Discover games you own but haven't played yet (less than 3 hours of playtime).",
            premium: "Pro+"
        },
        {
            name: "/compatibility",
            icon: "❤️",
            description: "Check gaming compatibility with a friend",
            usage: "/compatibility @user",
            details: "Calculate a compatibility score based on shared game preferences and playtime overlap.",
            premium: "Hacker+"
        },
        {
            name: "/welcome",
            icon: "👋",
            description: "Show the intro guide",
            usage: "/welcome",
            details: "Display a welcome message with quick start instructions for new users.",
            premium: false
        },
        {
            name: "/upgrade",
            icon: "💎",
            description: "Get the link to upgrade your account",
            usage: "/upgrade",
            details: "Provides a direct link to the upgrade page to unlock Pro or Hacker tiers.",
            premium: false
        },
        {
            name: "/help",
            icon: "❓",
            description: "List all available commands",
            usage: "/help",
            details: "Shows this command list directly in Discord.",
            premium: false
        }
    ];

    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const steamid = sessionStorage.getItem("wb.steamid");
        if (steamid) {
            fetch(`/api/check-premium?steamid=${encodeURIComponent(steamid)}`)
                .then(r => r.json())
                .then(d => setIsPremium(d.isPremium))
                .catch(() => setIsPremium(false));
        }
    }, []);

    return (
        <main className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            {/* Background gradient */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background:
                        "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
                }}
            />

            {/* Content */}
            <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 sm:py-20 flex flex-col relative z-10">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight leading-tight tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                        Discord Bot Commands
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
                        Use these commands in any Discord server where We Both Play is installed.
                    </p>
                    <div className="mt-6 h-px w-28 mx-auto bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </header>

                {/* Ad Space */}
                <div className="mb-8">
                    <GoogleAdSense isPremium={isPremium} />
                </div>

                {/* Quick Start */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-blue-400 mb-3">🚀 Quick Start</h2>
                    <ol className="space-y-2 text-gray-300">
                        <li className="flex gap-3">
                            <span className="font-bold text-blue-400">1.</span>
                            <span><Link href="https://discord.com/oauth2/authorize?client_id=1472792413499293779&permissions=18432&scope=bot%20applications.commands" className="text-blue-400 hover:text-blue-300 underline">Add the bot</Link> to your Discord server</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-blue-400">2.</span>
                            <span>Run <code className="bg-white/10 px-2 py-0.5 rounded text-sm">/link</code> to connect your Steam account</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-blue-400">3.</span>
                            <span>Start comparing! Try <code className="bg-white/10 px-2 py-0.5 rounded text-sm">/compare @friend</code></span>
                        </li>
                    </ol>
                </div>

                {/* Commands Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {commands.map((cmd, idx) => (
                        <div
                            key={idx}
                            className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{cmd.icon}</span>
                                    <h3 className="text-lg font-bold text-white font-mono">
                                        {cmd.name}
                                    </h3>
                                </div>
                                {cmd.premium === "Hacker+" && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 uppercase">
                                        PRO+
                                    </span>
                                )}
                                {cmd.premium === "partial" && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 uppercase">
                                        LIMITED
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-blue-400/80 font-medium mb-3 italic">
                                {cmd.description}
                            </p>

                            <div className="space-y-3 flex-grow flex flex-col justify-between">
                                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Usage</span>
                                    <code className="text-blue-300 text-xs break-all">{cmd.usage}</code>
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                                    {cmd.details}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Premium CTA */}
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-semibold text-amber-400 mb-3">Unlock Premium Features</h2>
                    <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                        Upgrade to Pro or Hacker for Grand Party Mode (up to 12 players), ad-free experience, and saved squad presets.
                    </p>
                    <Link
                        href="/upgrade"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-150"
                    >
                        Go Premium
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function CommandsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
            <CommandsContent />
        </Suspense>
    );
}
