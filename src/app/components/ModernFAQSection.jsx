"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function FAQItem({ question, answer, isOpen, onClick }) {
    return (
        <div className="border-b border-white/10 last:border-0 overflow-hidden">
            <button
                onClick={onClick}
                className="w-full py-5 flex items-center justify-between text-left group transition-all"
            >
                <span className={`text-sm sm:text-base font-medium transition-colors ${isOpen ? "text-blue-400" : "text-gray-200 group-hover:text-white"}`}>
                    {question}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-gray-500"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="pb-6 pr-8">
                            <p className="text-sm sm:text-base text-gray-400 leading-relaxed italic">
                                {answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ModernFAQSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            q: "Do I have to sign in with Steam?",
            a: "Absolutely not. It's fully optional. You can paste IDs or profile URLs manually. Signing in just makes it faster by letting you select from your actual friends list.",
        },
        {
            q: "Why can't I see a friend's games?",
            a: "They likely have their 'Game Details' set to Private. Steam requires this to be set to 'Public' for their API to return library data. They can change this in their Profile Privacy settings.",
        },
        {
            q: "Do you store any of my personal data?",
            a: "No. We believe in privacy. We query Steam's public API in real-time, perform the comparison in memory, and discard it once you close the page. We never save your ID or library content.",
        },
        {
            q: "Does this work with Family Sharing?",
            a: "Yes! If games are in your library, they will appear in the comparison, regardless of how they were acquired. We check for ownership on the Steam platform.",
        },
    ];

    return (
        <section className="mt-20 w-full max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Common Questions</h3>
            </div>

            <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 px-6 sm:px-8 shadow-2xl shadow-black/40"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                {faqs.map((x, i) => (
                    <FAQItem
                        key={i}
                        question={x.q}
                        answer={x.a}
                        isOpen={openIndex === i}
                        onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                    />
                ))}
            </motion.div>

            <p className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                Still curious? <a href="#" className="text-blue-500 hover:underline">Read the full docs</a>
            </p>
        </section>
    );
}
