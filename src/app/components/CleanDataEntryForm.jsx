"use client";
import { useState } from "react";
import PresetManager from "./PresetManager";

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
    isPremium, isLoggedIn, userName, userAvatar
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

    const addUser = () => {
        if (users.length >= 12) return;
        if (!isPremium && users.length >= 4) return; // limit for free
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
                        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                            {userAvatar && <img src={userAvatar} alt="" className="w-10 h-10 rounded-full ring-2 ring-blue-500" />}
                            <div className="text-left">
                                <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Signed in as</div>
                                <div className="text-white font-bold text-lg">{userName || "Steam User"}</div>
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
                    {users.length < 12 && (
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={addUser}
                                disabled={!isPremium && users.length >= 4}
                                className={`w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 font-medium transition-all
                                   ${(!isPremium && users.length >= 4)
                                        ? "opacity-50 cursor-not-allowed bg-black/10"
                                        : "hover:bg-white/5 hover:border-white/40 hover:text-white"
                                    }`}
                            >
                                {(!isPremium && users.length >= 4)
                                    ? "Unlock Premium for more slots"
                                    : "+ Add Another Friend"}
                            </button>
                        </div>
                    )}
                </div>

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
                        {loading ? "Analyzing Library..." : "Compare"}
                    </button>

                    <p className="text-xs text-stone-500">
                        {isPremium ? "✨ Premium Member" : "Free Mode (Up to 4 Players)"}
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
                        <PresetManager users={users} setUsers={setUsers} />
                    </div>
                </div>
            </div>
        </form>
    );
}
