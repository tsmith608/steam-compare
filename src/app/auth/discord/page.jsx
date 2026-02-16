"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SteamLoginButton from '@/app/components/SteamLoginButton';

function AuthContent() {
    const searchParams = useSearchParams();
    const discordId = searchParams.get('discord_id');

    const onSteamSuccess = async (profile) => {
        try {
            const res = await fetch('/api/discord/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: discordId,
                    steamId: profile.steamid
                })
            });

            if (res.ok) {
                alert(`Successfully linked Discord ID ${discordId} to Steam ID ${profile.steamid}!`);
                console.log("Linked:", { discordId, steamProfile: profile });
            } else {
                const err = await res.json();
                alert(`Failed to link: ${err.error}`);
            }
        } catch (e) {
            console.error("Link error:", e);
            alert("An error occurred while linking account.");
        }
    };

    return (
        <div className="bg-[#0e0e10] min-h-screen text-gray-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-xl">
                <h1 className="text-3xl font-bold mb-4 text-white">Connect Steam</h1>
                <p className="text-gray-400 mb-8">
                    Link your Steam account to Discord user <code className="bg-black/30 px-2 py-1 rounded text-blue-400">{discordId || 'Unknown'}</code> to start comparing games.
                </p>

                <div className="flex justify-center">
                    <SteamLoginButton
                        mode="popup"
                        onSuccess={onSteamSuccess}
                        label="Sign in with Steam"
                        className="scale-110"
                    />
                </div>

                <p className="text-xs text-gray-500 mt-8">
                    We only access your public library information.
                </p>
            </div>
        </div>
    );
}

export default function DiscordAuthPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
