"use client";
import { motion } from "framer-motion";

export default function HighlightsSection() {
    const items = [
        {
            k: "Fast",
            v: "Instant results for up to 10 players. Optional sign-in.",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
                </svg>
            )
        },
        {
            k: "Accurate",
            v: "Pulls directly from Steam public data.",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            )
        },
        {
            k: "Private",
            v: "We don't store your library data.",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
            )
        },
        {
            k: "Flexible",
            v: "Works with Steam Login, IDs, URLs, or our Discord bot.",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
            )
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    return (
        <motion.section
            className="mt-12 w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((it) => (
                    <motion.div
                        key={it.k}
                        variants={itemVariants}
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 text-left overflow-hidden transition-colors hover:bg-white/[0.08]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity">
                                {it.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm sm:text-base leading-relaxed">
                                    <span className="font-bold text-white tracking-tight">{it.k}</span>
                                    <span className="mx-2 text-gray-500">—</span>
                                    <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{it.v}</span>
                                </p>
                            </div>
                        </div>

                        {/* Subtle corner glow */}
                        <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
