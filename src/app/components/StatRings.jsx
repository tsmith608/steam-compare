"use client";
import React, { useMemo } from 'react';
import { motion, useInView } from "framer-motion";

const RING_SIZE = 80;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function AnimatedRing({ percent, color, trailColor = "rgba(255,255,255,0.05)", size = RING_SIZE, strokeWidth = STROKE_WIDTH, delay = 0, label, value, sublabel }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true, margin: "-30px" });
    const offset = circ - (Math.min(percent, 100) / 100) * circ;

    return (
        <div ref={ref} className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size, overflow: 'visible' }}>
                {/* Trail */}
                <svg width={size} height={size} className="absolute inset-0 -rotate-90" style={{ overflow: 'visible' }}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke={trailColor}
                        strokeWidth={strokeWidth}
                    />
                </svg>
                {/* Animated ring */}
                <svg width={size} height={size} className="absolute inset-0 -rotate-90" style={{ overflow: 'visible' }}>
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={inView ? { strokeDashoffset: offset } : { strokeDashoffset: circ }}
                        transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-lg font-black text-white tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: delay + 0.6 }}
                    >
                        {value}
                    </motion.span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-bold text-gray-200 uppercase tracking-widest leading-tight">{label}</p>
                {sublabel && <p className="text-[9px] text-gray-400 mt-1 leading-tight">{sublabel}</p>}
            </div>
        </div>
    );
}

// Playtime milestone tiers
const MILESTONES = [
    { threshold: 0, label: 'Newcomer' },
    { threshold: 100, label: 'Casual' },
    { threshold: 500, label: 'Dedicated' },
    { threshold: 1000, label: 'Veteran' },
    { threshold: 2500, label: 'Hardcore' },
    { threshold: 5000, label: 'Legend' },
    { threshold: 10000, label: 'Mythic' },
    { threshold: 25000, label: 'Transcendent' },
];

export default function StatRings({ stats, fullLibrary, steamId, minimal = false }) {
    const computed = useMemo(() => {
        if (!fullLibrary || !stats) return null;
        const key = String(steamId);

        // Completion rate: % of games with > 1h playtime
        let playedCount = 0;
        let totalPt = 0;
        const ptArray = [];
        for (const g of fullLibrary) {
            const pt = g.playtimes ? g.playtimes[key] : g.playtime_forever;
            const mins = pt || 0;
            totalPt += mins;
            if (mins >= 60) playedCount++;
            ptArray.push(mins);
        }
        const completionRate = fullLibrary.length > 0
            ? Math.round((playedCount / fullLibrary.length) * 100)
            : 0;

        // Dedication score: what % of playtime is concentrated in top 10
        ptArray.sort((a, b) => b - a);
        const topTen = ptArray.slice(0, 10).reduce((s, v) => s + v, 0);
        const dedicationPercent = totalPt > 0
            ? Math.round((topTen / totalPt) * 100)
            : 0;

        // Playtime tier progress
        const hours = stats.totalHours || 0;
        let currentMilestone = MILESTONES[0];
        let nextMilestone = MILESTONES[1];
        for (let i = MILESTONES.length - 1; i >= 0; i--) {
            if (hours >= MILESTONES[i].threshold) {
                currentMilestone = MILESTONES[i];
                nextMilestone = MILESTONES[i + 1] || null;
                break;
            }
        }
        const tierProgress = nextMilestone
            ? Math.min(100, Math.round(((hours - currentMilestone.threshold) / (nextMilestone.threshold - currentMilestone.threshold)) * 100))
            : 100;

        return {
            completionRate,
            playedCount,
            dedicationPercent,
            currentMilestone,
            nextMilestone,
            tierProgress,
        };
    }, [stats, fullLibrary, steamId]);

    if (!computed) return null;

    const containerClass = minimal
        ? "h-full flex flex-col"
        : "glass-card p-6 md:p-8 col-span-12 md:col-span-6 hover:border-cyan-500/20 transition-colors";

    return (
        <div className={containerClass}>
            <h3 className="text-white text-lg font-black uppercase tracking-widest mb-2 flex items-center gap-3">
                <span className="text-cyan-500">📊</span> Stat Breakdown
            </h3>
            <div className="flex items-center justify-around flex-wrap gap-x-4 gap-y-2 flex-1">
                <AnimatedRing
                    percent={computed.completionRate}
                    color="#10b981"
                    label="Played"
                    value={`${computed.completionRate}%`}
                    sublabel={`${computed.playedCount} of ${stats?.totalGames || 0} games`}
                    delay={0}
                />
                <AnimatedRing
                    percent={computed.dedicationPercent}
                    color="#f59e0b"
                    label="Focus"
                    value={`${computed.dedicationPercent}%`}
                    sublabel="Top 10 concentration"
                    delay={0.15}
                />
                <AnimatedRing
                    percent={computed.tierProgress}
                    color="#6366f1"
                    label={computed.currentMilestone.label}
                    value={`${computed.tierProgress}%`}
                    sublabel={computed.nextMilestone ? `→ ${computed.nextMilestone.label} (${computed.nextMilestone.threshold.toLocaleString()}h)` : 'Max tier reached!'}
                    delay={0.3}
                />
            </div>
        </div>
    );
}
