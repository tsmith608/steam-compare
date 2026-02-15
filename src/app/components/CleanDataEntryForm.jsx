"use client";
import { useState } from "react";

/**
 * Basic sanitization to prevent XSS characters in manual entry.
 * Allows common URL characters but strips dangerous scripts/tags.
 */
const sanitizeInput = (val) => val.replace(/[<>"'%;()&+]/g, "");

export default function CleanDataEntryForm({
    user1, setUser1,
    user2, setUser2,
    user3, setUser3,
    user4, setUser4,
    loading,
    handleCompare,
    setShowHelp,
    firstInputRef,
    formRef,
    SteamLoginButton,
    FriendPickerBridge
}) {

    // Helper to handle input changes with sanitization
    const handleChange = (setter) => (e) => {
        setter(sanitizeInput(e.target.value));
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleCompare}
            className="flex flex-col gap-6"
        >
            {/* --- PRIMARY: Quick Login --- */}
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl shadow-black/50">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    Get Started Instantly
                </h3>
                <div className="flex flex-col items-center justify-center gap-4">
                    {/* Make Steam Button Prominent */}
                    <div className="transform scale-105 hover:scale-110 transition-transform duration-300">
                        <SteamLoginButton label="Sign in with Steam" className="px-8 py-3 bg-[#171a21] hover:bg-[#2a475e] border border-white/10 hover:border-white/20 text-white font-bold tracking-wide shadow-lg hover:shadow-blue-900/20 transition-all" />
                    </div>

                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Sign in to automatically load your friends list and compare libraries instantly.
                    </p>

                    {/* Bridge for Friend Picker Logic */}
                    <FriendPickerBridge
                        setUser1={setUser1}
                        setUser2={setUser2}
                        setUser3={setUser3}
                        setUser4={setUser4}
                    />
                </div>
            </div>

            {/* --- DIVIDER --- */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Or Enter Manually
                </span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* --- SECONDARY: Manual Entry --- */}
            <div className="space-y-6 opacity-90 hover:opacity-100 transition-opacity">

                {/* Main Players */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* You */}
                    <div className="space-y-2">
                        <label htmlFor="user1" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                            Your Profile
                        </label>
                        <div className="relative group">
                            <input
                                id="user1"
                                ref={firstInputRef}
                                value={user1}
                                onChange={handleChange(setUser1)}
                                placeholder="Steam ID or URL"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-gray-200 placeholder-gray-600 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all font-mono text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Friend 1 */}
                    <div className="space-y-2">
                        <label htmlFor="user2" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                            Friend 1
                        </label>
                        <input
                            id="user2"
                            value={user2}
                            onChange={handleChange(setUser2)}
                            placeholder="Steam ID or URL"
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-gray-200 placeholder-gray-600 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all font-mono text-sm"
                            required
                        />
                    </div>
                </div>

                {/* Optional Friends (Compact) */}
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors list-none select-none mb-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-90 transition-transform">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span>Add more friends (Optional)</span>
                    </summary>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pl-2 border-l-2 border-white/5 ml-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                        {/* Friend 2 */}
                        <div className="space-y-1">
                            <label htmlFor="user3" className="block text-xs text-gray-500 pl-1">Friend 2</label>
                            <input
                                id="user3"
                                value={user3}
                                onChange={handleChange(setUser3)}
                                placeholder="Steam ID / URL"
                                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-black/20 text-gray-300 placeholder-gray-700 focus:ring-1 focus:ring-blue-500/50 outline-none font-mono text-sm"
                            />
                        </div>
                        {/* Friend 3 */}
                        <div className="space-y-1">
                            <label htmlFor="user4" className="block text-xs text-gray-500 pl-1">Friend 3</label>
                            <input
                                id="user4"
                                value={user4}
                                onChange={handleChange(setUser4)}
                                placeholder="Steam ID / URL"
                                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-black/20 text-gray-300 placeholder-gray-700 focus:ring-1 focus:ring-blue-500/50 outline-none font-mono text-sm"
                            />
                        </div>
                    </div>
                </details>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[200px] px-8 py-3 rounded-xl font-bold text-white
                                   bg-gradient-to-r from-gray-700 to-gray-600 hover:from-blue-600 hover:to-blue-500
                                   border border-white/10 shadow-lg shadow-black/20
                                   transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Analyzing Library..." : "Compare Manually"}
                    </button>

                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-xs text-gray-500 hover:text-white underline transition-colors"
                        type="button"
                    >
                        Where do I find these IDs?
                    </button>
                </div>
            </div>
        </form>
    );
}
