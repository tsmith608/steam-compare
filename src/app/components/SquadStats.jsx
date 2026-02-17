"use client";
import { useMemo } from "react";

export default function SquadStats({ sharedGames = [], profiles = [] }) {
    const stats = useMemo(() => {
        if (sharedGames.length === 0) return null;

        let totalMins = 0;
        let topGame = sharedGames[0];
        let maxCombinedMins = 0;

        sharedGames.forEach(g => {
            const combined = Object.values(g.playtimes || {}).reduce((a, b) => a + b, 0);
            totalMins += combined;
            if (combined > maxCombinedMins) {
                maxCombinedMins = combined;
                topGame = g;
            }
        });

        const totalHours = Math.round(totalMins / 60);

        return {
            totalHours,
            topGame,
            avgHoursPerPlayer: Math.round(totalHours / (profiles.length || 1)),
            gameCount: sharedGames.length
        };
    }, [sharedGames, profiles]);

    if (!stats) return null;

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Total Hours */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Squad History</span>
                </div>
                <div className="text-xl font-black text-white">{stats.totalHours.toLocaleString()} <span className="text-sm font-light text-gray-500">hrs</span></div>
            </div>

            {/* Shared Games Count */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Library Overlap</span>
                </div>
                <div className="text-xl font-black text-white">{stats.gameCount} <span className="text-sm font-light text-gray-500">Games</span></div>
            </div>

            {/* Top Shared Game */}
            <div className="sm:col-span-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-3 backdrop-blur-sm hover:from-blue-600/20 hover:to-purple-600/20 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 text-[10px]">
                        👑
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Squad Favorite</span>
                </div>

                <div className="flex items-center gap-3">
                    <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${stats.topGame.appid}/capsule_231x87.jpg`}
                        className="h-8 rounded shadow-lg border border-white/10"
                        alt=""
                    />
                    <div className="overflow-hidden">
                        <div className="text-lg font-black text-white truncate drop-shadow-md">{stats.topGame.name}</div>
                        <p className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold">The game that binds you</p>
                    </div>
                </div>
            </div>
        </div>
    );

}
