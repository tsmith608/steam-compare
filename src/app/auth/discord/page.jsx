"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SteamLoginButton from '@/app/components/SteamLoginButton';

function AuthContent() {
    const searchParams = useSearchParams();
    const discordId = searchParams.get('discord_id');
    const [status, setStatus] = React.useState('idle'); // idle, loading, success, error
    const [message, setMessage] = React.useState('');

    const onSteamSuccess = async (profile) => {
        setStatus('loading');
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
                setStatus('success');
            } else {
                const err = await res.json();
                setStatus('error');
                setMessage(err.error || "Failed to link accounts.");
            }
        } catch (e) {
            console.error("Link error:", e);
            setStatus('error');
            setMessage("An error occurred while linking account.");
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-[#0e0e10] min-h-screen text-gray-100 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center shadow-xl animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Success!</h1>
                    <p className="text-gray-300 mb-8 text-lg">
                        Your Steam account has been linked to Discord.
                    </p>

                    <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Next Step</p>
                        <p className="text-white text-lg font-medium">
                            Go back to Discord and type:
                        </p>
                        <code className="block mt-3 bg-black/60 p-3 rounded-lg text-blue-400 font-mono text-xl select-all cursor-pointer hover:bg-black/80 transition-colors">
                            /compare
                        </code>
                    </div>

                    <a href="/" className="block mt-8 text-gray-500 hover:text-white underline text-sm transition-colors">
                        Return to Home Page
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0e0e10] min-h-screen text-gray-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-xl">
                <h1 className="text-3xl font-bold mb-4 text-white">Connect Steam</h1>
                <p className="text-gray-400 mb-8">
                    Link your Steam account to Discord user <code className="bg-black/30 px-2 py-1 rounded text-blue-400">{discordId || 'Unknown'}</code> to start comparing games.
                </p>

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                        ❌ {message}
                    </div>
                )}

                <div className={`flex justify-center transition-opacity ${status === 'loading' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SteamLoginButton
                        mode="popup"
                        onSuccess={onSteamSuccess}
                        label={status === 'loading' ? 'Linking...' : 'Sign in with Steam'}
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
