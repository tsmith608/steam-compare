"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DashboardContent() {
    const searchParams = useSearchParams();
    const steamId = searchParams.get("steamid");
    const userName = searchParams.get("name");
    const userAvatar = searchParams.get("avatar");

    const [isPremium, setIsPremium] = useState(null);
    const [tier, setTier] = useState('Noob');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        discord_link: "",
        twitter_link: "",
        twitch_link: "",
        youtube_link: "",
        bio: "",
        pinned_game_ids: []
    });

    // Library for selection
    const [fullLibrary, setFullLibrary] = useState([]);

    // State for local auth fallback
    const [localAuth, setLocalAuth] = useState({ id: steamId, name: userName, avatar: userAvatar });

    useEffect(() => {
        // If we have URL params, trust them and sync local state
        if (steamId) {
            setLocalAuth({ id: steamId, name: userName, avatar: userAvatar });
            return; // Main Init handles the rest
        }

        // If NO URL params, check session
        const sId = sessionStorage.getItem("wb.steamid");
        const sName = sessionStorage.getItem("wb.username");
        const sAvatar = sessionStorage.getItem("wb.avatar");

        if (sId) {
            setLocalAuth({ id: sId, name: sName, avatar: sAvatar });
        } else {
            // Truly not logged in
            setLoading(false);
        }
    }, [steamId, userName, userAvatar]);

    // Use localAuth overrides for logic
    const activeSteamId = steamId || localAuth.id;
    const activeUserName = userName || localAuth.name;
    const activeUserAvatar = userAvatar || localAuth.avatar;

    useEffect(() => {
        if (!activeSteamId) {
            // If we checked session and still found nothing, loading is set to false in the other effect
            return;
        }

        async function init() {
            setLoading(true); // Ensure loading is true when we start this
            try {
                // 1. Check Premium
                const premRes = await fetch(`/api/user/premium?steamid=${activeSteamId}`);
                const premData = await premRes.json();
                setIsPremium(premData.isPremium);
                setTier(premData.tier || 'Noob');

                // 2. Fetch Profile
                const profRes = await fetch(`/api/user/profile?steamid=${activeSteamId}`);
                const profData = await profRes.json();
                if (profData.found) {
                    setProfile(profData.profile);
                }

                // 3. Fetch Library (for stats and pins)
                const compareRes = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ users: [activeSteamId, activeSteamId] })
                });

                if (!compareRes.ok) throw new Error("Failed to fetch library data");
                const data = await compareRes.json();

                let library = data.shared || [];
                if (library.length === 0 && data.unique && data.unique[activeSteamId]) {
                    library = data.unique[activeSteamId];
                }

                setFullLibrary(library);

                if (library.length > 0) {
                    const totalGames = library.length;
                    let totalMinutes = 0;
                    const sorted = library.map(g => {
                        const pt = g.playtimes ? g.playtimes[activeSteamId] : g.playtime_forever;
                        totalMinutes += pt;
                        return { name: g.name, pt, appid: g.appid };
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
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        init();
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
                    pinnedGameIds: profile.pinned_game_ids
                })
            });
            if (res.ok) {
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleShareProfile = () => {
        const url = `${window.location.origin}/profile/${activeSteamId}`;
        navigator.clipboard.writeText(url);
        alert("Profile link copied to clipboard!");
    };

    const [pinSearch, setPinSearch] = useState("");
    const filteredForPins = fullLibrary.filter(g =>
        g.name.toLowerCase().includes(pinSearch.toLowerCase())
    );

    // Collections Management
    const [collections, setCollections] = useState([]);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [collectionTitle, setCollectionTitle] = useState("");
    const [collectionDesc, setCollectionDesc] = useState("");
    const [collectionGames, setCollectionGames] = useState([]);
    const [collSearch, setCollSearch] = useState("");

    const fetchCollections = async () => {
        if (!activeSteamId) return;
        const res = await fetch(`/api/user/collections?steamid=${activeSteamId}`);
        const data = await res.json();
        setCollections(data.collections || []);
    };

    useEffect(() => {
        fetchCollections();
    }, [activeSteamId]);

    const handleOpenCollectionModal = (col = null) => {
        if (col) {
            setEditingCollection(col.id);
            setCollectionTitle(col.title);
            setCollectionDesc(col.description);
            setCollectionGames(col.game_ids || []);
        } else {
            setEditingCollection(null);
            setCollectionTitle("");
            setCollectionDesc("");
            setCollectionGames([]);
        }
        setShowCollectionModal(true);
    };

    const handleSaveCollection = async () => {
        if (!collectionTitle) return alert("Title is required");

        try {
            const res = await fetch('/api/user/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCollection,
                    steamId: activeSteamId,
                    title: collectionTitle,
                    description: collectionDesc,
                    gameIds: collectionGames,
                    isPublic: true
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

    if (!activeSteamId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <p className="text-gray-400 mb-8 max-w-md">Please sign in with Steam to view your personal dashboard and premium features.</p>
                <Link href="/" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">Go Home to Sign In</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading your gamer resume...</p>
            </div>
        );
    }

    const pinnedGames = fullLibrary.filter(g => profile.pinned_game_ids.includes(g.appid));

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 w-full">
            {/* 1. Header & Quick Actions */}
            <header className="flex flex-col md:flex-row items-center gap-8 mb-16 bg-gradient-to-r from-blue-900/10 to-purple-900/10 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm">
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img src={activeUserAvatar} alt="" className="relative w-32 h-32 rounded-full ring-4 ring-white/10 hover:ring-blue-500/50 transition-all shadow-2xl object-cover" />
                </div>

                <div className="text-center md:text-left flex-1">
                    <h1 className="text-5xl font-black text-white mb-3 tracking-tight drop-shadow-lg">{activeUserName}</h1>
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

                    {/* Bio Display/Edit */}
                    {!isEditing ? (
                        <p className="text-gray-300 max-w-2xl text-lg leading-relaxed font-light">{profile.bio || "No bio yet."}</p>
                    ) : (
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Tell the world about your gaming journey..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all"
                        />
                    )}
                </div>

                <div className="flex flex-col gap-3 min-w-[140px]">
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
                    {!isEditing && (
                        <button
                            onClick={handleShareProfile}
                            className="px-6 py-3 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-emerald-500/30 text-gray-400"
                        >
                            Share Profile
                        </button>
                    )}
                </div>
            </header>

            {/* 2. Gamer Resume (Stats) */}
            <section className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-widest">Gamer Resume</h2>
                    <div className="h-px bg-gradient-to-r from-white/10 to-transparent flex-1"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Key Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#0e0e10] bg-gradient-to-b from-white/5 to-transparent p-6 rounded-2xl border border-white/5 flex flex-col justify-center h-full hover:border-white/10 transition-colors group">
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-blue-300">Total Playtime</p>
                            <p className="text-5xl font-black text-white mb-1 tracking-tighter">{stats?.totalHours || 0}<span className="text-xl text-gray-600 font-normal ml-1">h</span></p>
                            <p className="text-xs text-gray-500">{stats?.days || 0} days of your life</p>
                        </div>
                        <div className="bg-[#0e0e10] bg-gradient-to-b from-white/5 to-transparent p-6 rounded-2xl border border-white/5 flex flex-col justify-center h-full hover:border-white/10 transition-colors group">
                            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-purple-300">Library Size</p>
                            <p className="text-5xl font-black text-white mb-1 tracking-tighter">{stats?.totalGames || 0}</p>
                            <p className="text-xs text-gray-500">Games Owned</p>
                        </div>
                    </div>

                    {/* Top Games Graph */}
                    <div className="lg:col-span-3 bg-[#0e0e10] bg-gradient-to-br from-white/5 to-transparent p-8 rounded-2xl border border-white/5">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Most Played Titles</p>
                        <div className="space-y-6">
                            {stats?.top3?.map((g, i) => (
                                <div key={g.appid} className="relative group">
                                    <div className="flex items-center justify-between mb-2 z-10 relative">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-2xl font-black w-8 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`}>0{i + 1}</span>
                                            <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`} className="w-8 h-8 rounded object-cover grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100" />
                                            <span className="text-base font-bold text-gray-300 group-hover:text-white transition-colors">{g.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">{Math.round(g.pt / 60)}h</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : i === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                                            style={{ width: `${(g.pt / stats.top3[0].pt) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                {/* 3. Pinned Favorites (Letterboxd Style) */}
                <section className="lg:col-span-8">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Pinned Favorites <span className="text-gray-600 text-sm ml-2">({profile.pinned_game_ids.length}/4)</span></h2>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    {isEditing && (
                        <div className="mb-8 relative z-50">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search library to pin..."
                                    value={pinSearch}
                                    onChange={(e) => setPinSearch(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-xl"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
                            </div>

                            {pinSearch && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-y-auto custom-scrollbar max-h-[300px]">
                                    {filteredForPins.slice(0, 20).map(g => (
                                        <button
                                            key={g.appid}
                                            disabled={profile.pinned_game_ids.includes(g.appid) || profile.pinned_game_ids.length >= 4}
                                            onClick={() => {
                                                setProfile({ ...profile, pinned_game_ids: [...profile.pinned_game_ids, g.appid] });
                                                setPinSearch("");
                                            }}
                                            className="w-full text-left p-3 hover:bg-white/5 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-b border-white/5 last:border-0"
                                        >
                                            <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`} className="w-10 rounded shadow" alt="" />
                                            <span className="text-sm font-bold text-gray-300">{g.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-4">
                        {profile.pinned_game_ids.map(appid => {
                            const game = fullLibrary.find(g => g.appid === appid) || { name: 'Unknown', appid };
                            return (
                                <div key={appid} className="group relative aspect-[2/3] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/5 transition-all hover:-translate-y-2 hover:shadow-blue-900/20 hover:border-white/20">
                                    <img
                                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        alt={game.name}
                                        onError={(e) => {
                                            // Fallback to header.jpg but centered/covered
                                            e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
                                            e.target.className = "w-full h-full object-cover opacity-80 scale-150"; // Zoom in to fill
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>

                                    {isEditing && (
                                        <button
                                            onClick={() => setProfile({ ...profile, pinned_game_ids: profile.pinned_game_ids.filter(id => id !== appid) })}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 backdrop-blur-md rounded-full text-white flex items-center justify-center text-sm font-bold shadow-lg transition-all border border-white/10"
                                        >
                                            ✕
                                        </button>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-xs font-bold text-white text-center drop-shadow-md">{game.name}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty Slots */}
                        {Array.from({ length: 4 - profile.pinned_game_ids.length }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:border-white/20 transition-all cursor-default">
                                <span className="text-3xl font-black">+</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Empty</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Socials (Colorful Sidebar) */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Connect</h2>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="bg-[#0e0e10] rounded-2xl border border-white/5 p-2 space-y-2">
                        {isEditing ? (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Discord</label>
                                    <input value={profile.discord_link} onChange={e => setProfile({ ...profile, discord_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" placeholder="username" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">X (Twitter)</label>
                                    <input value={profile.twitter_link} onChange={e => setProfile({ ...profile, twitter_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-400 outline-none transition-colors" placeholder="https://x.com/..." />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Twitch</label>
                                    <input value={profile.twitch_link} onChange={e => setProfile({ ...profile, twitch_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none transition-colors" placeholder="https://twitch.tv/..." />
                                </div>
                            </div>
                        ) : (
                            <>
                                {profile.discord_link ? (
                                    <div className="p-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded-xl transition-all flex items-center gap-4 group cursor-default">
                                        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/20">🎮</div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-[#5865F2] uppercase tracking-wider mb-0.5">Discord</p>
                                            <p className="text-sm font-bold text-white truncate">{profile.discord_link}</p>
                                        </div>
                                    </div>
                                ) : <div className="p-4 text-center text-gray-600 text-xs italic border border-white/5 rounded-xl">No Discord linked</div>}

                                {profile.twitter_link && (
                                    <a href={profile.twitter_link} target="_blank" className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">🐦</div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Twitter</p>
                                            <p className="text-sm font-bold text-white group-hover:underline decoration-blue-400/50">Follow</p>
                                        </div>
                                    </a>
                                )}

                                {profile.twitch_link && (
                                    <a href={profile.twitch_link} target="_blank" className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">📺</div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">Twitch</p>
                                            <p className="text-sm font-bold text-white group-hover:underline decoration-purple-400/50">Watch Live</p>
                                        </div>
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </aside>
            </div>

            {/* 5. Collections */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest">Collections</h2>
                        <div className="h-px bg-white/10 w-24"></div>
                    </div>
                    <button
                        onClick={() => handleOpenCollectionModal()}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                        + Create
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl mb-4">📂</div>
                            <p className="text-gray-400 font-bold text-lg">No collections yet.</p>
                            <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto">Create lists to organize your library and share your taste with the world.</p>
                        </div>
                    )}
                    {collections.map(c => (
                        <div key={c.id} className="group bg-[#0e0e10] rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10">
                            <div className="h-40 bg-gray-900 relative overflow-hidden">
                                {c.game_ids?.[0] ? (
                                    <>
                                        <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${c.game_ids[0]}/header.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] to-transparent"></div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-800 font-black text-6xl select-none">?</div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-lg ${c.is_public ? 'text-blue-200 bg-blue-900/80 border border-blue-500/30' : 'text-gray-400 bg-black/80 border border-white/10'}`}>
                                        {c.is_public ? 'PUBLIC' : 'PRIVATE'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 relative">
                                <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">{c.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-6">{c.description || "No description."}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <span className="text-xs font-mono text-gray-400">{c.game_ids?.length || 0} games</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenCollectionModal(c)} className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded">Edit</button>
                                        <button onClick={() => handleDeleteCollection(c.id)} className="text-xs font-bold text-red-900 hover:text-red-500 transition-colors px-2 py-1 hover:bg-red-900/20 rounded">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Footer Area (Perks & Quick Links) */}
            <footer className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-white/5 hover:border-green-500/20 transition-all">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Premium Access
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-xs text-gray-300"><span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">✓</span> Ad-Free Experience</li>
                        <li className="flex items-center gap-3 text-xs text-gray-300"><span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">✓</span> 12 Player Comparison</li>
                        <li className="flex items-center gap-3 text-xs text-gray-500"><span className="text-gray-600 font-bold bg-gray-700/20 px-1.5 py-0.5 rounded">○</span> Saved Squads (Coming Soon)</li>
                    </ul>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center text-center">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Quick Navigation</h4>
                    <div className="flex justify-center gap-4">
                        <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/5 rounded-lg text-xs font-bold transition-all">Compare Games</Link>
                        <Link href="/commands" className="px-4 py-2 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/5 rounded-lg text-xs font-bold transition-all">Bot Commands</Link>
                    </div>
                </div>
            </footer>
        </div >
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background:
                        "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
                }}
            />

            <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
                <DashboardContent />
            </Suspense>
        </div>
    );
}
