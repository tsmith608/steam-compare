"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CollectionModal from './CollectionModal';
import { motion, useSpring, useMotionValue, useInView } from "framer-motion";

const THEMES = {
    default: {
        name: "Modern Stealth",
        bg: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%)",
        accent: "text-blue-400",
        border: "border-white/5",
        cardBg: "bg-[#0e0e10]",
        font: "font-sans"
    },
    medieval: {
        name: "Medieval Quest",
        bg: "url('https://www.transparenttextures.com/patterns/natural-paper.png'), radial-gradient(circle at 50% 0%, #291a0c, #0d0905)",
        accent: "text-amber-500",
        border: "border-[#422006] shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.4)]",
        cardBg: "bg-[#1c140d]/95",
        font: "font-serif",
        style: "sepia-[0.2] contrast-[1.1]",
        cardStyle: "rounded-sm border-[3px] border-double",
        overlay: "opacity-20 pointer-events-none absolute inset-0 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]",
        decoration: "text-[#422006]"
    },
    future: {
        name: "Cyberpunk Future",
        bg: "radial-gradient(circle at 80% 20%, #1a0b2e, #050505)",
        accent: "text-pink-500",
        border: "border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.3),inset_0_0_10px_rgba(236,72,153,0.1)]",
        cardBg: "bg-black/95",
        font: "font-mono font-bold uppercase tracking-tighter",
        style: "hue-rotate-[15deg] brightness-[1.1]",
        cardStyle: "rounded-none border-t-[6px] border-l-[6px]",
        overlay: "opacity-[0.03] pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] animate-pulse",
        scanlines: true
    },
    black_blue: {
        name: "Abyssal Blue",
        bg: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
        accent: "text-cyan-400",
        border: "border-cyan-500/30 shadow-[0_0_40px_rgba(0,163,255,0.2)]",
        cardBg: "bg-[#000814]/80 backdrop-blur-md",
        font: "font-sans",
        style: "saturate-[1.2]"
    },
    red_white: {
        name: "Blood & Bone",
        bg: "radial-gradient(circle at top, #450a0a, #000000)",
        accent: "text-red-600",
        border: "border-red-900 shadow-[0_15px_40px_rgba(220,38,38,0.15)]",
        cardBg: "bg-zinc-950",
        font: "font-black tracking-tight",
        style: "contrast-[1.1]"
    }
};

function Counter({ value }) {
    const ref = React.useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
    const isInView = useInView(ref, { once: true, margin: "-10px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, value, isInView]);

    const [displayValue, setDisplayValue] = React.useState(0);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.round(latest));
        });
    }, [springValue]);

    return <span ref={ref}>{displayValue}</span>;
}

export default function DashboardView({ overrideSteamId }) {
    const searchParams = useSearchParams();
    const paramSteamId = searchParams.get("steamid");
    const userName = searchParams.get("name");
    const userAvatar = searchParams.get("avatar");

    const [isPremium, setIsPremium] = useState(null);
    const [tier, setTier] = useState('Noob');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [fetchedUser, setFetchedUser] = useState(null);

    // Profile State
    const [profile, setProfile] = useState({
        discord_link: "",
        twitter_link: "",
        twitch_link: "",
        youtube_link: "",
        bio: "",
        pinned_game_ids: [],
        custom_banner: "",
        custom_links: [],
        gamer_title: "",
        featured_collection_id: "",
        profile_theme_preset: "default",
        custom_page_bg: "",
        custom_banner_pos: 50
    });

    // Library for selection
    const [fullLibrary, setFullLibrary] = useState([]);

    // State for local auth fallback
    const [localAuth, setLocalAuth] = useState({ id: paramSteamId, name: userName, avatar: userAvatar });

    useEffect(() => {
        if (paramSteamId) {
            setLocalAuth({ id: paramSteamId, name: userName, avatar: userAvatar });
            return;
        }

        const sId = sessionStorage.getItem("wb.steamid");
        const sName = sessionStorage.getItem("wb.username");
        const sAvatar = sessionStorage.getItem("wb.avatar");

        if (sId) {
            setLocalAuth({ id: sId, name: sName, avatar: sAvatar });
        } else if (!overrideSteamId) {
            setLoading(false);
        }
    }, [paramSteamId, userName, userAvatar, overrideSteamId]);

    const activeSteamId = overrideSteamId || paramSteamId || localAuth.id;
    const activeUserName = userName || localAuth.name || fetchedUser?.personaname || fetchedUser?.username;
    const activeUserAvatar = userAvatar || localAuth.avatar || fetchedUser?.avatarfull || fetchedUser?.avatar;

    // isOwner logic: Check if the current ID matches logged-in ID, or if the resolved fetched ID matches
    const loggedInId = typeof window !== 'undefined' ? sessionStorage.getItem("wb.steamid") : null;
    const isOwner = (activeSteamId && loggedInId && activeSteamId === loggedInId) ||
        (fetchedUser?.steamid && loggedInId && String(fetchedUser.steamid) === String(loggedInId));

    useEffect(() => {
        if (!activeSteamId) return;

        async function init() {
            setLoading(true);
            try {
                const premRes = await fetch(`/api/user/premium?steamid=${activeSteamId}`);
                const premData = await premRes.json();
                setIsPremium(premData.isPremium);
                setTier(premData.tier || 'Noob');

                const profRes = await fetch(`/api/user/profile?steamid=${activeSteamId}`);
                const profData = await profRes.json();
                if (profData.found) {
                    setProfile(profData.profile);
                } else if (!activeSteamId.match(/^\d{17}$/)) {
                    // If we were looking up by vanity and didn't find it yet, 
                    // we'll try again with the numeric ID after /api/compare returns.
                    console.log("Vanity profile not found in initial fetch, waiting for resolution...");
                }

                const compareRes = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ users: [activeSteamId, activeSteamId] })
                });

                if (!compareRes.ok) {
                    const errorData = await compareRes.json();
                    throw new Error(errorData.error || "Failed to fetch library data");
                }
                const data = await compareRes.json();
                const library = data.shared || [];
                const p = (data.profiles && data.profiles[0]) ? data.profiles[0] : null;

                if (p) {
                    setFetchedUser(p);

                    // Re-fetch profile if we didn't get it by vanity name initially
                    if (!profData.found && p.steamid) {
                        const profRes2 = await fetch(`/api/user/profile?steamid=${p.steamid}`);
                        const profData2 = await profRes2.json();
                        if (profData2.found) {
                            setProfile(profData2.profile);
                        }
                    }

                    // Self-healing: Update DB with name/vanity if this is the owner
                    // Re-evaluate isOwner here since we now have p.steamid
                    const currentLoggedInId = sessionStorage.getItem("wb.steamid");
                    const ownerCheck = (activeSteamId === currentLoggedInId) || (p.steamid && String(p.steamid) === String(currentLoggedInId));

                    if (ownerCheck) {
                        let vId = "";
                        if (p.profileurl && p.profileurl.includes("/id/")) {
                            const m = p.profileurl.match(/\/id\/([^\/?#]+)/);
                            if (m) vId = m[1];
                        }

                        fetch('/api/user/profile', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                steamId: p.steamid || activeSteamId,
                                personaName: p.personaname || p.username,
                                vanityId: vId,
                                // Keep existing profile fields if we have them
                                discordLink: profData.found ? profData.profile.discord_link : "",
                                twitterLink: profData.found ? profData.profile.twitter_link : "",
                                twitchLink: profData.found ? profData.profile.twitch_link : "",
                                youtubeLink: profData.found ? profData.profile.youtube_link : "",
                                bio: profData.found ? profData.profile.bio : "",
                                pinnedGameIds: profData.found ? profData.profile.pinned_game_ids : [],
                                customBanner: profData.found ? profData.profile.custom_banner : "",
                                customLinks: profData.found ? profData.profile.custom_links : [],
                                gamerTitle: profData.found ? profData.profile.gamer_title : "",
                                featuredCollectionId: profData.found ? profData.profile.featured_collection_id : "",
                                profileThemePreset: profData.found ? profData.profile.profile_theme_preset : "default",
                                customPageBg: profData.found ? profData.profile.custom_page_bg : "",
                                customBannerPos: profData.found ? profData.profile.custom_banner_pos : 50
                            })
                        }).catch(e => console.error("Self-healing sync failed:", e));
                    }
                }

                setFullLibrary(library);

                // Use the numeric ID for stat lookups if we have it
                const resolvedNumericId = p?.steamid || activeSteamId;

                if (library.length > 0) {
                    const totalGames = library.length;
                    let totalMinutes = 0;
                    const sorted = library.map(g => {
                        const pt = g.playtimes ? g.playtimes[resolvedNumericId] : g.playtime_forever;
                        totalMinutes += pt || 0;
                        return { name: g.name, pt: pt || 0, appid: g.appid };
                    }).sort((a, b) => b.pt - a.pt);

                    setStats({
                        totalGames,
                        totalHours: Math.round(totalMinutes / 60),
                        days: (totalMinutes / 60 / 24).toFixed(1),
                        top3: sorted.slice(0, 3)
                    });
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        init();
        setIsEditing(false); // Reset editing state when profile changes
    }, [activeSteamId]);

    const handleSaveProfile = async () => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    steamId: activeSteamId,
                    discordLink: profile.discord_link,
                    twitterLink: profile.twitter_link,
                    twitchLink: profile.twitch_link,
                    youtubeLink: profile.youtube_link,
                    bio: profile.bio,
                    pinnedGameIds: profile.pinned_game_ids,
                    customBanner: profile.custom_banner,
                    customLinks: profile.custom_links,
                    gamerTitle: profile.gamer_title,
                    featuredCollectionId: profile.featured_collection_id,
                    profileThemePreset: profile.profile_theme_preset,
                    customPageBg: profile.custom_page_bg,
                    customBannerPos: profile.custom_banner_pos
                })
            });
            if (res.ok) {
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [shareProfileText, setShareProfileText] = useState("Share Profile");

    const handleShareProfile = () => {
        // Prioritize vanity_id, then persona_name (sanitized), then numeric steam id
        const shareId = profile.vanity_id || profile.persona_name || activeSteamId;
        const url = `${window.location.origin}/${shareId}`;
        navigator.clipboard.writeText(url);
        setShareProfileText("Link Copied!");
        setTimeout(() => setShareProfileText("Share Profile"), 2000);
    };

    const [pinSearch, setPinSearch] = useState("");
    const filteredForPins = fullLibrary.filter(g =>
        g.name.toLowerCase().includes(pinSearch.toLowerCase())
    );

    const [collections, setCollections] = useState([]);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [copiedCollectionId, setCopiedCollectionId] = useState(null);

    const fetchCollections = async () => {
        if (!activeSteamId) return;
        const res = await fetch(`/api/user/collections?steamid=${activeSteamId}`);
        const data = await res.json();
        setCollections(data.collections || []);
    };

    useEffect(() => {
        fetchCollections();
    }, [activeSteamId, fetchedUser?.steamid]);

    const handleOpenCollectionModal = (col = null, readOnly = false) => {
        setEditingCollection(col);
        setViewOnly(readOnly);
        setShowCollectionModal(true);
    };

    const handleSaveCollection = async (collectionData) => {
        try {
            const res = await fetch('/api/user/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...collectionData,
                    steamId: activeSteamId
                })
            });
            if (res.ok) {
                setShowCollectionModal(false);
                fetchCollections();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCollection = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/user/collections?id=${id}&steamid=${activeSteamId}`, { method: 'DELETE' });
            fetchCollections();
        } catch (err) {
            console.error(err);
        }
    };

    const handleShareCollection = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedCollectionId(id);
        setTimeout(() => setCopiedCollectionId(null), 2000);
    };

    if (!activeSteamId && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <h1 className="text-3xl font-bold mb-4 text-white">Dashboard</h1>
                <p className="text-gray-400 mb-8 max-w-md">Please sign in with Steam to view your personal dashboard and premium features.</p>
                <Link href="/" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">Go Home to Sign In</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-mono text-sm uppercase tracking-widest text-blue-500/50">Accessing Profile Database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                    <span className="text-3xl font-bold">!</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Access Denied</h1>
                <p className="text-gray-400 mb-8 max-w-md font-medium leading-relaxed">{error}</p>
                <Link href="/" className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10">Return Home</Link>
            </div>
        );
    }

    const theme = THEMES[profile.profile_theme_preset] || THEMES.default;

    return (
        <div className={`min-h-screen relative w-full ${theme.font} ${theme.style || ""}`}>
            <div
                className="fixed inset-0 -z-30 transition-all duration-1000"
                style={{ background: profile.custom_page_bg ? `url(${profile.custom_page_bg}) center/cover no-repeat fixed` : theme.bg }}
            />
            {theme.overlay && <div className={`${theme.overlay} fixed -z-20`}></div>}
            {theme.scanlines && (
                <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]"
                    style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}></div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-12 w-full relative z-10">
                <header className={`relative flex flex-col md:flex-row items-center gap-8 mb-16 p-8 ${theme.cardStyle || "rounded-3xl"} border ${theme.border} shadow-2xl backdrop-blur-sm overflow-hidden`}>
                    <div
                        className="absolute inset-0 -z-10 opacity-70 transition-all duration-1000"
                        style={{
                            background: profile.custom_banner ? `url(${profile.custom_banner}) no-repeat` : "rgba(0,0,0,0.4)",
                            backgroundSize: 'cover',
                            backgroundPosition: `center ${profile.custom_banner_pos}%`
                        }}
                    />

                    <div className="relative group">
                        <div className={`absolute inset-0 ${theme.accent.replace('text-', 'bg-')} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                        <img src={activeUserAvatar} alt="" className={`relative w-32 h-32 rounded-full ring-4 ring-white/10 hover:${theme.accent.replace('text-', 'ring-')}/50 transition-all shadow-2xl object-cover`} />
                    </div>

                    <div className="text-center md:text-left flex-1 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-3">
                            <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">{activeUserName}</h1>
                            {profile.gamer_title && (
                                <span className={`text-sm font-bold uppercase tracking-widest ${theme.accent} opacity-80`}>
                                    — {profile.gamer_title}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-6">
                            <span className="text-xs font-mono text-blue-200 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">{activeSteamId}</span>
                            {isPremium ? (
                                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                    {tier === 'Pro' ? 'Pro' : tier === 'Hacker' ? 'Hacker' : 'Premium'}
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">Noob Tier</span>
                            )}
                        </div>

                        {!(isEditing && isOwner) ? (
                            <p className="text-gray-300 max-w-2xl text-lg leading-relaxed font-light">{profile.bio || "No bio yet."}</p>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell the world about your gaming journey..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Gamer Title</label>
                                        <input
                                            type="text"
                                            value={profile.gamer_title}
                                            onChange={(e) => setProfile({ ...profile, gamer_title: e.target.value })}
                                            placeholder="e.g. Backlog Slayer"
                                            className="w-full bg-transparent text-sm text-white focus:outline-none"
                                        />
                                    </div>
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Theme Preset</label>
                                        <select
                                            value={profile.profile_theme_preset}
                                            onChange={(e) => setProfile({ ...profile, profile_theme_preset: e.target.value })}
                                            className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                                        >
                                            {Object.entries(THEMES).map(([id, t]) => (
                                                <option key={id} value={id} className="bg-[#1a1a1d]">{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Custom Banner Image (Header)</label>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        alert("Image too large (max 2MB)");
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setProfile({ ...profile, custom_banner: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                        />
                                        {profile.custom_banner && (
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setProfile({ ...profile, custom_banner: "" })}
                                                    className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest text-left"
                                                >Remove Header Banner</button>
                                                <div className="mt-1">
                                                    <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Banner Position (Pan)</label>
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={profile.custom_banner_pos}
                                                        onChange={(e) => setProfile({ ...profile, custom_banner_pos: parseInt(e.target.value) })}
                                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Custom Page Background</label>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        alert("Image too large (max 2MB)");
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setProfile({ ...profile, custom_page_bg: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                                        />
                                        {profile.custom_page_bg && (
                                            <button
                                                onClick={() => setProfile({ ...profile, custom_page_bg: "" })}
                                                className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest text-left"
                                            >Remove Page Background</button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Featured Collection</label>
                                    <select
                                        value={profile.featured_collection_id}
                                        onChange={(e) => setProfile({ ...profile, featured_collection_id: e.target.value })}
                                        className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#1a1a1d]">None</option>
                                        {collections.map(c => (
                                            <option key={c.id} value={c.id} className="bg-[#1a1a1d]">{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 min-w-[140px]">
                        {isOwner && (
                            <>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-white/20 text-gray-400"
                                >
                                    {isEditing ? "Cancel" : "Edit Profile"}
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:scale-105"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </>
                        )}
                        {!isEditing && (
                            <button
                                onClick={handleShareProfile}
                                className="px-6 py-3 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-emerald-500/30 text-gray-400"
                            >
                                {shareProfileText}
                            </button>
                        )}
                    </div>
                </header>

                <section className="mb-20">
                    <div className={`${theme.cardBg} ${theme.cardStyle || "rounded-3xl"} border ${theme.border} overflow-hidden shadow-2xl relative`}>
                        {theme.overlay && <div className={theme.overlay}></div>}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>

                        <div className={`grid grid-cols-1 lg:grid-cols-4 border-b ${theme.border}`}>
                            <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors">
                                <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-blue-300">Total Playtime</h3>
                                <div className="flex items-baseline gap-1">
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-5xl font-black text-white tracking-tighter"
                                    >
                                        <Counter value={stats?.totalHours || 0} />
                                    </motion.span>
                                    <span className="text-xl text-gray-600 font-bold">h</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-mono">{stats?.days || 0} days of life</p>
                            </div>

                            <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors">
                                <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-purple-300">Library Count</h3>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-5xl font-black text-white tracking-tighter"
                                >
                                    <Counter value={stats?.totalGames || 0} />
                                </motion.span>
                                <p className="text-xs text-gray-500 mt-2 font-mono">Games Owned</p>
                            </div>

                            <div className="lg:col-span-2 p-8 flex flex-col justify-center">
                                <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 text-center lg:text-left">Connect & Socials</h3>
                                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                    {isEditing && isOwner ? (
                                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                                <label className="text-[10px] text-gray-500 font-bold block mb-1">DISCORD</label>
                                                <input value={profile.discord_link} onChange={e => setProfile({ ...profile, discord_link: e.target.value })} className="w-full bg-transparent text-sm text-white focus:outline-none" placeholder="username" />
                                            </div>
                                            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                                <label className="text-[10px] text-gray-500 font-bold block mb-1">TWITTER</label>
                                                <input value={profile.twitter_link} onChange={e => setProfile({ ...profile, twitter_link: e.target.value })} className="w-full bg-transparent text-sm text-white focus:outline-none" placeholder="URL" />
                                            </div>
                                            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                                <label className="text-[10px] text-gray-500 font-bold block mb-1">TWITCH</label>
                                                <input value={profile.twitch_link} onChange={e => setProfile({ ...profile, twitch_link: e.target.value })} className="w-full bg-transparent text-sm text-white focus:outline-none" placeholder="URL" />
                                            </div>
                                            <div className="w-full mt-4 pt-4 border-t border-white/5">
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Custom Links</label>
                                                <div className="space-y-2">
                                                    {profile.custom_links.map((link, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <input
                                                                value={link.label}
                                                                onChange={e => {
                                                                    const newLinks = [...profile.custom_links];
                                                                    newLinks[idx].label = e.target.value;
                                                                    setProfile({ ...profile, custom_links: newLinks });
                                                                }}
                                                                className="flex-1 bg-black/20 p-2 rounded border border-white/5 text-xs text-white"
                                                                placeholder="Label (e.g. Portfolio)"
                                                            />
                                                            <input
                                                                value={link.url}
                                                                onChange={e => {
                                                                    const newLinks = [...profile.custom_links];
                                                                    newLinks[idx].url = e.target.value;
                                                                    setProfile({ ...profile, custom_links: newLinks });
                                                                }}
                                                                className="flex-2 bg-black/20 p-2 rounded border border-white/5 text-xs text-white"
                                                                placeholder="URL"
                                                            />
                                                            <button
                                                                onClick={() => setProfile({ ...profile, custom_links: profile.custom_links.filter((_, i) => i !== idx) })}
                                                                className="px-2 text-red-500 hover:text-red-400"
                                                            >✕</button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setProfile({ ...profile, custom_links: [...profile.custom_links, { label: "", url: "" }] })}
                                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                                                    >+ Add Link</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {profile.discord_link && (
                                                <div className="px-4 py-2 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-lg flex items-center gap-2">
                                                    <span className="text-[#5865F2]">🎮</span>
                                                    <span className="text-xs font-bold text-gray-300">{profile.discord_link}</span>
                                                </div>
                                            )}
                                            {profile.twitter_link && (
                                                <a href={profile.twitter_link} target="_blank" className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2 hover:bg-blue-500/20 transition-colors">
                                                    <span className="text-blue-400">🐦</span>
                                                    <span className="text-xs font-bold text-gray-300">Twitter</span>
                                                </a>
                                            )}
                                            {profile.twitch_link && (
                                                <a href={profile.twitch_link} target="_blank" className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2 hover:bg-purple-500/20 transition-colors">
                                                    <span className="text-purple-400">📺</span>
                                                    <span className="text-xs font-bold text-gray-300">Twitch</span>
                                                </a>
                                            )}
                                            {profile.custom_links.map((link, idx) => (
                                                <a key={idx} href={link.url} target="_blank" className={`px-4 py-2 ${theme.cardBg} border ${theme.border} rounded-lg flex items-center gap-2 hover:opacity-80 transition-all shadow-lg`}>
                                                    <span className={theme.accent}>🔗</span>
                                                    <span className="text-xs font-bold text-gray-300">{link.label}</span>
                                                </a>
                                            ))}
                                            {!profile.discord_link && !profile.twitter_link && !profile.twitch_link && profile.custom_links.length === 0 && (
                                                <span className="text-xs text-gray-600 italic">No socials linked.</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5">
                                <h3 className="text-white text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="text-amber-500">🏆</span> Most Played
                                </h3>
                                <div className="space-y-6">
                                    {stats?.top3?.map((g, i) => (
                                        <div key={g.appid} className="relative">
                                            <div className="flex items-center justify-between mb-2 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-lg font-black w-6 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`}>#{i + 1}</span>
                                                    <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`} className="w-6 h-6 rounded grayscale opacity-60" />
                                                    <span className="text-sm font-bold text-gray-200 truncate max-w-[150px]">{g.name}</span>
                                                </div>
                                                <span className="text-xs font-mono text-gray-500">{Math.round(g.pt / 60)}h</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${(g.pt / (stats.top3[0]?.pt || 1)) * 100}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-white/20'}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-black/20">
                                <h3 className="text-white text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="text-pink-500">📌</span> Favorites
                                    <span className="text-xs text-gray-600 bg-black/40 px-2 py-1 rounded ml-auto">{profile.pinned_game_ids.length}/4</span>
                                </h3>

                                {(isEditing && isOwner) && (
                                    <div className="mb-6 relative z-50">
                                        <input
                                            type="text"
                                            placeholder="Search to pin..."
                                            value={pinSearch}
                                            onChange={(e) => setPinSearch(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-pink-500 transition-all"
                                        />
                                        {pinSearch && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-y-auto custom-scrollbar max-h-[200px]">
                                                {filteredForPins.slice(0, 10).map(g => (
                                                    <button
                                                        key={g.appid}
                                                        onClick={() => {
                                                            if (!profile.pinned_game_ids.includes(g.appid) && profile.pinned_game_ids.length < 4) {
                                                                setProfile({ ...profile, pinned_game_ids: [...profile.pinned_game_ids, g.appid] });
                                                                setPinSearch("");
                                                            }
                                                        }}
                                                        className="w-full text-left p-2 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                                                    >
                                                        <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`} className="w-8 rounded" />
                                                        <span className="text-xs font-bold text-gray-300 truncate">{g.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-4 gap-3">
                                    {profile.pinned_game_ids.map(appid => {
                                        const game = fullLibrary.find(g => g.appid === appid) || { name: 'Unknown', appid };
                                        return (
                                            <div key={appid} className="relative aspect-[2/3] group rounded-lg overflow-hidden shadow-lg border border-white/5 bg-gray-900">
                                                <img
                                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => { e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`; e.target.className = "object-cover h-full w-full opacity-50"; }}
                                                />
                                                {(isEditing && isOwner) && (
                                                    <button
                                                        onClick={() => setProfile({ ...profile, pinned_game_ids: profile.pinned_game_ids.filter(id => id !== appid) })}
                                                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                                                    >✕</button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {Array.from({ length: 4 - profile.pinned_game_ids.length }).map((_, i) => (
                                        <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                                            <span className="text-white/10 text-xl font-black">+</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Collections</h2>
                            <div className="h-px bg-white/10 w-24"></div>
                        </div>
                        {isOwner && (
                            <button
                                onClick={() => handleOpenCollectionModal()}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                            >
                                + Create
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.length === 0 && (
                            <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl mb-4">📂</div>
                                <p className="text-gray-400 font-bold text-lg">No collections yet.</p>
                            </div>
                        )}
                        {(() => {
                            const sortedCollections = [...collections].sort((a, b) => {
                                if (a.id === profile.featured_collection_id) return -1;
                                if (b.id === profile.featured_collection_id) return 1;
                                return 0;
                            });

                            return sortedCollections.map(c => {
                                const isFeatured = c.id === profile.featured_collection_id;
                                return (
                                    <div key={c.id} onClick={() => handleOpenCollectionModal(c, true)} className={`group ${theme.cardBg} ${theme.cardStyle || "rounded-2xl"} border ${isFeatured ? theme.border.replace('border-', 'border-2 border-') : theme.border} overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer relative`}>
                                        {theme.overlay && <div className={theme.overlay}></div>}
                                        {isFeatured && (
                                            <div className={`absolute top-0 left-0 ${theme.accent.replace('text-', 'bg-')} text-white text-[10px] font-black px-3 py-1 rounded-br-lg z-20 shadow-lg tracking-widest uppercase`}>
                                                Featured
                                            </div>
                                        )}
                                        <div className="h-40 bg-gray-900 relative">
                                            {c.game_ids?.[0] && (
                                                <img
                                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${typeof c.game_ids[0] === 'object' ? c.game_ids[0].appid : c.game_ids[0]}/header.jpg`}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                />
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-gray-400">
                                                    {c.is_public ? 'PUBLIC' : 'PRIVATE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-white mb-2 truncate">{c.title}</h3>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <span className="text-xs text-gray-500">{c.game_ids?.length || 0} games</span>
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleShareCollection(c.id); }} className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded">
                                                        {copiedCollectionId === c.id ? "ID Copied!" : "Share"}
                                                    </button>
                                                    {isOwner && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenCollectionModal(c, false); }} className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded">Edit</button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCollection(c.id); }} className="text-xs font-bold text-red-900 hover:text-red-500 px-2 py-1 bg-white/5 rounded">Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </section>

                {showCollectionModal && (
                    <CollectionModal
                        isOpen={showCollectionModal}
                        onClose={() => setShowCollectionModal(false)}
                        collection={editingCollection}
                        fullLibrary={fullLibrary}
                        onSave={handleSaveCollection}
                        readOnly={viewOnly}
                        onShare={handleShareCollection}
                    />
                )}

                {/* 6. Footer Area (Perks & Quick Links) */}
                <footer className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-12 border-t border-white/5 pb-20">
                    {/* Perks Card */}
                    <div className="lg:col-span-1 p-8 rounded-3xl bg-[#0a0a0c] bg-gradient-to-br from-emerald-500/5 to-transparent border border-white/5 hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                            <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        </div>

                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            Premium Benefits
                        </h4>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isPremium ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-gray-600 border border-white/5'}`}>
                                    {isPremium ? '✓' : '×'}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${isPremium ? 'text-white' : 'text-gray-500'}`}>Ad-Free Experience</p>
                                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider font-medium">{isPremium ? "Banners Removed" : "Standard Access"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isPremium ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-gray-600 border border-white/5'}`}>
                                    {isPremium ? '✓' : '×'}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${isPremium ? 'text-white' : 'text-gray-500'}`}>12 Player Comparison</p>
                                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider font-medium">{isPremium ? "Max Power" : "4 Player Limit"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isPremium ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-gray-600 border border-white/5'}`}>
                                    {isPremium ? '✓' : '×'}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${isPremium ? 'text-white' : 'text-gray-500'}`}>Saved Squads</p>
                                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider font-medium">{isPremium ? "Quick Load Squads" : "Standard Limit"}</p>
                                </div>
                            </div>
                        </div>

                        {!isPremium && (
                            <Link href="/upgrade" className="mt-10 block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]">
                                Unlock Premium
                            </Link>
                        )}
                    </div>

                    {/* Quick Navigation Card */}
                    <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0a0a0c] border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Quick Navigation</h4>
                            <div className="h-px bg-white/5 flex-grow mx-6"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            <Link href="/" className="group/nav bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 p-6 rounded-2xl transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl group-hover/nav:scale-110 transition-transform duration-500">🔍</div>
                                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-all">
                                        <span className="text-white text-xs">→</span>
                                    </div>
                                </div>
                                <h5 className="text-white font-bold mb-1">Compare Games</h5>
                                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">shared Titles in your squad</p>
                            </Link>

                            <Link href="/commands" className="group/nav bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/30 p-6 rounded-2xl transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl group-hover/nav:scale-110 transition-transform duration-500">🤖</div>
                                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-all">
                                        <span className="text-white text-xs">→</span>
                                    </div>
                                </div>
                                <h5 className="text-white font-bold mb-1">Bot Commands</h5>
                                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Control experience via Discord</p>
                            </Link>
                        </div>

                    </div>
                </footer>
            </div>
        </div>
    );
}
