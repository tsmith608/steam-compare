"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to ensure links are valid URLs
const ensureUrl = (input, platform) => {
    if (!input) return "";
    let clean = input.trim();
    if (clean.startsWith('http')) return clean;

    // Platform specific handle mapping
    if (platform === 'x') return `https://x.com/${clean.replace('@', '')}`;
    if (platform === 'twitch') return `https://twitch.tv/${clean}`;

    return `https://${clean}`;
};

export default function SocialsWidget({ profile, isCustomizing, setProfile, theme = { accent: 'text-emerald-500', glow: 'shadow-emerald-500/20' } }) {
    const [copied, setCopied] = useState(false);

    // Local state to prevent focus loss during main profile state updates
    const [localDiscord, setLocalDiscord] = useState(profile.discord_link || "");
    const [localTwitter, setLocalTwitter] = useState(profile.twitter_link || "");
    const [localTwitch, setLocalTwitch] = useState(profile.twitch_link || "");

    // Sync local state with profile prop when profile changes
    useEffect(() => {
        setLocalDiscord(profile.discord_link || "");
        setLocalTwitter(profile.twitter_link || "");
        setLocalTwitch(profile.twitch_link || "");
    }, [profile.discord_link, profile.twitter_link, profile.twitch_link]);

    const handleCopyDiscord = () => {
        if (!profile.discord_link) return;
        navigator.clipboard.writeText(profile.discord_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Update main state on blur
    const handleSave = (field, value) => {
        setProfile({ ...profile, [field]: value });
    };

    if (isCustomizing) {
        return (
            <div className="h-full flex flex-col p-2 bg-black/60 rounded-xl border border-white/10 overflow-hidden relative group/edit">
                <style jsx>{`
                    .custom-scrollbar-thin::-webkit-scrollbar { width: 3px; }
                    .custom-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
                `}</style>
                <h3 className="text-emerald-400/80 text-[7px] font-black uppercase tracking-[0.4em] mb-2 text-center flex-shrink-0">
                    Settings
                </h3>
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar-thin pr-0.5 pb-1 scroll-smooth">
                    <SocialInput
                        icon="🎮"
                        label="Discord"
                        value={localDiscord}
                        onChange={setLocalDiscord}
                        onBlur={() => handleSave('discord_link', localDiscord)}
                        placeholder="username#0000"
                    />
                    <SocialInput
                        svgIcon={<XIcon size={10} />}
                        label="X (Twitter)"
                        value={localTwitter}
                        onChange={setLocalTwitter}
                        onBlur={() => handleSave('twitter_link', localTwitter)}
                        placeholder="handle or URL"
                    />
                    <SocialInput
                        icon="📺"
                        label="Twitch"
                        value={localTwitch}
                        onChange={setLocalTwitch}
                        onBlur={() => handleSave('twitch_link', localTwitch)}
                        placeholder="username or URL"
                    />
                </div>
            </div>
        );
    }

    const hasAnySocial = profile.discord_link || profile.twitter_link || profile.twitch_link || (profile.custom_links && profile.custom_links.length > 0);

    if (!hasAnySocial) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg mb-2 opacity-20">🌐</div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">No Connections</p>
                <p className="text-[8px] text-gray-500 mt-1 italic">Edit dashboard to add links</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-3 relative overflow-hidden group">
            <h3 className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.3em] mb-3 text-center opacity-40 group-hover:opacity-100 transition-opacity">
                Network Portal
            </h3>

            <div className="flex flex-col gap-1.5 flex-1 justify-center">
                {profile.discord_link && (
                    <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(88, 101, 242, 0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyDiscord}
                        className="group/social relative w-full px-4 py-2.5 bg-[#5865F2]/5 border border-[#5865F2]/10 rounded-xl flex items-center gap-3.5 transition-all hover:border-[#5865F2]/30 backdrop-blur-md"
                    >
                        <div className="w-7 h-7 rounded-lg bg-[#5865F2]/10 flex items-center justify-center text-xs text-[#5865F2] group-hover/social:scale-110 transition-transform">
                            🎮
                        </div>
                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                            <span className="text-[10px] font-bold text-gray-200 truncate leading-tight w-full">{profile.discord_link}</span>
                            <span className="text-[7.5px] text-[#5865F2]/60 font-black uppercase tracking-widest">
                                {copied ? 'ID Copied!' : 'Discord Account'}
                            </span>
                        </div>
                        <div className="opacity-0 group-hover/social:opacity-100 transition-opacity text-[8px] font-black text-[#5865F2]/40 uppercase tracking-tighter">Copy</div>
                    </motion.button>
                )}

                {profile.twitter_link && (
                    <SocialLink
                        href={ensureUrl(profile.twitter_link, 'x')}
                        svgIcon={<XIcon size={12} className="text-white" />}
                        label="X (Twitter)"
                        sublabel="Postings & Updates"
                        color="bg-white/5"
                        borderColor="border-white/10"
                        hoverBorder="hover:border-white/30"
                        iconContainerColor="bg-white/5"
                        iconColor="text-white"
                    />
                )}

                {profile.twitch_link && (
                    <SocialLink
                        href={ensureUrl(profile.twitch_link, 'twitch')}
                        icon="📺"
                        label="Twitch"
                        sublabel="Live Streaming"
                        color="bg-[#9146FF]/5"
                        borderColor="border-[#9146FF]/10"
                        hoverBorder="hover:border-[#9146FF]/30"
                        iconContainerColor="bg-[#9146FF]/10"
                        iconColor="text-[#a970ff]"
                    />
                )}

                {profile.custom_links?.map((link, idx) => (
                    <SocialLink
                        key={idx}
                        href={ensureUrl(link.url)}
                        icon="🌐"
                        label={link.label || 'Website'}
                        sublabel="External Portal"
                        color="bg-white/5"
                        borderColor="border-white/10"
                        hoverBorder="hover:border-white/30"
                        iconContainerColor="bg-white/5"
                        iconColor="text-white/40"
                    />
                ))}
            </div>
        </div>
    );
}

function SocialLink({ href, icon, svgIcon, label, sublabel, color, borderColor, hoverBorder, iconContainerColor, iconColor }) {
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            className={`group/social relative w-full px-4 py-2.5 ${color} ${borderColor} border rounded-xl flex items-center gap-3.5 transition-all ${hoverBorder} backdrop-blur-md`}
        >
            <div className={`w-7 h-7 rounded-lg ${iconContainerColor} flex items-center justify-center text-xs ${iconColor} group-hover/social:scale-110 transition-transform`}>
                {svgIcon || icon}
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[10px] font-bold text-gray-200 leading-tight truncate w-full">{label}</span>
                <span className={`text-[7.5px] ${iconColor} opacity-50 font-black uppercase tracking-widest`}>{sublabel || 'Connect'}</span>
            </div>
            <div className="opacity-0 group-hover/social:opacity-100 transition-opacity text-[8px] font-black text-white/20 uppercase tracking-tighter">Visit</div>
        </motion.a>
    );
}

function SocialInput({ icon, svgIcon, label, value, onChange, onBlur, placeholder }) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 px-1 opacity-60">
                {svgIcon ? svgIcon : <span className="text-[9px]">{icon}</span>}
                <label className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            </div>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                className="w-full bg-black/60 border border-white/5 rounded-lg py-1.5 px-2.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all hover:bg-black/80"
                placeholder={placeholder}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur();
                    }
                }}
            />
        </div>
    );
}

function XIcon({ size = 12, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
        </svg>
    );
}
