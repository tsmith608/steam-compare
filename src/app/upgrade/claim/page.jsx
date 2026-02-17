"use client";
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ClaimPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const steamid = searchParams.get('steamid');
    const [transactionId, setTransactionId] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!steamid) {
            setStatus('error');
            setMessage('You must be signed in with Steam to claim premium.');
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/claim-premium', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steamid, transactionId })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage(`Success! Your account has been upgraded to ${data.tier}.`);
                setTimeout(() => router.push(`/?steamid=${steamid}`), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to claim premium. Please check your Transaction ID.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('A network error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background:
                        "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%)",
                }}
            />

            <div className="flex-grow w-full max-w-2xl mx-auto px-6 py-32 flex flex-col items-center relative z-10 text-center">
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                    Claim Your <span className="text-blue-500">Premium</span>
                </h1>
                <p className="text-gray-400 mb-12 leading-relaxed">
                    Forgot to include your code or Steam ID on Ko-fi? Enter your **Transaction ID** below to instantly link your purchase to your Steam account.
                </p>

                <form onSubmit={handleSubmit} className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
                    <div className="mb-8 text-left">
                        <label className="block text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-3 ml-1">
                            Ko-fi Transaction ID
                        </label>
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 01234567-89AB-CDEF"
                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono focus:border-blue-500/50 outline-none transition-colors shadow-inner"
                            required
                        />
                        <p className="mt-3 text-[10px] text-gray-500 ml-1 italic">
                            You can find this in your Ko-fi email receipt.
                        </p>
                    </div>

                    {!steamid ? (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-3 rounded-xl text-sm mb-8">
                            Please sign in with Steam first to claim your upgrade.
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-95 ${status === 'loading'
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20'
                                }`}
                        >
                            {status === 'loading' ? 'Verifying...' : 'Unlock Premium Now'}
                        </button>
                    )}

                    {status === 'success' && (
                        <div className="mt-8 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm animate-bounce">
                            {message} Redirecting...
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mt-8 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {message}
                        </div>
                    )}
                </form>

                <div className="mt-12">
                    <a href="/upgrade" className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                        ← Back to Plans
                    </a>
                </div>
            </div>
        </div>
    );
}
