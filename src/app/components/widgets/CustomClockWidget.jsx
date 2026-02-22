"use client";

import { useState, useEffect } from "react";

const DEFAULT_CONFIG = { showSeconds: true, is24Hour: false, theme: "neon" };

/**
 * CustomClockWidget — A premium, animated digital clock.
 */
export default function CustomClockWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { showSeconds = true, is24Hour = false, theme = "neon" } = config;
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        let h = time.getHours();
        const m = String(time.getMinutes()).padStart(2, "0");
        const s = String(time.getSeconds()).padStart(2, "0");
        const ampm = h >= 12 ? "PM" : "AM";

        if (!is24Hour) {
            h = h % 12 || 12;
        }
        const hStr = String(h).padStart(2, "0");

        return { h: hStr, m, s, ampm };
    };

    const { h, m, s, ampm } = formatTime();

    /* ── Edit mode ─────────────────────────────── */
    if (isEditing) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">
                        Clock Settings
                    </label>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onConfigChange({ ...config, is24Hour: !is24Hour })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${is24Hour ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-white/5 border-white/5 text-white/40"
                                }`}
                        >
                            24 Hour
                        </button>
                        <button
                            onClick={() => onConfigChange({ ...config, showSeconds: !showSeconds })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showSeconds ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-white/5 border-white/5 text-white/40"
                                }`}
                        >
                            Seconds
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Theme</label>
                        <select
                            value={theme}
                            onChange={(e) => onConfigChange({ ...config, theme: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                        >
                            <option value="neon" className="bg-zinc-900">Neon Blue</option>
                            <option value="minimal" className="bg-zinc-900">Minimal White</option>
                            <option value="cyber" className="bg-zinc-900">Cyber Pink</option>
                        </select>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex items-center justify-center rounded-xl bg-black/40 border border-white/5">
                    <div className={`text-center transition-all ${theme === 'neon' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : theme === 'cyber' ? 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'text-white'}`}>
                        <div className="text-4xl font-black tracking-tighter tabular-nums flex items-baseline gap-1">
                            <span>{h}</span>
                            <span className="opacity-30 animate-pulse">:</span>
                            <span>{m}</span>
                            {showSeconds && (
                                <>
                                    <span className="opacity-30 animate-pulse">:</span>
                                    <span className="text-2xl opacity-80">{s}</span>
                                </>
                            )}
                        </div>
                        {!is24Hour && <div className="text-[10px] font-black tracking-[0.3em] opacity-40 uppercase">{ampm}</div>}
                    </div>
                </div>
            </div>
        );
    }

    /* ── View mode ─────────────────────────────── */
    const themeStyles = {
        neon: "text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]",
        cyber: "text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]",
        minimal: "text-white/90"
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className={`text-center ${themeStyles[theme] || themeStyles.neon}`}>
                <div className="text-5xl font-black tracking-tighter tabular-nums flex items-baseline gap-1">
                    <span className="hover:scale-105 transition-transform cursor-default">{h}</span>
                    <span className="opacity-20 animate-pulse">:</span>
                    <span className="hover:scale-105 transition-transform cursor-default">{m}</span>
                    {showSeconds && (
                        <>
                            <span className="opacity-20 animate-pulse">:</span>
                            <span className="text-3xl opacity-60 hover:scale-105 transition-transform cursor-default">{s}</span>
                        </>
                    )}
                </div>
                {!is24Hour && (
                    <div className="text-[10px] font-black tracking-[0.5em] opacity-30 uppercase mt-1 pl-[0.5em]">
                        {ampm}
                    </div>
                )}
            </div>

            {/* Subtle Date */}
            <div className="mt-3 text-[9px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
}

CustomClockWidget.defaultConfig = DEFAULT_CONFIG;
