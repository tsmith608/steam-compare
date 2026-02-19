"use client";
import { useState, useEffect } from "react";

export default function SquadActivity({ users, isPremium, profiles }) {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(false);

    // Auto-fetch on load if premium? Or user triggered?
    // Let's auto-fetch for seamless feel, but handle loading gracefully.
    useEffect(() => {
        if (isPremium && users.length > 1) {
            setLoading(true);
            fetch("/api/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users })
            })
                .then(r => r.json())
                .then(data => {
                    setActivity(data.hot || []);
                    setLoading(false);
                })
                .catch(e => {
                    console.error(e);
                    setLoading(false);
                });
        }
    }, [isPremium, users]);

    if (!isPremium || activity.length === 0) return null;

    // Helper to find avatar
    const getAvatar = (sid) => profiles.find(p => p.steamid === sid)?.avatar;

    return (
        <div className="w-full mb-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-lg shadow-orange-500/10">
                    <span className="text-xl">🔥</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Squad Pulse</h3>
                    <p className="text-xs text-orange-300 font-medium uppercase tracking-widest">Trending in your group this week</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {activity.map((game, i) => (
                    <div key={game.appid} className="bg-white/5 border border-white/10 rounded-xl p-2 flex gap-4 items-center hover:bg-white/10 transition-colors">
                        <img
                            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
                            alt={game.name}
                            className="w-24 h-[35px] object-cover rounded shadow-sm"
                        />
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-bold text-white truncate pr-2">{game.name}</h4>
                                {game.players.length > 1 && (
                                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 whitespace-nowrap">
                                        {game.players.length} Playing
                                    </span>
                                )}
                            </div>

                            {/* Player Avatars */}
                            <div className="flex items-center gap-1">
                                {game.players.map(p => (
                                    <img
                                        key={p.steamid}
                                        src={getAvatar(p.steamid)}
                                        title={`${Math.round(p.minutes / 60)} hrs recently`}
                                        className="w-5 h-5 rounded-full ring-1 ring-white/10"
                                    />
                                ))}
                                <span className="text-xs text-gray-500 ml-2">
                                    {Math.round(game.totalRecentMinutes / 60)} hrs combined
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
