"use client";
import { useState, useEffect } from "react";

export default function GameRoulette({ games = [], onPick }) {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);

    const spin = () => {
        if (games.length === 0 || spinning) return;
        setSpinning(true);
        setResult(null);

        // Simulate spinning delay
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * games.length);
            const picked = games[randomIndex];
            setResult(picked);
            setSpinning(false);
            if (onPick) onPick(picked);
        }, 1500);
    };

    return (
        <div className="w-full h-full relative group flex flex-col">
            {/* Header - Moved outside to match BacklogSlayer */}
            <div className="flex items-center gap-3 mb-1 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
                    <span className="text-xl">🎰</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Game Roulette</h3>
                    <p className="text-xs text-purple-300 font-medium uppercase tracking-widest">Can't decide? Let destiny choose.</p>
                </div>
            </div>

            <div className="w-full p-2 rounded-2xl bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 border border-purple-500/20 shadow-2xl relative overflow-hidden flex-grow flex flex-col justify-center items-center min-h-[100px]">
                {/* Background Decorative */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <svg className="w-32 h-32 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 z-10 w-full">
                    {!result && !spinning && (
                        <button
                            onClick={spin}
                            className="px-8 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 border border-purple-400/30"
                        >
                            Spin the Wheel
                        </button>
                    )}

                    {spinning && (
                        <div className="flex flex-col items-center space-y-2 py-2">
                            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-mono text-purple-300 animate-pulse italic">Choosing...</p>
                        </div>
                    )}

                    {result && !spinning && (
                        <div className="animate-in zoom-in duration-500 flex flex-col items-center space-y-2 w-full">
                            <div className="px-3 py-2 rounded-xl bg-white/5 border border-purple-500/40 shadow-xl shadow-purple-900/20 flex items-center gap-3 w-full max-w-[280px]">
                                <img
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${result.appid}/capsule_231x87.jpg`}
                                    alt={result.name}
                                    className="h-10 rounded shadow-md"
                                />
                                <div className="text-left overflow-hidden">
                                    <div className="text-[8px] text-purple-400 font-bold uppercase tracking-widest">RESULT:</div>
                                    <div className="text-sm font-bold text-white truncate">{result.name}</div>
                                </div>
                            </div>
                            <button
                                onClick={spin}
                                className="text-[10px] text-gray-500 hover:text-white underline transition-colors"
                            >
                                Spin again?
                            </button>
                        </div>
                    )}

                    {games.length === 0 && !spinning && (
                        <p className="text-xs text-gray-500 italic">No games to spin.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
