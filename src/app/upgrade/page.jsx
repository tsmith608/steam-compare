"use client";
import React from 'react';
import Link from 'next/link';

export default function UpgradePage() {
    return (
        <div className="bg-[#0e0e10] min-h-screen text-gray-100 flex flex-col">
            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                        Supercharge Your <span className="text-blue-500">Discord Server</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Stop asking "what should we play?" forever. Get the We Both Play bot for your community and find shared games instantly in chat.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="px-6 pb-24">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Lifetime Deal (Highlighted) */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[#0e0e10] rounded-2xl border border-white/10 p-8 shadow-2xl flex flex-col h-full">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                                BEST KEY
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Lifetime Server License</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-white">$15</span>
                                <span className="text-gray-500 font-medium">/ forever</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span>Unlimited Bot Usage</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span>Compare Large Groups (Voice Channel)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span>Top 5 by Playtime</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span>Support Indie Development</span>
                                </li>
                            </ul>

                            <a
                                href="https://ko-fi.com/F1F11N6SO4"
                                target="_blank"
                                className="w-full block text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]"
                            >
                                Buy Lifetime Key
                            </a>
                            <p className="text-xs text-center text-gray-500 mt-3">One-time payment via Ko-fi</p>
                        </div>
                    </div>

                    {/* Monthly / Enterprise */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-8 flex flex-col h-full hover:border-white/10 transition-colors">
                        <h3 className="text-2xl font-bold text-gray-200 mb-2">Monthly Supporter</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-white">$23</span>
                            <span className="text-gray-500 font-medium">/ month</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-gray-400">
                                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>Everything in Lifetime</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>Priority Support</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>Enterprise SLA (Optional)</span>
                            </li>
                        </ul>

                        <a
                            href="https://ko-fi.com/F1F11N6SO4"
                            target="_blank"
                            className="w-full block text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-colors"
                        >
                            Subscribe Monthly
                        </a>
                        <p className="text-xs text-center text-gray-500 mt-3">Cancel anytime</p>
                    </div>

                </div>
            </section>

            {/* FAQ / Invite Placeholder */}
            <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Already have a key?</h2>
                <p className="text-gray-400 mb-8">
                    Once you've purchased a license, you'll receive an invite link and activation instructions via email/DM.
                </p>
                <button disabled className="px-8 py-3 rounded-xl bg-gray-800 text-gray-500 cursor-not-allowed font-mono border border-white/5">
                    Add to Discord (Coming Soon)
                </button>
            </section>

        </div>
    );
}
