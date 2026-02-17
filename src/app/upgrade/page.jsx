"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UpgradeContent() {
    const searchParams = useSearchParams();
    const steamidParam = searchParams.get('steamid');
    const [steamid, setSteamid] = useState(steamidParam);
    const [userTier, setUserTier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [portalLoading, setPortalLoading] = useState(false);

    useEffect(() => {
        // Fallback to session storage if not in URL
        if (!steamid) {
            const stored = sessionStorage.getItem("wb.steamid");
            if (stored) setSteamid(stored);
        }
    }, [steamid]);

    useEffect(() => {
        if (steamid) {
            fetch(`/api/check-premium?steamid=${encodeURIComponent(steamid)}`)
                .then(r => r.json())
                .then(d => setUserTier(d.tier || 'Noob'))
                .catch(() => setUserTier('Noob'));
        }
    }, [steamid]);

    const handleUpgrade = async (tier) => {
        if (!steamid) {
            alert("Please log in with Steam first to upgrade your account.");
            return;
        }

        setLoading(tier);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steamid, tier }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Something went wrong creating the checkout session.");
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert("Failed to reach the payment server.");
        } finally {
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setPortalLoading(true);
        try {
            const res = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steamid }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "No active subscription found to manage.");
            }
        } catch (err) {
            console.error('Portal error:', err);
            alert("Failed to reach the subscription portal.");
        } finally {
            setPortalLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            {/* Radial gradient background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background:
                        "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
                }}
            />

            {/* Content Wrapper */}
            <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center relative z-10">

                {/* Hero */}
                <section className="w-full text-center pt-16 sm:pt-24 mb-12">
                    <h1 className="text-[44px] sm:text-6xl md:text-7xl font-extralight leading-[1.08] tracking-[-0.02em]
                     bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                        We Both Play <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Premium Plans</span>
                    </h1>
                    <p className="mt-4 text-[15px] sm:text-lg text-gray-300 max-w-2xl mx-auto">
                        Upgrade your gaming experience with advanced features and a legit, seamless checkout.
                    </p>

                    {userTier && userTier !== 'Noob' && (
                        <div className="mt-10 max-w-md mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="text-amber-400 font-bold uppercase tracking-widest text-[10px] mb-3">You are a {userTier} Member</h3>
                            <button
                                onClick={handleManageSubscription}
                                disabled={portalLoading}
                                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                {portalLoading ? '...' : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Manage Subscription
                                    </>
                                )}
                            </button>
                            <p className="mt-3 text-[10px] text-gray-500">Update billing or cancel your plan through the Stripe Portal.</p>
                        </div>
                    )}

                    <div className="mt-6 h-px w-28 mx-auto bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </section>

                {/* Pricing Cards */}
                <section className="w-full pb-16">
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* NOOB tier */}
                        <div className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 shadow-xl shadow-black/20 p-8 flex flex-col h-full hover:bg-white/[0.07] transition-all">
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">Noob</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-gray-500 font-medium text-sm">forever</span>
                            </div>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-3">Website Features</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2 text-gray-400">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>Gamer Stats & Resume</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-400">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>Compare up to 3 users</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-3">Discord Bot</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2 text-gray-400">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>/link, /help, /compare (3 users)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            {userTier === 'Noob' ? (
                                <button className="w-full mt-8 block text-center bg-white/10 text-gray-400 font-semibold py-3 rounded-xl cursor-default text-sm border border-white/5">
                                    Current Plan
                                </button>
                            ) : (
                                <Link
                                    href="/"
                                    className="w-full mt-8 block text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-colors text-sm hover:scale-[1.02] transform"
                                >
                                    Downgrade Info
                                </Link>
                            )}
                        </div>

                        {/* PRO tier */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative bg-[#0e0e10] rounded-3xl border border-blue-500/30 p-8 flex flex-col h-full shadow-2xl">
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black tracking-tighter px-3 py-1 rounded-bl-xl rounded-tr-3xl uppercase">
                                    Recommended
                                </div>
                                <h3 className="text-2xl font-bold text-blue-400 mb-2">Pro</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">$3.99</span>
                                    <span className="text-gray-500 font-medium text-sm">/month</span>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-3">Website Features</h4>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-start gap-2 text-gray-200">
                                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                <span>Ad-Free Experience</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-200">
                                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                <span>Advanced Filters & Squads</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-200">
                                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                <span>Squad Pulse & Compare up to 6</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-3">Discord Bot</h4>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-start gap-2 text-gray-200">
                                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                <span>All Premium Commands (/roulette, etc)</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-200">
                                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                <span>Voice Integration & Nitro Tag</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                {userTier === 'Pro' ? (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={portalLoading}
                                        className="w-full mt-8 block text-center bg-blue-600/20 border border-blue-500/50 text-blue-400 font-bold py-3 rounded-xl transition-all text-sm"
                                    >
                                        Current Plan (Manage)
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpgrade('Pro')}
                                        disabled={loading === 'Pro'}
                                        className="w-full mt-8 block text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {loading === 'Pro' ? 'Initializing...' : (userTier === 'Hacker' ? 'Downgrade to Pro' : 'Go Pro')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* HACKER tier */}
                        <div className="bg-white/5 rounded-3xl border border-amber-600/30 p-8 flex flex-col h-full hover:border-amber-600/50 transition-colors">
                            <h3 className="text-2xl font-bold text-amber-500 mb-2">Hacker</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-white">$9.99</span>
                                <span className="text-gray-500 font-medium text-sm">/month</span>
                            </div>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-3">Everything in Pro</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2 text-gray-200">
                                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>Compare up to 12 users (Site & Bot)</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-200">
                                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span className="font-bold text-amber-400">Hacker Server Perk: Unlock Premium features for your entire server!</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-200">
                                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <span>Priority Support & Early Access</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            {userTier === 'Hacker' ? (
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={portalLoading}
                                    className="w-full mt-8 block text-center bg-amber-600/20 border border-amber-600/50 text-amber-500 font-bold py-3 rounded-xl transition-all text-sm"
                                >
                                    Current Plan (Manage)
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade('Hacker')}
                                    disabled={loading === 'Hacker'}
                                    className="w-full mt-8 block text-center bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 hover:scale-[1.02] transform"
                                >
                                    {loading === 'Hacker' ? 'Initializing...' : 'Go Hacker'}
                                </button>
                            )}
                        </div>

                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-6 pb-16">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-2">What's the difference between Noob, Pro, and Hacker?</h3>
                            <p className="text-gray-400 text-sm">Noob is our free forever plan. Pro unlocks all site and bot features for small groups (up to 6). Hacker is for power users and large communities, allowing comparisons of up to 12 people simultaneously.</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-2">Can I upgrade my plan anytime?</h3>
                            <p className="text-gray-400 text-sm">Yes! You can upgrade your plan anytime. Changes take effect as soon as the transaction is confirmed through Stripe.</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-2">How do features unlock after payment?</h3>
                            <p className="text-gray-400 text-sm">
                                It's automatic! As soon as your payment is processed, your Steam ID is linked to your new tier via Stripe metadata. No short codes or manual claiming required.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Legacy Claim Section */}
                <section className="max-w-4xl mx-auto px-6 pb-16">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Upgraded via Ko-fi?</h2>
                        <p className="text-gray-400 text-sm mb-6">If you supported the project before we moved to Stripe, you can still claim your account manually.</p>
                        <Link
                            href="/upgrade/claim"
                            className="inline-block text-sm text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/30 underline-offset-4"
                        >
                            Go to Manual Claim Page →
                        </Link>
                    </div>
                </section>

                {/* Try the Website Section */}
                <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Let We Both Play take care of your server.</h2>
                    <p className="text-gray-400 mb-8">
                        Join communities enjoying seamless game discovery. Try the Noob tier today!
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                    >
                        Try the Website →
                    </Link>
                </section>

            </div>
        </div>
    );
}

export default function UpgradePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <UpgradeContent />
        </Suspense>
    );
}
