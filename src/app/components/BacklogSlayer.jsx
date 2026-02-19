"use client";
import { useState, useEffect } from "react";

export default function BacklogSlayer({ users, isPremium }) {
    const [backlog, setBacklog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (revealed && isPremium && users.length > 1) {
            setLoading(true);
            fetch("/api/backlog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users })
            })
                .then(r => r.json())
                .then(data => {
                    setBacklog(data.backlog || []);
                    setLoading(false);
                })
                .catch(e => {
                    console.error(e);
                    setLoading(false);
                });
        }
    }, [revealed, isPremium, users]);

    if (!isPremium) return null;

    return (
        <div className="w-full h-full relative group flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
                    <span className="text-xl">🗡️</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">The Backlog Slayer</h3>
                    <p className="text-xs text-purple-300 font-medium uppercase tracking-widest">Hidden Gems you all own but never played</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/10 to-black border border-purple-500/20 rounded-2xl p-2 relative overflow-hidden flex-grow flex flex-col justify-center items-center min-h-[100px]">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <svg className="w-64 h-64 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>
                </div>

                {!revealed ? (
                    <div className="text-center z-10">
                        <p className="text-gray-400 mb-4 max-w-md mx-auto">
                            We found potential hidden gems in your shared library that <b>no one</b> has touched yet.
                            Break the cycle and play something new tonight!
                        </p>
                        <button
                            onClick={() => setRevealed(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
                        >
                            Reveal Hidden Gems
                        </button>
                    </div>
                ) : (
                    <div className="w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : backlog.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-gray-400">Wow! You've played everything you own. No backlog status here! 🏆</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {backlog.slice(0, 5).map(g => (
                                    <div key={g.appid} className="bg-black/40 border border-white/5 rounded-xl p-3 hover:border-purple-500/40 transition-colors group/card">
                                        <a href={`steam://run/${g.appid}`} className="block relative">
                                            <img
                                                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                                                alt={g.name}
                                                className="rounded-lg mb-2 shadow-md w-full h-[80px] object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity rounded-lg">
                                                <span className="text-xs font-bold text-white bg-purple-600 px-2 py-1 rounded">PLAY NOW</span>
                                            </div>
                                        </a>
                                        <div className="text-center">
                                            <h4 className="text-sm font-bold text-gray-200 truncate">{g.name}</h4>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">&lt; 2 Hours Played</span>
                                        </div>
                                    </div>
                                ))}
                                {backlog.length > 5 && (
                                    <div className="flex flex-col items-center justify-center text-gray-500 text-xs">
                                        <span>+{backlog.length - 5} more</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
