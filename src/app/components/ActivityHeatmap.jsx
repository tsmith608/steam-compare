"use client";
import React, { useMemo } from 'react';
import { motion, useInView } from "framer-motion";

export default function ActivityHeatmap({ fullLibrary, steamId, minimal = false }) {
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true, margin: "-30px" });

    const recentGames = useMemo(() => {
        if (!fullLibrary) return [];
        return fullLibrary
            .filter(g => g.playtime_2weeks && g.playtime_2weeks > 0)
            .map(g => ({
                appid: g.appid,
                name: g.name,
                hours: Math.round((g.playtime_2weeks / 60) * 10) / 10,
                minutes: g.playtime_2weeks,
            }))
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, 8); // Top 8 recent games
    }, [fullLibrary]);

    const maxMinutes = recentGames[0]?.minutes || 1;
    const totalHours = useMemo(() =>
        Math.round(recentGames.reduce((s, g) => s + g.minutes, 0) / 60 * 10) / 10,
        [recentGames]
    );

    const containerClass = minimal
        ? "h-full flex flex-col"
        : "glass-card p-6 md:p-8 col-span-12 md:col-span-6 hover:border-emerald-500/20 transition-colors";

    return (
        <div ref={ref} className={containerClass}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-black uppercase tracking-widest flex items-center gap-3">
                    <span className="text-emerald-500">🕹️</span> Recent
                </h3>
                <span className="text-[10px] font-bold text-gray-500 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {totalHours}h • last 2 weeks
                </span>
            </div>

            {recentGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-xl mb-3">😴</div>
                    <p className="text-xs text-gray-500 font-medium">No games played in the last 2 weeks</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {recentGames.map((g, i) => (
                        <motion.div
                            key={g.appid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex items-center gap-3 group">
                                <img
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`}
                                    className="w-8 h-8 rounded object-cover flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs font-bold text-gray-300 truncate mr-2">{g.name}</span>
                                        <span className="text-[10px] font-mono text-gray-500 flex-shrink-0">{g.hours}h</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={inView ? { width: `${(g.minutes / maxMinutes) * 100}%` } : { width: 0 }}
                                            transition={{ duration: 1, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                                            className={`h-full rounded-full ${i === 0
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                                : i === 1
                                                    ? 'bg-emerald-500/70'
                                                    : 'bg-emerald-600/50'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
