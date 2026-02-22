"use client";

import { useState } from "react";

const VIBES = [
    { id: "none", label: "No Effect", icon: "🚫", color: "bg-gray-500" },
    { id: "matrix", label: "Digital Rain", icon: "📟", color: "bg-green-500", description: "Falling green code across the screen." },
    { id: "fireplace", label: "Cozy Hearth", icon: "🔥", color: "bg-orange-500", description: "Warm orange glow and rising sparks." },
    { id: "stars", label: "Starfield", icon: "✨", color: "bg-blue-400", description: "Slow moving parallax stars." },
    { id: "cards", label: "Steam Drops", icon: "🃏", color: "bg-purple-500", description: "Floating Steam Trading Cards." },
    { id: "glitch", label: "CRT Glitch", icon: "📺", color: "bg-pink-500", description: "Subtle scanlines and RGB shifts." },
];

const DEFAULT_CONFIG = { vibeId: "none", intensity: 50, colorTint: "#ffffff" };

/**
 * CustomVibeWidget — Controls page-wide environmental effects.
 */
export default function CustomVibeWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { vibeId = "none", intensity = 50, colorTint = "#ffffff" } = config;

    const currentVibe = VIBES.find(v => v.id === vibeId) || VIBES[0];

    const handleSelectVibe = (id) => {
        onConfigChange({ ...config, vibeId: id });
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">
                    Select Environment
                </label>

                <div className="grid grid-cols-2 gap-2">
                    {VIBES.map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => handleSelectVibe(vibe.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${vibeId === vibe.id
                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                }`}
                        >
                            <span className="text-xl mb-1">{vibe.icon}</span>
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-center leading-tight">
                                {vibe.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Intensity</label>
                        <span className="text-[9px] font-mono text-amber-500">{intensity}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={intensity}
                        onChange={(e) => onConfigChange({ ...config, intensity: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <p className="text-[8px] text-white/20 italic mt-auto leading-tight">
                    * This widget applies effects to the entire page. Refresh or save to see full impact.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className={`w-12 h-12 rounded-2xl ${currentVibe.color} flex items-center justify-center text-2xl shadow-lg mb-3 animate-pulse`}>
                {currentVibe.icon}
            </div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{currentVibe.label}</h4>
            <p className="text-[9px] text-white/40 font-bold mt-1 tracking-tight leading-snug">
                {currentVibe.description || "No global effect active."}
            </p>

            {vibeId !== "none" && (
                <div className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest animate-pulse">
                        Active Layer
                    </span>
                </div>
            )}
        </div>
    );
}

CustomVibeWidget.defaultConfig = DEFAULT_CONFIG;
