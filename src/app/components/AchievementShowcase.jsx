"use client";
import React, { useMemo } from 'react';
import { motion } from "framer-motion";

const BADGES = [
    {
        id: 'century',
        icon: '🎮',
        label: 'Century Club',
        desc: '100+ games owned',
        check: (s, lib) => (s?.totalGames || 0) >= 100,
        color: 'from-blue-500/30 to-cyan-500/30',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        textColor: 'text-blue-400',
    },
    {
        id: '1000hours',
        icon: '🏆',
        label: '1000+ Hours Club',
        desc: '1,000+ hours total playtime',
        check: (s) => (s?.totalHours || 0) >= 1000,
        color: 'from-amber-500/30 to-orange-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        textColor: 'text-amber-400',
    },
    {
        id: 'marathon',
        icon: '⏰',
        label: 'Marathon Gamer',
        desc: '500+ hours in one game',
        check: (s) => s?.top3?.[0]?.pt && (s.top3[0].pt / 60) >= 500,
        color: 'from-rose-500/30 to-pink-500/30',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
        textColor: 'text-rose-400',
    },
    {
        id: 'variety',
        icon: '🔥',
        label: 'Variety Player',
        desc: '50+ games with 1h+ playtime',
        check: (s, lib, steamId) => {
            if (!lib || !steamId) return false;
            const key = String(steamId);
            let count = 0;
            for (const g of lib) {
                const pt = g.playtimes ? g.playtimes[key] : g.playtime_forever;
                if ((pt || 0) >= 60) count++;
                if (count >= 50) return true;
            }
            return false;
        },
        color: 'from-orange-500/30 to-red-500/30',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
        textColor: 'text-orange-400',
    },
    {
        id: 'completionist',
        icon: '📚',
        label: 'Library Completionist',
        desc: '500+ games owned',
        check: (s) => (s?.totalGames || 0) >= 500,
        color: 'from-purple-500/30 to-violet-500/30',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        textColor: 'text-purple-400',
    },
    {
        id: 'dedication',
        icon: '🌟',
        label: 'Dedication Award',
        desc: '5,000+ hours total playtime',
        check: (s) => (s?.totalHours || 0) >= 5000,
        color: 'from-yellow-500/30 to-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        textColor: 'text-yellow-400',
    },
    {
        id: 'collector',
        icon: '💎',
        label: 'Collector',
        desc: '1,000+ games owned',
        check: (s) => (s?.totalGames || 0) >= 1000,
        color: 'from-emerald-500/30 to-teal-500/30',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        textColor: 'text-emerald-400',
    },
];

const badgeStagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.15 },
    },
};

const badgePop = {
    hidden: { opacity: 0, scale: 0.6, y: 12 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
    },
};

export default function AchievementShowcase({ stats, fullLibrary, steamId, minimal = false }) {
    const earned = useMemo(() => {
        return BADGES.map(b => ({
            ...b,
            unlocked: b.check(stats, fullLibrary, steamId),
        }));
    }, [stats, fullLibrary, steamId]);

    const unlockedCount = earned.filter(b => b.unlocked).length;

    const containerClass = minimal
        ? "h-full flex flex-col"
        : "glass-card p-6 md:p-8 col-span-12 hover:border-amber-500/20 transition-colors";

    return (
        <div className={containerClass}>
            <div className={`flex items-center justify-between ${minimal ? 'mb-3' : 'mb-6'}`}>
                <h3 className={`${minimal ? 'text-[10px]' : 'text-lg'} text-white font-black uppercase tracking-widest flex items-center gap-2`}>
                    <span className="text-amber-500">🏅</span> Achievements
                </h3>
                <span className={`font-bold text-gray-500 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm ${minimal ? 'text-[8px]' : 'text-[10px]'}`}>
                    {unlockedCount}/{BADGES.length} <span className="hidden sm:inline">UNLOCKED</span>
                </span>
            </div>

            <motion.div
                className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
                variants={badgeStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
            >
                <div className="flex flex-wrap gap-1.5 pb-2">
                    {earned.map(b => (
                        <motion.div
                            key={b.id}
                            variants={badgePop}
                            className={`
                                group relative flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all cursor-default
                                ${b.unlocked
                                    ? `bg-gradient-to-r ${b.color} border-white/10 ${b.glow} hover:scale-105`
                                    : 'bg-white/[0.02] border-white/5 opacity-35 grayscale'
                                }
                            `}
                            title={b.desc}
                        >
                            <span className={`text-base ${b.unlocked ? '' : 'grayscale'}`}>{b.icon}</span>
                            <div>
                                <p className={`text-[10px] font-bold ${b.unlocked ? b.textColor : 'text-gray-600'}`}>
                                    {b.label}
                                </p>
                                <p className="text-[8px] text-gray-500 font-medium mt-0.5 hidden sm:block">
                                    {b.desc}
                                </p>
                            </div>
                            {b.unlocked && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                    <span className="text-[7px] text-white font-black">✓</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
