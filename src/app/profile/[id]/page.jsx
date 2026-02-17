"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ProfileContent() {
    const params = useParams();
    const id = params.id; // steamid or custom slug? starting with steamid

    const [profile, setProfile] = useState(null);
    const [collections, setCollections] = useState([]);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [steamInfo, setSteamInfo] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profRes = await fetch(`/api/user/profile?steamid=${id}`);
                const profData = await profRes.json();

                // 2. Fetch Collections
                const collRes = await fetch(`/api/user/collections?steamid=${id}`);
                const collData = await collRes.json();

                // 3. Fetch Premium Status
                const premRes = await fetch(`/api/user/premium?steamid=${id}`);
                const premData = await premRes.json();

                // 4. Fetch Basic Steam Info for display
                const compareRes = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ users: [id, id] })
                });
                const compareData = await compareRes.json();
                const me = compareData.profiles?.[0];

                setProfile(profData.profile);
                setCollections(collData.collections || []);
                setIsPremium(premData.isPremium);
                setSteamInfo(me);
            } catch (err) {
                console.error(err);
                setError("Profile not found");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Loading profile...</div>;
    if (error || !steamInfo) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Profile Not Found</div>;

    return (
        <div className="max-w-xl mx-auto px-6 py-20 flex flex-col items-center">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center mb-8">
                <img src={steamInfo.avatar} alt="" className="w-24 h-24 rounded-full ring-4 ring-blue-500/30 mb-4" />
                <h1 className="text-3xl font-black text-white">{steamInfo.username}</h1>
                {isPremium && (
                    <span className="mt-2 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 uppercase tracking-widest">
                        {profile?.tier === 'Pro' ? 'Pro Member' : profile?.tier === 'Hacker' ? 'Hacker Member' : 'Premium Member'}
                    </span>
                )}
            </div>

            {/* Bio */}
            {profile?.bio && (
                <p className="text-center text-gray-400 italic mb-10 text-sm leading-relaxed px-4">
                    "{profile.bio}"
                </p>
            )}

            {/* Social Links (Linktree Style) */}
            <div className="w-full space-y-3 mb-12">
                {profile?.discord_link && (
                    <div className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3">
                        <span className="text-sm font-bold text-gray-300">Discord: {profile.discord_link}</span>
                    </div>
                )}
                {profile?.twitter_link && (
                    <a href={profile.twitter_link} target="_blank" className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all">
                        <span className="text-sm font-bold text-blue-400">Follow on X</span>
                    </a>
                )}
                {profile?.twitch_link && (
                    <a href={profile.twitch_link} target="_blank" className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all">
                        <span className="text-sm font-bold text-purple-400">Watch on Twitch</span>
                    </a>
                )}
            </div>

            {/* Pinned Games */}
            {profile?.pinned_game_ids?.length > 0 && (
                <div className="w-full mb-12">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-6">Highlighted Favorites</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {profile.pinned_game_ids.map(appid => (
                            <div key={appid} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                                <img
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`}
                                    className="w-full aspect-[21/9] object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    alt=""
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collections */}
            {collections.length > 0 && (
                <div className="w-full space-y-6 mb-12">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-0">Curated Collections</h3>
                    {collections.filter(c => c.is_public).map(c => (
                        <div key={c.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-blue-500/30 transition-all">
                            <h4 className="font-bold text-white mb-1">{c.title}</h4>
                            <p className="text-xs text-gray-500 mb-4">{c.description}</p>
                            <div className="flex -space-x-2">
                                {(c.game_ids || []).slice(0, 5).map((appid, idx) => (
                                    <div key={idx} className="w-10 h-10 rounded-lg bg-gray-800 border-2 border-black overflow-hidden ring-1 ring-white/10">
                                        <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_sm_120.jpg`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {(c.game_ids || []).length > 5 && (
                                    <div className="w-10 h-10 rounded-lg bg-white/5 border-2 border-black flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        +{(c.game_ids || []).length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            <div className="mt-12 pt-12 border-t border-white/10 w-full flex flex-col items-center">
                <p className="text-xs text-gray-600 mb-4 font-medium uppercase tracking-[0.2em]">Created with</p>
                <Link href="/" className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                    <img src="/logo.png" className="h-6" alt="" />
                    <span className="text-lg font-bold text-white">We Both Play</span>
                </Link>
            </div>
        </div>
    );
}

export default function PublicProfilePage() {
    return (
        <div className="min-h-screen w-full bg-black relative selection:bg-blue-500/30 selection:text-blue-200">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background:
                        "radial-gradient(1000px 600px at 50% 0%, rgba(59,130,246,0.1), transparent 80%)",
                }}
            />
            <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <ProfileContent />
            </Suspense>
        </div>
    );
}
