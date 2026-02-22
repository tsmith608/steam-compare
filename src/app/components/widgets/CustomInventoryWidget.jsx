"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DEFAULT_CONFIG = { gameId: "730", limit: 8, showValue: true };

/**
 * CustomInventoryWidget — Displays rare/favorite Steam items.
 */
export default function CustomInventoryWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { gameId = "730", limit = 8, showValue = true } = config;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data for initial demo
    const mockItems = [
        { name: "AWP | Dragon Lore", rarity: "Covert", color: "text-red-500", glow: "shadow-red-500/20", img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G1Qv5NziO_Epdmi2wXn-0VvYGr7I4-cdlM4M1_R-Vfsx-u-0Z6878vOnCcypGB8sr4fS27w" },
        { name: "Karambit | Fade", rarity: "★ Covert", color: "text-purple-500", glow: "shadow-purple-500/20", img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBF2p66gZQZp0un3fDJQ5N2_mYWFk-79O77UkDJSvJBzi7uVrd_z2Vax-0NrYDjzLIXEcVBoZlqC-we4xfS6gZ_uv5_LzXdi6yEm7WGdwUIkUu_KLA" },
        { name: "M4A4 | Howl", rarity: "Contraband", color: "text-orange-500", glow: "shadow-orange-500/20", img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09Kzm7-GkvP9JrbummpD78A_3LGXrI_xdV1v_hdoam-hcI6Sdgc4MAmFrAe_k-u51Ij84sqM3vA27g" },
        { name: "Specialist Gloves | Fade", rarity: "★ Extraordinary", color: "text-yellow-500", glow: "shadow-yellow-500/20", img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBF2p66gZQZp0un3fDJQ5N2_mYWFk-79O77UkDJSvJBzi7uVrd_z2Vax-0NrYDjzLIXEcVBoZlqC-we4xfS6gZ_uv5_LzXdi6yEm7WGdwUIkUu_KLA" },
        { name: "Glock-18 | Fade", rarity: "Restricted", color: "text-purple-400", glow: "shadow-purple-400/20", img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJk5S0mvLwOq7c2DwB68By37jD8Y-h0FbjrkVvMGzzctOXewQ3YlHTr1DvxebthMC56sidn3Vj73Yks37UykS1n1gSOObeL2tT" },
        { name: "Butterfly Knife", rarity: "★ Rare", color: "text-red-400", glow: "shadow-red-400/20", img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBF2p66gZQZp0un3fDJQ5N2_mYWFk-79O77UkDJSvJBzi7uVrd_z2Vax-0NrYDjzLIXEcVBoZlqC-we4xfS6gZ_uv5_LzXdi6yEm7WGdwUIkUu_KLA" },
    ];

    useEffect(() => {
        setLoading(true);
        // Simulate API fetch delay
        const t = setTimeout(() => {
            setItems(mockItems.slice(0, limit));
            setLoading(false);
        }, 1200);
        return () => clearTimeout(t);
    }, [gameId, limit]);

    if (isEditing) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                        Inventory Settings
                    </label>

                    <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Game ID / AppID</label>
                        <select
                            value={gameId}
                            onChange={(e) => onConfigChange({ ...config, gameId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                        >
                            <option value="730" className="bg-zinc-900">CS2 (730)</option>
                            <option value="570" className="bg-zinc-900">Dota 2 (570)</option>
                            <option value="440" className="bg-zinc-900">Team Fortress 2 (440)</option>
                            <option value="252490" className="bg-zinc-900">Rust (252490)</option>
                            <option value="753" className="bg-zinc-900">Steam Items (753)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Show Limit</label>
                        <span className="text-[9px] font-mono text-blue-400">{limit} items</span>
                    </div>
                    <input
                        type="range"
                        min="4"
                        max="16"
                        value={limit}
                        onChange={(e) => onConfigChange({ ...config, limit: parseInt(e.target.value) })}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <div className="flex-1 flex items-center justify-center rounded-xl bg-black/40 border border-white/5 p-4">
                    <div className="text-center">
                        <span className="text-2xl mb-2 block">🎒</span>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Previewing {gameId} Inventory</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">Scanning Inventory...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Steam Inventory</h3>
                <span className="text-[9px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    {gameId === "730" ? "CS2" : gameId === "570" ? "Dota 2" : "Steam"}
                </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -4, scale: 1.05 }}
                        className={`relative aspect-square rounded-lg bg-white/5 border border-white/10 p-1.5 flex flex-col items-center justify-center group overflow-hidden shadow-lg ${item.glow}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-contain mb-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                        />
                        <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className={`text-[7px] font-black truncate leading-none mb-0.5 ${item.color}`}>{item.rarity.toUpperCase()}</p>
                            <p className="text-[7px] text-white font-bold truncate leading-none">{item.name}</p>
                        </div>
                    </motion.div>
                ))}

                {items.length === 0 && (
                    <div className="col-span-4 flex flex-col items-center justify-center py-8 opacity-20">
                        <span className="text-3xl mb-2">🧊</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Inventory Hidden</p>
                    </div>
                )}
            </div>
        </div>
    );
}

CustomInventoryWidget.defaultConfig = DEFAULT_CONFIG;
