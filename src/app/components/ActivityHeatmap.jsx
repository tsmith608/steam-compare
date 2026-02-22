"use client";
import React, { useMemo } from 'react';
import { motion, useInView } from "framer-motion";

export default function ActivityHeatmap({ fullLibrary, steamId, minimal = false, height = 2 }) {
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true, margin: "-30px" });

    const recentGames = useMemo(() => {
        if (!fullLibrary) return [];
        const limit = minimal ? Math.min(10, height * 2) : 8;
        return fullLibrary
            .filter(g => g.playtime_2weeks && g.playtime_2weeks > 0)
            .map(g => ({
                appid: g.appid,
                name: g.name,
                hours: Math.round((g.playtime_2weeks / 60) * 10) / 10,
                minutes: g.playtime_2weeks,
            }))
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, limit);
    }, [fullLibrary, minimal, height]);

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
            <div className={`flex flex-col items-center justify-center ${minimal ? 'mb-3' : 'mb-6 md:mb-8'}`}>
                <h3 className={`${minimal ? 'text-emerald-500 text-[10px]' : 'text-white text-lg'} font-black uppercase tracking-widest flex items-center gap-2`}>
                    <span className={minimal ? '' : 'text-emerald-500'}>🕹️</span> Recent
                </h3>
                {minimal && (
                    <span className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-tighter mt-0.5">
                        {totalHours}h • last 2 weeks
                    </span>
                )}
                {!minimal && (
                    <span className="text-[10px] font-bold text-gray-500 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm mt-3">
                        {totalHours}h • last 2 weeks
                    </span>
                )}
            </div>

            {recentGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-lg mb-2">😴</div>
                    <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">No recent activity</p>
                </div>
            ) : (
                <div className="flex flex-col space-y-2.5 flex-1 justify-center max-w-[280px] mx-auto w-full">
                    {recentGames.map((g, i) => (
                        <motion.div
                            key={g.appid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex items-center gap-2.5 group">
                                <span className={`text-[10px] font-black w-4 flex-shrink-0 ${i === 0 ? 'text-emerald-400' : i === 1 ? 'text-emerald-500/70' : 'text-emerald-600/40'}`}>#{i + 1}</span>
                                <img
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`}
                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-gray-100 truncate mr-1 group-hover:text-white transition-colors uppercase tracking-tight">{g.name}</span>
                                        <span className="text-[9px] font-mono text-gray-500 font-bold">{g.hours}h</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
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
