"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CollectionModal from './CollectionModal';
import BannerEditorModal from './BannerEditorModal';
import AchievementShowcase from './AchievementShowcase';
import StatRings from './StatRings';
import ActivityHeatmap from './ActivityHeatmap';
import { motion, useSpring, useMotionValue, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
const ResponsiveGridLayout = WidthProvider(Responsive);

import WidgetWrapper from './widgets/WidgetWrapper';
import WidgetPicker from './widgets/WidgetPicker';
import CustomTextWidget from './widgets/CustomTextWidget';
import CustomImageWidget from './widgets/CustomImageWidget';
import CustomEmbedWidget from './widgets/CustomEmbedWidget';
import CustomGifWidget from './widgets/CustomGifWidget';
import CustomMusicWidget from './widgets/CustomMusicWidget';
import CustomClockWidget from './widgets/CustomClockWidget';
import CustomCountdownWidget from './widgets/CustomCountdownWidget';
import { DEFAULT_LAYOUT, WIDGET_REGISTRY, generateWidgetId, getWidgetType } from './widgets/widgetRegistry';

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

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = "" }) {
    const ref = useRef(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 300, damping: 20 });
    const springY = useSpring(rotateY, { stiffness: 300, damping: 20 });

    const handleMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        rotateY.set(((x - midX) / midX) * 15);
        rotateX.set(((midY - y) / midY) * 15);
    }, [rotateX, rotateY]);

    const handleMouseLeave = useCallback(() => {
        rotateX.set(0);
        rotateY.set(0);
    }, [rotateX, rotateY]);

    return (
        <div className={`tilt-card ${className}`}>
            <motion.div
                ref={ref}
                className="tilt-card-inner w-full h-full"
                style={{ rotateX: springX, rotateY: springY }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </motion.div>
        </div>
    );
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

    // Grid Customization State
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);
    const [dashboardLayout, setDashboardLayout] = useState(null);
    const [widgetConfigs, setWidgetConfigs] = useState({});

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

    const isPublicView = !!overrideSteamId;
    const activeSteamId = String(fetchedUser?.steamid || overrideSteamId || paramSteamId || localAuth.id || "");

    // CRITICAL FIX: If we have a fetched user (public profile), show THEIR name/avatar, not ours.
    // If loading a public profile (`isPublicView`), do NOT fall back to `localAuth` (viewer's info).
    const activeUserName = fetchedUser?.personaname || fetchedUser?.username || userName || (!isPublicView ? localAuth.name : null) || overrideSteamId;
    const activeUserAvatar = fetchedUser?.avatarfull || fetchedUser?.avatar || userAvatar || (!isPublicView ? localAuth.avatar : null);

    // isOwner logic: Check if the current ID matches logged-in ID, or if the resolved fetched ID matches
    const loggedInId = typeof window !== 'undefined' ? sessionStorage.getItem("wb.steamid") : null;
    const isOwner = (loggedInId && String(activeSteamId) === String(loggedInId)) ||
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
                    // Load Dashboard Layout
                    if (profData.profile.dashboard_layout) {
                        const dl = profData.profile.dashboard_layout;
                        setDashboardLayout(dl.widgets || DEFAULT_LAYOUT);
                        // Extract configs for custom widgets
                        const configs = {};
                        dl.widgets?.forEach(w => { if (w.config) configs[w.i] = w.config; });
                        setWidgetConfigs(configs);
                    } else {
                        setDashboardLayout(DEFAULT_LAYOUT);
                    }
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

                    // Safe Vanity Sync: If owner, and DB lacks vanity, but Steam profile has it -> Update DB
                    // Re-evaluate isOwner here since we now have p.steamid
                    const currentLoggedInId = sessionStorage.getItem("wb.steamid");
                    const ownerCheck = (activeSteamId === currentLoggedInId) || (p.steamid && String(p.steamid) === String(currentLoggedInId));

                    // Use optional chaining for profData.profile just in case
                    if (ownerCheck && !profData.profile?.vanity_id && p.profileurl && p.profileurl.includes('/id/')) {
                        const m = p.profileurl.match(/\/id\/([^\/?#]+)/);
                        if (m) {
                            const newVanity = m[1];
                            console.log("Syncing vanity ID to DB:", newVanity);
                            fetch('/api/user/profile', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    steamId: p.steamid || activeSteamId,
                                    vanityId: newVanity
                                })
                            }).then(() => {
                                // optimistically update local state
                                setProfile(prev => ({ ...prev, vanity_id: newVanity }));
                            }).catch(e => console.error("Vanity sync failed:", e));
                        }
                    }
                }

                setFullLibrary(library);

                // Use the numeric ID for stat lookups if we have it
                const resolvedNumericId = p?.steamid || activeSteamId;

                if (library.length > 0) {
                    const totalGames = library.length;
                    let totalMinutes = 0;

                    // DEBUG: Trace Stats Calculation
                    console.log("[Dashboard] Stat Calc - ResolvedID:", resolvedNumericId);
                    console.log("[Dashboard] Sample Game:", library[0].name, library[0].playtimes);

                    const sorted = library.map(g => {
                        // Ensure we use the exact string key
                        const key = String(resolvedNumericId);
                        const pt = g.playtimes ? g.playtimes[key] : g.playtime_forever;
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
    }, [overrideSteamId, paramSteamId, localAuth.id]); // Now depends on localAuth.id to fix the "loads forever" issue when signing in.

    const handleSaveProfile = async () => {
        console.log("Attempting to save profile for ID:", activeSteamId);
        if (!activeSteamId) {
            alert("Error: No Steam ID found. Please refresh and try again.");
            return;
        }
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
                    customBannerPos: profile.custom_banner_pos,
                    dashboardLayout: {
                        widgets: dashboardLayout.map(w => ({
                            ...w,
                            ...(widgetConfigs[w.i] ? { config: widgetConfigs[w.i] } : {})
                        }))
                    }
                })
            });
            if (res.ok) {
                setIsEditing(false);
                alert("Profile saved successfully!");
            } else {
                const data = await res.json();
                alert(`Failed to save profile: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while saving the profile. The file might be too large for the server.");
        }
    };

    const [shareProfileText, setShareProfileText] = useState("Share Profile");

    const handleShareProfile = () => {
        // Prioritize vanity_id, then numeric steam id. NEVER use persona_name (unsafe for URLs)
        const shareId = profile.vanity_id || activeSteamId;
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

    const [bannerEditorImage, setBannerEditorImage] = useState(null);

    // Parallax scroll hook for the banner (must be before any conditional returns)
    const bannerRef = useRef(null);
    const { scrollY } = useScroll();
    const bannerY = useTransform(scrollY, [0, 500], [0, 150]);

    const handleOpenCollectionModal = (col = null, readOnly = false) => {
        setEditingCollection(col);
        setViewOnly(readOnly);
        setShowCollectionModal(true);
    };

    const handleSaveCollection = async (collectionData) => {
        console.log("Attempting to save collection for ID:", activeSteamId, "Title:", collectionData.title);
        if (!activeSteamId || !collectionData.title) {
            alert(`Error: Missing ${!activeSteamId ? 'Steam ID' : 'Title'}`);
            return;
        }
        try {
            const res = await fetch('/api/user/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...collectionData,
                    steamId: String(activeSteamId)
                })
            });
            if (res.ok) {
                setShowCollectionModal(false);
                fetchCollections();
            } else {
                const data = await res.json();
                alert(`Failed to save collection: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while saving the collection.");
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

    const handleAddWidget = (widgetType) => {
        const id = widgetType.startsWith('custom') ? generateWidgetId(widgetType) : widgetType;
        const reg = WIDGET_REGISTRY[widgetType] || WIDGET_REGISTRY.customText;
        const maxY = Math.max(...(dashboardLayout || []).map(w => w.y + w.h), 0);
        setDashboardLayout(prev => [...(prev || []), { i: id, x: 0, y: maxY, w: reg.defaultW, h: reg.defaultH }]);
    };

    const handleRemoveWidget = (id) => {
        setDashboardLayout(prev => (prev || []).filter(w => w.i !== id));
        setWidgetConfigs(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const renderWidget = (id) => {
        const type = id.includes('-') ? id.split('-')[0] : id;

        switch (type) {
            case 'playtime':
                return (
                    <div className="flex flex-col items-center justify-center text-center group h-full">
                        <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-300 transition-colors">Playtime</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white tracking-tighter leading-none"><Counter value={stats?.totalHours || 0} /></span>
                            <span className="text-base text-gray-500 font-bold">h</span>
                        </div>
                        <p className="text-[10px] text-white-600 mt-2 font-mono bg-white/5 px-2 py-0.5 rounded-full">{stats?.days || 0} days of life</p>
                    </div>
                );
            case 'library':
                return (
                    <div className="flex flex-col items-center justify-center text-center group h-full">
                        <h3 className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-purple-300 transition-colors">Library</h3>
                        <span className="text-4xl font-black text-white tracking-tighter leading-none"><Counter value={stats?.totalGames || 0} /></span>
                        <p className="text-[10px] text-white-600 mt-2 font-mono bg-white/5 px-2 py-0.5 rounded-full">Games</p>
                    </div>
                );
            case 'socials':
                return (
                    <div className="h-full flex flex-col">
                        <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Connections</h3>
                        <div className="flex flex-wrap gap-2.5">
                            {profile.discord_link && (
                                <div className="px-3.5 py-2 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl flex items-center gap-2 backdrop-blur-md">
                                    <span className="text-[#5865F2] text-xs">🎮</span>
                                    <span className="text-[11px] font-bold text-gray-200">{profile.discord_link}</span>
                                </div>
                            )}
                            {profile.twitter_link && (
                                <a href={profile.twitter_link} target="_blank" className="px-3.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 hover:bg-blue-500/20 transition-all backdrop-blur-md">
                                    <span className="text-blue-400 text-xs">🐦</span>
                                    <span className="text-[11px] font-bold text-gray-200">Twitter</span>
                                </a>
                            )}
                            {profile.twitch_link && (
                                <a href={profile.twitch_link} target="_blank" className="px-3.5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-2 hover:bg-purple-500/20 transition-all backdrop-blur-md">
                                    <span className="text-purple-400 text-xs">📺</span>
                                    <span className="text-[11px] font-bold text-gray-200">Twitch</span>
                                </a>
                            )}
                            {profile.custom_links.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all backdrop-blur-md">
                                    <span className={`${theme.accent} text-xs`}>🔗</span>
                                    <span className="text-[11px] font-bold text-gray-200">{link.label}</span>
                                </a>
                            ))}
                            {!profile.discord_link && !profile.twitter_link && !profile.twitch_link && profile.custom_links.length === 0 && (
                                <span className="text-xs text-gray-500 italic mt-2">No connections yet.</span>
                            )}
                        </div>
                    </div>
                );
            case 'mostPlayed':
                return (
                    <div className="h-full overflow-hidden flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-white">
                            <span className="text-amber-500">🏆</span> Most Played
                        </h3>
                        <div className="flex-1 min-h-0 space-y-2.5">
                            {stats?.top3?.map((g, i) => (
                                <div key={g.appid} className="group/game cursor-default">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-black w-5 flex-shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`}>#{i + 1}</span>
                                            <span className="text-[11px] font-bold text-gray-100 truncate max-w-[140px] group-hover/game:text-white transition-colors">{g.name}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500">{Math.round(g.pt / 60)}h</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(g.pt / (stats.top3[0]?.pt || 1)) * 100}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.1 }} className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : i === 1 ? 'bg-gray-400' : 'bg-amber-800'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'favorites':
                return (
                    <div className="h-full overflow-hidden flex flex-col">
                        <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">Pinned Shelf</h3>
                        <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
                            {profile.pinned_game_ids.length > 0 ? profile.pinned_game_ids.slice(0, 4).map(id => (
                                <div key={id} className="relative aspect-[2/3] group/item overflow-hidden rounded-xl border border-white/5 shadow-xl">
                                    <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${id}/library_600x900.jpg`} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-2">
                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">View Build</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-4 flex items-center justify-center p-4 border border-dashed border-white/10 rounded-2xl text-[10px] text-gray-600 font-black uppercase tracking-widest h-full">
                                    Shelf is empty
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'achievements':
                return <AchievementShowcase stats={stats} fullLibrary={fullLibrary} steamId={activeSteamId} minimal={true} />;
            case 'collections':
                return (
                    <div className="h-full flex flex-col group/col">
                        <h3 className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Featured Collection</span>
                            <span className="text-[9px] text-amber-500/40 group-hover/col:text-amber-500 transition-colors">Open →</span>
                        </h3>
                        {profile.featured_collection_id ? (
                            (() => {
                                const col = collections.find(c => c.id === profile.featured_collection_id);
                                if (!col) return <div className="text-[10px] text-gray-600 italic mt-2">Collection not found.</div>;
                                return (
                                    <div
                                        className="flex-1 flex flex-col gap-3 cursor-pointer group/card"
                                        onClick={() => handleOpenCollectionModal(col, !isOwner)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-white group-hover/card:text-amber-400 transition-colors uppercase tracking-tight">{col.title}</span>
                                            <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{col.game_ids?.length || 0} games</span>
                                        </div>
                                        <div className="flex -space-x-4 overflow-visible pt-2">
                                            {col.game_ids?.slice(0, 4).map((gid, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ y: -8, scale: 1.1, zIndex: 10 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    className="relative shadow-2xl"
                                                >
                                                    <img
                                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${typeof gid === 'object' ? gid.appid : gid}/capsule_184x69.jpg`}
                                                        className="w-24 h-10 object-cover rounded-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-zinc-900"
                                                    />
                                                </motion.div>
                                            ))}
                                            {col.game_ids?.length > 4 && (
                                                <div className="w-12 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400 flex-shrink-0 z-0 shadow-xl backdrop-blur-sm -ml-2">
                                                    +{col.game_ids.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-[10px] text-gray-600 font-bold uppercase tracking-widest h-full">
                                None selected
                            </div>
                        )}
                    </div>
                );
            case 'statRings':
                return <StatRings stats={stats} fullLibrary={fullLibrary} steamId={activeSteamId} minimal={true} />;
            case 'heatmap':
                return <ActivityHeatmap fullLibrary={fullLibrary} steamId={activeSteamId} minimal={true} />;
            case 'quickNav':
                return (
                    <div className="h-full flex flex-col justify-between">
                        <h3 className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">Quick Access</h3>
                        <div className="grid grid-cols-1 gap-2.5 flex-1">
                            <Link href="/" className="flex items-center justify-center p-3 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 rounded-xl text-[11px] font-black text-gray-300 hover:text-white transition-all uppercase tracking-widest">
                                ⚔️ Compare
                            </Link>
                            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="flex items-center justify-center p-3 bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 rounded-xl text-[11px] font-black text-gray-300 hover:text-white transition-all uppercase tracking-widest">
                                📚 Library
                            </button>
                        </div>
                    </div>
                );
            case 'customText':
                return <CustomTextWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customImage':
                return <CustomImageWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customEmbed':
                return <CustomEmbedWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customGif':
                return <CustomGifWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customMusic':
                return <CustomMusicWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customClock':
                return <CustomClockWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customCountdown':
                return <CustomCountdownWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            default:
                return null;
        }
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
            <div className="max-w-6xl mx-auto px-6 py-12 w-full">
                {/* Skeleton Header */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="skeleton w-32 h-32 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-4 w-full">
                            <div className="skeleton h-10 w-64 rounded-xl" />
                            <div className="flex gap-3">
                                <div className="skeleton h-6 w-36 rounded-full" />
                                <div className="skeleton h-6 w-20 rounded-full" />
                            </div>
                            <div className="skeleton h-5 w-full max-w-md rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Skeleton Bento Grid */}
                <div className="bento-grid mb-8">
                    <div className="glass-card p-8 col-span-12 md:col-span-3 h-40">
                        <div className="skeleton h-4 w-20 rounded mb-4" />
                        <div className="skeleton h-12 w-24 rounded-xl" />
                    </div>
                    <div className="glass-card p-8 col-span-12 md:col-span-3 h-40">
                        <div className="skeleton h-4 w-20 rounded mb-4" />
                        <div className="skeleton h-12 w-24 rounded-xl" />
                    </div>
                    <div className="glass-card p-8 col-span-12 md:col-span-6 h-40">
                        <div className="skeleton h-4 w-32 rounded mb-4" />
                        <div className="flex gap-3 mt-4">
                            <div className="skeleton h-8 w-24 rounded-lg" />
                            <div className="skeleton h-8 w-24 rounded-lg" />
                            <div className="skeleton h-8 w-24 rounded-lg" />
                        </div>
                    </div>
                    <div className="glass-card p-8 col-span-12 md:col-span-6 h-56">
                        <div className="skeleton h-4 w-28 rounded mb-6" />
                        <div className="space-y-5">
                            <div className="skeleton h-3 w-full rounded-full" />
                            <div className="skeleton h-3 w-4/5 rounded-full" />
                            <div className="skeleton h-3 w-3/5 rounded-full" />
                        </div>
                    </div>
                    <div className="glass-card p-8 col-span-12 md:col-span-6 h-56">
                        <div className="skeleton h-4 w-24 rounded mb-6" />
                        <div className="grid grid-cols-4 gap-3">
                            <div className="skeleton aspect-[2/3] rounded-lg" />
                            <div className="skeleton aspect-[2/3] rounded-lg" />
                            <div className="skeleton aspect-[2/3] rounded-lg" />
                            <div className="skeleton aspect-[2/3] rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Skeleton Collections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card overflow-hidden">
                            <div className="skeleton h-40 rounded-none" />
                            <div className="p-6 space-y-3">
                                <div className="skeleton h-6 w-3/4 rounded-lg" />
                                <div className="skeleton h-4 w-1/2 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
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

    // Premium tier color mapping
    const premiumColorClass = isPremium
        ? tier === 'Pro' ? 'blue' : tier === 'Hacker' ? 'purple' : 'gold'
        : null;
    const particleColor = premiumColorClass === 'blue' ? '#3b82f6' : premiumColorClass === 'purple' ? '#a855f7' : '#f59e0b';

    // Stagger container for entrance animation
    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.15 }
        }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    };

    const slideUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
    };

    const collectionStagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 }
        }
    };

    return (
        <div className={`min-h-screen relative w-full ${theme.font} ${theme.style || ""}`}>
            <div className="fixed inset-0 -z-30 transition-all duration-1000">
                {profile.custom_page_bg && (profile.custom_page_bg.startsWith('data:video') || profile.custom_page_bg.endsWith('.mp4') || profile.custom_page_bg.endsWith('.webm')) ? (
                    <video src={profile.custom_page_bg} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full" style={{ background: profile.custom_page_bg ? `url("${profile.custom_page_bg}") center/cover no-repeat fixed` : theme.bg }} />
                )}
            </div>

            {bannerEditorImage && (
                <BannerEditorModal
                    initialImage={bannerEditorImage}
                    onSave={(data) => { setProfile({ ...profile, custom_banner: JSON.stringify(data) }); setBannerEditorImage(null); }}
                    onCancel={() => setBannerEditorImage(null)}
                />
            )}

            {theme.overlay && <div className={`${theme.overlay} fixed -z-20`}></div>}
            {theme.scanlines && (
                <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]"
                    style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}></div>
            )}

            <motion.div
                className="max-w-[1400px] mx-auto px-4 pt-4 pb-6 w-full relative z-10 min-h-[calc(100vh-64px)] flex flex-col gap-2.5"
                variants={stagger}
                initial="hidden"
                animate="visible"
            >
                {/* ═══════════════════════════════════════
                    COMPACT HEADER — Avatar + Name + Actions (single row)
                    ═══════════════════════════════════════ */}
                <motion.header
                    variants={fadeUp}
                    ref={bannerRef}
                    className={`relative flex items-center gap-5 px-6 py-3 glass-card glow-border overflow-hidden flex-shrink-0 ${theme.cardStyle || ""} ${isPremium ? `premium-shimmer-border shimmer-${premiumColorClass}` : ''}`}
                >
                    {isPremium && (
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="premium-particle" style={{ backgroundColor: particleColor }} />
                            ))}
                        </div>
                    )}
                    {/* Parallax Banner BG */}
                    <motion.div className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit] parallax-banner" style={{ y: bannerY, scale: 1.15 }}>
                        {profile.custom_banner && (profile.custom_banner.startsWith('data:video') || profile.custom_banner.endsWith('.mp4') || profile.custom_banner.endsWith('.webm')) ? (
                            <video src={profile.custom_banner} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50" style={{ objectPosition: `center ${profile.custom_banner_pos}%` }} />
                        ) : (
                            (() => {
                                let bannerUrl = profile.custom_banner || "";
                                let bScale = 1, bX = 50, bY = profile.custom_banner_pos || 50, bStretch = false;
                                if (bannerUrl.startsWith('{')) { try { const p = JSON.parse(bannerUrl); bannerUrl = p.image; bScale = p.scale || 1; bX = p.x ?? 50; bY = p.y ?? 50; bStretch = p.stretch || false; } catch (e) { } }
                                return <div className="w-full h-full" style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none", backgroundColor: !bannerUrl ? "rgba(0,0,0,0.4)" : "transparent", backgroundSize: bStretch ? "100% 100%" : `${bScale * 100}%`, backgroundPosition: bStretch ? "center" : `${bX}% ${bY}%`, backgroundRepeat: "no-repeat", opacity: 0.5 }} />;
                            })()
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    </motion.div>

                    {/* Avatar */}
                    <motion.div className="relative group flex-shrink-0" variants={scaleIn} whileHover={{ scale: 1.05 }}>
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img src={activeUserAvatar} alt="" className="relative w-14 h-14 rounded-full ring-2 ring-white/10 shadow-xl object-cover" />
                    </motion.div>

                    {/* Name + Badges */}
                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-baseline gap-2">
                            <h1 className={`text-2xl font-black tracking-tight truncate ${isPremium ? `premium-username-glow premium-glow-${premiumColorClass}` : 'text-white'}`}>{activeUserName}</h1>
                            {profile.gamer_title && <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.accent} opacity-80 hidden md:inline`}>— {profile.gamer_title}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-blue-200/60 bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-500/10">{activeSteamId}</span>
                            {isPremium ? (
                                <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">{tier}</span>
                            ) : (
                                <span className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest">Free</span>
                            )}
                        </div>
                    </div>

                    {/* Bio (non-edit mode, truncated) */}
                    {!(isEditing && isOwner) && profile.bio && (
                        <p className="text-gray-400 text-xs max-w-xs truncate hidden lg:block">{profile.bio}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0 relative z-10">
                        {isOwner && (
                            <>
                                <motion.button onClick={() => setIsCustomizing(!isCustomizing)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all backdrop-blur-sm ${isCustomizing ? 'bg-amber-600 border-amber-500 text-white' : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-400'}`} whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.03 }}>
                                    {isCustomizing ? "Done Customizing" : "Customize"}
                                </motion.button>

                                {isCustomizing && (
                                    <>
                                        <motion.button onClick={() => setShowWidgetPicker(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20" whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.05 }}>
                                            + Add Widget
                                        </motion.button>
                                        <motion.button onClick={() => { if (confirm("Reset layout to default?")) setDashboardLayout(DEFAULT_LAYOUT); }} className="px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:border-red-500/30 text-gray-400 backdrop-blur-sm" whileTap={{ scale: 0.93 }}>
                                            Reset
                                        </motion.button>
                                        <motion.button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20" whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.05 }}>
                                            Save Layout
                                        </motion.button>
                                    </>
                                )}

                                {!isCustomizing && (
                                    <>
                                        <motion.button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:border-white/20 text-gray-400 backdrop-blur-sm" whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.03 }}>
                                            {isEditing ? "Cancel" : "Edit"}
                                        </motion.button>
                                        {isEditing && (
                                            <motion.button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20" whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.05 }}>
                                                Save
                                            </motion.button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {!isEditing && !isCustomizing && (
                            <motion.button onClick={handleShareProfile} className="px-4 py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:border-emerald-500/30 text-gray-400 backdrop-blur-sm" whileTap={{ scale: 0.93 }}>
                                {shareProfileText}
                            </motion.button>
                        )}
                    </div>
                </motion.header>

                {/* ═══════════════════════════════════════
                    EDIT MODE PANEL (slides open when editing)
                    ═══════════════════════════════════════ */}
                <AnimatePresence>
                    {isEditing && isOwner && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="glass-card overflow-hidden flex-shrink-0"
                        >
                            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Bio</label>
                                    <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Your bio..." className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-2 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 h-16 resize-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Gamer Title</label>
                                    <input type="text" value={profile.gamer_title} onChange={(e) => setProfile({ ...profile, gamer_title: e.target.value })} placeholder="e.g. Backlog Slayer" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Theme</label>
                                    <select value={profile.profile_theme_preset} onChange={(e) => setProfile({ ...profile, profile_theme_preset: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer">
                                        {Object.entries(THEMES).map(([id, t]) => <option key={id} value={id} className="bg-[#1a1a1d]">{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Banner</label>
                                    <input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => { const f = e.target.files[0]; if (f) { if (f.size > 50 * 1024 * 1024) { alert("Max 50MB"); return; } const r = new FileReader(); r.onloadend = () => f.type.startsWith('video/') ? setProfile({ ...profile, custom_banner: r.result }) : setBannerEditorImage(r.result); r.readAsDataURL(f); } }} className="text-[9px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-blue-600 file:text-white cursor-pointer w-full" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Page BG</label>
                                    <input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => { const f = e.target.files[0]; if (f) { if (f.size > 50 * 1024 * 1024) { alert("Max 50MB"); return; } const r = new FileReader(); r.onloadend = () => setProfile({ ...profile, custom_page_bg: r.result }); r.readAsDataURL(f); } }} className="text-[9px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-purple-600 file:text-white cursor-pointer w-full" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Featured Collection</label>
                                    <select value={profile.featured_collection_id} onChange={(e) => setProfile({ ...profile, featured_collection_id: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer">
                                        <option value="" className="bg-[#1a1a1d]">None</option>
                                        {collections.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a1d]">{c.title}</option>)}
                                    </select>
                                </div>
                                {/* Socials row */}
                                <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                                    <div><label className="text-[9px] text-gray-500 font-bold block mb-1">DISCORD</label><input value={profile.discord_link} onChange={e => setProfile({ ...profile, discord_link: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none" placeholder="username" /></div>
                                    <div><label className="text-[9px] text-gray-500 font-bold block mb-1">TWITTER</label><input value={profile.twitter_link} onChange={e => setProfile({ ...profile, twitter_link: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none" placeholder="URL" /></div>
                                    <div><label className="text-[9px] text-gray-500 font-bold block mb-1">TWITCH</label><input value={profile.twitch_link} onChange={e => setProfile({ ...profile, twitch_link: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded p-1.5 text-xs text-white focus:outline-none" placeholder="URL" /></div>
                                </div>
                                {profile.custom_banner && (
                                    <div className="col-span-2 md:col-span-4 flex gap-3">
                                        <button onClick={() => setProfile({ ...profile, custom_banner: "" })} className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest">Remove Banner</button>
                                        {!profile.custom_banner.startsWith('data:video') && !profile.custom_banner.endsWith('.mp4') && <button onClick={() => { let img = profile.custom_banner; if (img.startsWith('{')) { try { img = JSON.parse(img).image; } catch (e) { } } setBannerEditorImage(img); }} className="text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">Adjust Banner</button>}
                                        {profile.custom_page_bg && <button onClick={() => setProfile({ ...profile, custom_page_bg: "" })} className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest">Remove BG</button>}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════
                    UNIFIED BENTO GRID — Everything in one view
                    ═══════════════════════════════════════
                    Layout (12 cols):
                    Row 1: [Playtime 2] [Library 2] [Socials 4] [Most Played 4]
                    Row 2: [Favorites 4] [Achievements 4] [Collections 4]
                    Row 3: [StatRings 4] [Heatmap 4] [Quick Nav 4]
                    ═══════════════════════════════════════ */}
                {dashboardLayout && (
                    <ResponsiveGridLayout
                        className="layout flex-1"
                        layouts={{ lg: dashboardLayout, md: dashboardLayout, sm: dashboardLayout }}
                        breakpoints={{ lg: 1200, md: 768, sm: 480 }}
                        cols={{ lg: 12, md: 8, sm: 4 }}
                        rowHeight={180}
                        isDraggable={isCustomizing && isOwner}
                        isResizable={isCustomizing && isOwner}
                        draggableHandle=".drag-handle"
                        onLayoutChange={(layout) => setDashboardLayout(layout)}
                        margin={[16, 16]}
                    >
                        {dashboardLayout.map(item => (
                            <div key={item.i}>
                                <WidgetWrapper
                                    widgetId={item.i}
                                    isCustomizing={isCustomizing}
                                    onRemove={() => handleRemoveWidget(item.i)}
                                >
                                    {renderWidget(item.i)}
                                </WidgetWrapper>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}

                {showWidgetPicker && (
                    <WidgetPicker
                        isOpen={showWidgetPicker}
                        onClose={() => setShowWidgetPicker(false)}
                        onAdd={handleAddWidget}
                        currentLayout={dashboardLayout}
                    />
                )}

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
            </motion.div>
        </div>
    );
}
