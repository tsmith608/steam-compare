"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CollectionModal from './CollectionModal';
import BannerEditorModal from './BannerEditorModal';
import AchievementShowcase from './AchievementShowcase';
import StatRings from './StatRings';
import ActivityHeatmap from './ActivityHeatmap';
import SocialsWidget from './widgets/SocialsWidget';
import GamePickerModal from './GamePickerModal';
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
import CustomInventoryWidget from './widgets/CustomInventoryWidget';
import CustomDiscordWidget from './widgets/CustomDiscordWidget';
import { DEFAULT_LAYOUT, WIDGET_REGISTRY, generateWidgetId, getWidgetType } from './widgets/widgetRegistry';

const THEMES = {
    default: {
        name: "Modern Stealth",
        bg: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%)",
        accent: "text-blue-400",
        border: "border-white/5",
        cardBg: "bg-[#0e0e10]",
        font: "font-sans",
        vibeId: "none"
    },
    cyber_overdrive: {
        name: "Cyber Overdrive",
        bg: "radial-gradient(circle at 50% 50%, #1a0b2e, #050505)",
        accent: "text-pink-500",
        border: "border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]",
        cardBg: "bg-black/95 backdrop-blur-xl",
        font: "font-mono font-bold uppercase",
        vibeId: "matrix",
        cardStyle: "rounded-none border-t-[4px] border-l-[4px] border-pink-500",
        scanlines: true
    },
    abyssal_deep: {
        name: "Abyssal Biolum",
        bg: "linear-gradient(180deg, #001021 0%, #000408 100%)",
        accent: "text-teal-400",
        border: "border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]",
        cardBg: "bg-[#001021]/80 backdrop-blur-2xl",
        font: "font-sans font-medium",
        vibeId: "bubbles",
        cardStyle: "rounded-[2rem] border-b-[2px] border-teal-500/50"
    },
    royal_prestige: {
        name: "Royal Gold",
        bg: "radial-gradient(circle at center, #1c1917, #0c0a09)",
        accent: "text-amber-500",
        border: "border-amber-600/40 shadow-[0_10px_40px_rgba(245,158,11,0.1)]",
        cardBg: "bg-stone-900",
        font: "font-serif",
        vibeId: "sparkles",
        cardStyle: "rounded-sm border-double border-[3px] border-amber-600/50"
    },
    lava_hell: {
        name: "Infernal Wrath",
        bg: "radial-gradient(circle at top, #450a0a, #000000)",
        accent: "text-red-600",
        border: "border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.2)]",
        cardBg: "bg-zinc-950/95",
        font: "font-black tracking-tight",
        vibeId: "embers",
        cardStyle: "rounded-md border-r-[5px] border-red-700"
    },
    nebula_dream: {
        name: "Nebula Voyage",
        bg: "radial-gradient(circle at 80% 20%, #2e1065, #000000)",
        accent: "text-purple-400",
        border: "border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)]",
        cardBg: "bg-slate-950/70 backdrop-blur-3xl",
        font: "font-sans font-black",
        vibeId: "stars",
        cardStyle: "rounded-3xl border-white/5",
        overlay: "bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)] w-full h-full"
    },
    samurai_zen: {
        name: "Zen Sakura",
        bg: "linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)",
        accent: "text-rose-500",
        border: "border-rose-200 shadow-sm",
        cardBg: "bg-white/95 backdrop-blur-md",
        font: "font-sans font-medium",
        vibeId: "sakura",
        cardStyle: "rounded-none border-l-[2px] border-rose-300",
        themeMode: "light"
    },
    arctic_frost: {
        name: "Arctic Frost",
        bg: "radial-gradient(circle at top, #f0f9ff, #cbd5e1)",
        accent: "text-blue-600",
        border: "border-blue-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]",
        cardBg: "bg-white/40 backdrop-blur-xl",
        font: "font-sans tracking-tighter",
        vibeId: "frost",
        cardStyle: "rounded-2xl border-[1px] border-white/60 shadow-inner",
        themeMode: "light"
    },
    steampunk_rev_v1: {
        name: "Brass & Steam",
        bg: "radial-gradient(circle at 50% 50%, #442b1a, #1a0f08)",
        accent: "text-orange-400",
        border: "border-orange-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]",
        cardBg: "bg-[#2d1b0e]/95",
        font: "font-serif font-black uppercase",
        vibeId: "steam",
        cardStyle: "rounded-none border-[4px] border-orange-950 p-[2px] outline outline-1 outline-orange-800",
        scanlines: true
    },
    minimal_prism: {
        name: "Void Prism",
        bg: "#000000",
        accent: "text-white",
        border: "border-white/10",
        cardBg: "bg-black/20 backdrop-blur-[40px]",
        font: "font-sans font-thin tracking-[0.2em]",
        vibeId: "iridescent",
        cardStyle: "rounded-full border-[0.5px] border-white/5"
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
/* ─── Global Vibe Layer ─── */
function VibeLayer({ theme }) {
    if (!theme || !theme.vibeId || theme.vibeId === 'none') return null;

    const { vibeId } = theme;

    switch (vibeId) {
        case 'matrix':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-30">
                    <div className="matrix-rain h-full w-full" />
                </div>
            );
        case 'embers':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="embers-container h-full w-full" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-900/40 to-transparent" />
                </div>
            );
        case 'stars':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="stars-container h-full w-full" />
                </div>
            );
        case 'bubbles':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="bubbles-container h-full w-full" />
                </div>
            );
        case 'sakura':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="sakura-container h-full w-full" />
                </div>
            );
        case 'frost':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="frost-overlay h-full w-full opacity-40 mix-blend-overlay" />
                    <div className="snow-container h-full w-full" />
                </div>
            );
        case 'steam':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-20">
                    <div className="steam-container h-full w-full" />
                </div>
            );
        case 'sparkles':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="sparkles-container h-full w-full" />
                </div>
            );
        case 'iridescent':
            return (
                <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
                    <div className="iridescent-bg h-full w-full opacity-20" />
                </div>
            );
        default:
            return null;
    }
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
    const [showPinModal, setShowPinModal] = useState(false);

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

                    // Re-fetch profile & premium if we didn't get them by vanity name initially
                    if (!profData.found && p.steamid) {
                        const profRes2 = await fetch(`/api/user/profile?steamid=${p.steamid}`);
                        const profData2 = await profRes2.json();
                        if (profData2.found) {
                            setProfile(profData2.profile);
                        }
                    }

                    // Re-fetch premium if we used a vanity or didn't find premium status
                    if (p.steamid && (p.steamid !== activeSteamId || !premData.isPremium)) {
                        console.log("[Dashboard] Re-checking premium with numeric ID:", p.steamid);
                        const premRes2 = await fetch(`/api/user/premium?steamid=${p.steamid}`);
                        const premData2 = await premRes2.json();
                        if (premData2.isPremium) {
                            setIsPremium(true);
                            setTier(premData2.tier || 'Noob');
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
                        topGames: sorted.slice(0, 10)
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

    const handleResizeWidget = (id, sizePreset) => {
        const type = getWidgetType(id);
        const meta = WIDGET_REGISTRY[type];
        if (!meta || !meta.presets || !meta.presets[sizePreset]) return;

        const { w, h } = meta.presets[sizePreset];

        setDashboardLayout(prev => (prev || []).map(wgt => {
            if (wgt.i === id) {
                return { ...wgt, w, h };
            }
            return wgt;
        }));
    };

    const handleSavePins = async (newIds) => {
        setProfile(prev => ({ ...prev, pinned_game_ids: newIds }));
        setShowPinModal(false);
        // Trigger a background save
        setTimeout(() => handleSaveProfile(), 100);
    };

    const renderWidget = (item) => {
        const id = item.i;
        const h = item.h;
        const type = id.includes('-') ? id.split('-')[0] : id;

        switch (type) {
            case 'playtime':
                return (
                    <div className="flex flex-col items-center justify-center text-center group h-full">
                        <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-300 transition-colors">Playtime</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white tracking-tighter leading-none"><Counter value={stats?.totalHours || 0} /></span>
                            <span className="text-sm text-white-500 font-bold">h</span>
                        </div>
                        <p className="text-[9px] text-white/40 mt-3 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5 group-hover:bg-white/10 transition-colors">{stats?.days || 0} days of life</p>
                    </div>
                );
            case 'library':
                return (
                    <div className="flex flex-col items-center justify-center text-center group h-full">
                        <h3 className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-purple-300 transition-colors">Library</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white tracking-tighter leading-none"><Counter value={stats?.totalGames || 0} /></span>
                        </div>
                        <p className="text-[9px] text-white/40 mt-3 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5 group-hover:bg-white/10 transition-colors">Games Owned</p>
                    </div>
                );
            case 'socials':
                return (
                    <SocialsWidget
                        profile={profile}
                        isCustomizing={isCustomizing}
                        setProfile={setProfile}
                        theme={theme}
                    />
                );
            case 'mostPlayed':
                return (
                    <div className="h-full overflow-hidden flex flex-col justify-center">
                        <div className="flex flex-col items-center justify-center mb-3">
                            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <span>🏆</span> Most Played
                            </h3>
                            <span className="text-[8px] font-bold text-amber-500/40 uppercase tracking-tighter mt-0.5">
                                Lifetime hours
                            </span>
                        </div>
                        <div className="flex flex-col space-y-2 flex-1 justify-center max-w-[280px] mx-auto w-full">
                            {stats?.topGames?.slice(0, Math.min(10, h * 2)).map((g, i) => (
                                <div key={g.appid} className="group/game cursor-default w-full">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`text-[10px] font-black w-4 flex-shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`}>#{i + 1}</span>
                                        <img
                                            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`}
                                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-lg border border-white/5"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-gray-100 truncate mr-1 group-hover:text-white transition-colors uppercase tracking-tight font-sans">{g.name}</span>
                                                <span className="text-[9px] font-mono text-gray-500 font-bold">{Math.round(g.pt / 60)}h</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(g.pt / (stats.topGames[0]?.pt || 1)) * 100}%` }}
                                                    transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-800'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'favorites':
                return (
                    <div className="h-full overflow-hidden flex flex-col justify-center relative group/shelf">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-widest text-center flex-1 ml-6">Pinned Shelf</h3>
                            {isOwner && (
                                <button
                                    onClick={() => setShowPinModal(true)}
                                    className="p-1 px-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-[8px] font-black uppercase tracking-widest transition-all opacity-0 group-hover/shelf:opacity-100 border border-white/5"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        <div className="flex-1 min-h-0">
                            {profile.pinned_game_ids.length > 0 ? (
                                <div className="grid grid-cols-4 items-center gap-2 h-full py-1">
                                    {profile.pinned_game_ids.slice(0, h >= 4 ? 8 : 4).map(id => (
                                        <div key={id} className="relative aspect-[2/3] w-full group/item overflow-hidden rounded-xl border border-white/10 shadow-xl bg-zinc-900 mx-auto">
                                            <img
                                                src={`https://cdn.akamai.steamstatic.com/steam/apps/${id}/library_600x900.jpg`}
                                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-3 border border-dashed border-white/10 rounded-xl text-[9px] text-gray-600 font-black uppercase tracking-widest h-full">
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
                        <h3 className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span>Featured Collection</span>
                                {isOwner && (
                                    <button
                                        onClick={() => handleOpenCollectionModal()}
                                        className="w-4 h-4 flex items-center justify-center rounded-full bg-white/10 hover:bg-amber-500 text-white text-[10px] transition-all"
                                        title="New Collection"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            <span
                                onClick={() => collections.length > 0 && handleOpenCollectionModal(collections[0], !isOwner)}
                                className="text-[8px] text-amber-500/40 group-hover/col:text-amber-500 transition-colors uppercase cursor-pointer"
                            >
                                All →
                            </span>
                        </h3>
                        {profile.featured_collection_id ? (
                            (() => {
                                const col = collections.find(c => c.id === profile.featured_collection_id);
                                if (!col) return <div className="text-[10px] text-gray-600 italic">Not found.</div>;
                                return (
                                    <div
                                        className="flex-1 flex flex-col gap-3 cursor-pointer group/card justify-center"
                                        onClick={() => handleOpenCollectionModal(col, !isOwner)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black text-white group-hover/card:text-amber-400 transition-colors uppercase tracking-tight font-sans">{col.title}</span>
                                            <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{col.game_ids?.length || 0}</span>
                                        </div>
                                        <div className="flex -space-x-4 overflow-visible px-1 justify-center">
                                            {col.game_ids?.slice(0, 4).map((gid, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ y: -6, scale: 1.1, zIndex: 10 }}
                                                    className="relative shadow-xl"
                                                >
                                                    <img
                                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${typeof gid === 'object' ? gid.appid : gid}/capsule_184x69.jpg`}
                                                        className="w-20 h-9 object-cover rounded-md border border-white/10 shadow-lg bg-zinc-900"
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl h-full group/empty relative">
                                {isOwner ? (
                                    <button
                                        onClick={() => handleOpenCollectionModal()}
                                        className="flex flex-col items-center gap-1.5 text-[9px] text-gray-500 group-hover/empty:text-amber-500 font-black uppercase tracking-widest transition-all"
                                    >
                                        <span className="text-xl group-hover/empty:scale-110 transition-transform">➕</span>
                                        Create Collection
                                    </button>
                                ) : (
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic">None selected</span>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'statRings':
                return <StatRings stats={stats} fullLibrary={fullLibrary} steamId={activeSteamId} minimal={true} />;
            case 'heatmap':
                return <ActivityHeatmap fullLibrary={fullLibrary} steamId={activeSteamId} minimal={true} height={h} />;
            case 'quickNav':
                return (
                    <div className="h-full flex flex-col justify-center">
                        <h3 className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-3 text-center">Quick Access</h3>
                        <div className="grid grid-cols-2 gap-2.5 flex-1 items-center">
                            <Link href="/" className="flex flex-col items-center justify-center p-3.5 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 rounded-xl text-[9px] font-black text-gray-300 hover:text-white transition-all uppercase tracking-widest group/btn h-[75px]">
                                <span className="text-xl mb-1.5 group-hover/btn:scale-110 transition-transform">⚔️</span>
                                Compare
                            </Link>
                            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="flex flex-col items-center justify-center p-3.5 bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 rounded-xl text-[9px] font-black text-gray-300 hover:text-white transition-all uppercase tracking-widest group/btn h-[75px]">
                                <span className="text-xl mb-1.5 group-hover/btn:scale-110 transition-transform">📚</span>
                                Library
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
            case 'customInventory':
                return <CustomInventoryWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
            case 'customDiscord':
                return <CustomDiscordWidget config={widgetConfigs[id]} isEditing={isCustomizing} onConfigChange={(newCfg) => setWidgetConfigs(prev => ({ ...prev, [id]: newCfg }))} />;
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

    // Theme resolution
    const theme = THEMES[profile.profile_theme_preset] || THEMES.default;

    return (
        <div className={`min-h-screen relative w-full ${theme.font} ${theme.style || ""} ${theme.themeMode === 'light' ? 'light-mode' : ''}`}>
            <VibeLayer theme={theme} />
            {/* ─── BACKGROUND LAYERS (z-0 to z-5) ─── */}
            <div className="fixed inset-0 z-0 transition-all duration-1000 overflow-hidden pointer-events-none">
                {/* 1. Base Theme Gradient */}
                <div className="absolute inset-0 w-full h-full" style={{ background: theme.bg }} />

                {/* 2. Custom Page Background (Layered over theme base) */}
                {profile.custom_page_bg && (
                    <div className="absolute inset-0 w-full h-full">
                        {(profile.custom_page_bg.startsWith('data:video') || profile.custom_page_bg.endsWith('.mp4') || profile.custom_page_bg.endsWith('.webm')) ? (
                            <video src={profile.custom_page_bg} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full" style={{
                                backgroundImage: `url("${profile.custom_page_bg}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }} />
                        )}
                    </div>
                )}
            </div>

            {bannerEditorImage && (
                <BannerEditorModal
                    initialImage={bannerEditorImage}
                    onSave={(data) => { setProfile({ ...profile, custom_banner: JSON.stringify(data) }); setBannerEditorImage(null); }}
                    onCancel={() => setBannerEditorImage(null)}
                />
            )}

            {/* 3. Theme Overlay (z-1) */}
            {theme.overlay && <div className={`${theme.overlay} fixed inset-0 z-[2] pointer-events-none`}></div>}

            {/* 4. Theme Scanlines (z-2) */}
            {theme.scanlines && (
                <div className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03]"
                    style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}></div>
            )}

            <motion.div
                className="max-w-[1400px] mx-auto px-4 pt-4 pb-12 w-full relative z-10 flex flex-col gap-5"
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
                        className="layout"
                        layouts={{ lg: dashboardLayout, md: dashboardLayout, sm: dashboardLayout }}
                        breakpoints={{ lg: 1200, md: 768, sm: 480 }}
                        cols={{ lg: 12, md: 8, sm: 4 }}
                        rowHeight={110}
                        isDraggable={isCustomizing && isOwner}
                        isResizable={isCustomizing && isOwner}
                        draggableHandle=".drag-handle"
                        onLayoutChange={(layout) => setDashboardLayout(layout)}
                        margin={[16, 16]}
                    >
                        {dashboardLayout.map(item => {
                            const type = getWidgetType(item.i);
                            const meta = WIDGET_REGISTRY[type];
                            const isFullBleed = ['customMusic', 'customImage', 'customGif', 'customEmbed'].includes(type);
                            const isCompact = ['favorites', 'achievements'].includes(type);

                            // Determine current size preset based on dimensions
                            let currentSizeBadge = 'M';
                            if (meta?.presets) {
                                if (item.w === meta.presets.S?.w && item.h === meta.presets.S?.h) currentSizeBadge = 'S';
                                else if (item.w === meta.presets.L?.w && item.h === meta.presets.L?.h) currentSizeBadge = 'L';
                            }

                            return (
                                <div key={item.i}>
                                    <WidgetWrapper
                                        widgetId={item.i}
                                        isCustomizing={isCustomizing}
                                        onRemove={() => handleRemoveWidget(item.i)}
                                        onSizeChange={(sz) => handleResizeWidget(item.i, sz)}
                                        currentSize={currentSizeBadge}
                                        noPadding={isFullBleed}
                                        compact={isCompact}
                                    >
                                        {renderWidget(item)}
                                    </WidgetWrapper>
                                </div>
                            );
                        })}
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

                {showPinModal && (
                    <GamePickerModal
                        isOpen={showPinModal}
                        onClose={() => setShowPinModal(false)}
                        fullLibrary={fullLibrary}
                        initialSelected={profile.pinned_game_ids}
                        onSave={handleSavePins}
                    />
                )}
            </motion.div>
        </div>
    );
}
