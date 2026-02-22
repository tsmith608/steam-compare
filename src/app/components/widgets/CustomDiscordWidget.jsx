"use client";

import { useState } from "react";

const DEFAULT_CONFIG = { widgetId: "", theme: "dark" };

/**
 * CustomDiscordWidget — Integrates a live Discord server view.
 */
export default function CustomDiscordWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { widgetId = "", theme = "dark" } = config;

    const handleIdChange = (e) => {
        onConfigChange({ ...config, widgetId: e.target.value.trim() });
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#5865F2] uppercase tracking-widest block font-sans">
                        Discord Integration
                    </label>

                    <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Server Widget ID</label>
                        <input
                            type="text"
                            placeholder="e.g. 10476495... (From Server Settings > Widget)"
                            value={widgetId}
                            onChange={handleIdChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#5865F2]/50 transition-colors"
                        />
                        <p className="text-[8px] text-white/20 italic leading-tight">
                            Enable "Server Widget" in Discord settings to get your ID.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Theme</label>
                        <div className="flex gap-2">
                            {["dark", "light"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => onConfigChange({ ...config, theme: t })}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${theme === t
                                        ? "bg-[#5865F2]/20 border-[#5865F2]/40 text-[#5865F2]"
                                        : "bg-white/5 border-white/5 text-white/40"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {!widgetId && (
                    <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-black/40 border border-white/5 p-4 text-center">
                        <span className="text-3xl mb-2">💬</span>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-relaxed">
                            No Widget ID provided.<br />Check Server Settings &gt; Widget.
                        </p>
                    </div>
                )}

                {widgetId && (
                    <div className="flex-1 rounded-xl overflow-hidden glass-card border border-[#5865F2]/20 p-2">
                        <div className="w-full h-full bg-[#313338] rounded-lg flex items-center justify-center">
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Active Widget Preview</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (!widgetId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale group-hover:grayscale-0 transition-all">
                <span className="text-4xl mb-3">💬</span>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Community Hub</p>
                <p className="text-[9px] text-white/20 font-bold mt-1">Widget ID Required</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-[#5865F2] text-[10px] font-black uppercase tracking-[0.2em]">Discord Active</h3>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden bg-black/20 border border-white/5 backdrop-blur-sm">
                <iframe
                    src={`https://discord.com/widget?id=${widgetId}&theme=${theme}`}
                    width="100%"
                    height="100%"
                    allowTransparency="true"
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="opacity-90 hover:opacity-100 transition-opacity"
                />
            </div>
        </div>
    );
}

CustomDiscordWidget.defaultConfig = DEFAULT_CONFIG;
