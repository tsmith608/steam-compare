"use client";
import { useState } from "react";
import PresetManager from "./PresetManager";
import "./compareButton.scss";

/**
 * Basic sanitization to prevent XSS characters in manual entry.
 * Allows common URL characters but strips dangerous scripts/tags.
 */
const sanitizeInput = (val) => val.replace(/[<>"'%;()&+]/g, "");

export default function CleanDataEntryForm({
    users, setUsers,
    loading,
    handleCompare,
    setShowHelp,
    firstInputRef,
    formRef,
    SteamLoginButton,
    FriendPickerBridge,
    isPremium, isLoggedIn, userName, userAvatar,
    tier, // New prop
    currentSteamId
}) {

    // Helper to handle input changes with sanitization
    const handleChange = (index, value) => {
        const sanitized = sanitizeInput(value);
        setUsers(prev => {
            const next = [...prev];
            next[index] = sanitized;
            return next;
        });
    };

    const getMaxUsers = () => {
        if (!isPremium) return 4;
        if (tier === 'Bronze') return 6;
        if (tier === 'Silver') return 10;
        if (tier === 'Gold') return 16;
        return 12; // Default for admin or legacy
    };

    const addUser = () => {
        const max = getMaxUsers();
        if (users.length >= max) return;
        setUsers(prev => [...prev, ""]);
    };

    const removeUser = (index) => {
        setUsers(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleCompare}
            className="flex flex-col gap-6"
        >
            {/* --- PRIMARY: Quick Login --- */}
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl shadow-black/50">

                <div className="flex flex-col items-center justify-center gap-4">
                    {/* Make Steam Button Prominent or Show User Profile */}
                    {isLoggedIn ? (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <img src={userAvatar} alt="" className="relative w-24 h-24 rounded-full border-2 border-blue-500 shadow-2xl" />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-black flex items-center justify-center" title="Online">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="text-xs text-blue-400 font-bold uppercase tracking-[0.2em] block mb-1">Authenticated via Steam</span>
                                <h2 className="text-2xl font-black text-white tracking-tight">{userName}</h2>
                                <div className="mt-4 flex flex-wrap justify-center gap-3">
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Active Session</span>
                                    </div>
                                    <SteamLoginButton
                                        label="Swap Account"
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[10px] text-gray-400 font-bold uppercase tracking-widest rounded-xl transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="transform scale-105 hover:scale-110 transition-transform duration-300">
                            <SteamLoginButton label="Sign in with Steam" className="px-8 py-3 bg-[#171a21] hover:bg-[#2a475e] border border-white/10 hover:border-white/20 text-white font-bold tracking-wide shadow-lg hover:shadow-blue-900/20 transition-all" />
                        </div>
                    )}

                    {!isLoggedIn && (
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            Sign in to automatically load your friends list and compare libraries instantly.
                        </p>
                    )}

                    {/* Bridge for Friend Picker Logic */}
                    <FriendPickerBridge
                        setUsers={setUsers}
                        isPremium={isPremium}
                        tier={tier}
                        steamId={currentSteamId}
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
                    {users.map((u, i) => (
                        <div key={i} className="space-y-2 relative">
                            <label htmlFor={`user-${i}`} className="block text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 flex justify-between">
                                {i === 0 ? "Your Profile" : `Friend ${i}`}
                                {i >= 2 && ( // Allow removing from Friend 2 onwards (keep first 2 always?)
                                    <button
                                        type="button"
                                        onClick={() => removeUser(i)}
                                        className="text-red-500 hover:text-red-400 lowercase font-normal"
                                    >
                                        remove
                                    </button>
                                )}
                            </label>
                            <div className="relative group">
                                <input
                                    id={`user-${i}`}
                                    ref={i === 0 ? firstInputRef : null}
                                    value={u}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    placeholder={i === 0 ? "Steam ID or URL" : "Steam ID or URL"}
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-gray-200 placeholder-gray-600 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all font-mono text-sm"
                                    required={i < 2} // First 2 required?
                                />
                            </div>
                        </div>
                    ))}

                    {/* Add Button */}
                    {users.length < getMaxUsers() && (
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={addUser}
                                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 font-medium transition-all hover:bg-white/5 hover:border-white/40 hover:text-white"
                            >
                                + Add Another Friend
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`compare_btn_wrapper w-full sm:w-auto min-w-[200px] px-8 py-3 rounded-xl font-bold text-white
                                   bg-gradient-to-r from-gray-700 to-gray-600 hover:from-blue-600 hover:to-blue-500
                                   border border-white/10 shadow-lg shadow-black/20
                                   transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'is_loading' : ''}`}
                    >
                        <span className="relative z-20 pointer-events-none">
                            {loading ? "Analyzing Library..." : "Compare"}
                        </span>
                        {Array.from({ length: 54 }).map((_, i) => (
                            <span key={i} className="button_spots"></span>
                        ))}
                    </button>

                    <p className="text-xs text-stone-500">
                        {isPremium ? `✨ ${tier} Member (${getMaxUsers()} Slots)` : "Free Mode (Up to 4 Players)"}
                    </p>

                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-xs text-gray-500 hover:text-white underline transition-colors"
                        type="button"
                    >
                        Where do I find these IDs?
                    </button>

                    {/* Presets */}
                    <div className="w-full">
                        <PresetManager
                            users={users}
                            setUsers={setUsers}
                            onSelect={(newUsers) => handleCompare(null, newUsers)}
                            currentSteamId={currentSteamId}
                            isPremium={isPremium}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
