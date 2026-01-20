"use client";

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
    return (
        <form
            ref={formRef}
            onSubmit={handleCompare}
            className="space-y-6"
        >
            {/* Main Players Section */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Main Players</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* You */}
                    <div className="space-y-2">
                        <label htmlFor="user1" className="block text-sm font-medium text-gray-200 pl-1">
                            Your Profile
                        </label>
                        <div className="relative group">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 14a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14 10a5 5 0 0 1 0 7L12.5 18.5a5 5 0 1 1-7-7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                id="user1"
                                ref={firstInputRef}
                                value={user1}
                                onChange={(e) => setUser1(e.target.value)}
                                placeholder="Steam64 ID or Profile URL"
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                        <p className="text-[11px] text-gray-500 pl-1">Example: 7656119… or steamcommunity.com/id/you</p>
                    </div>

                    {/* Friend 1 */}
                    <div className="space-y-2">
                        <label htmlFor="user2" className="block text-sm font-medium text-gray-200 pl-1">
                            Friend 1
                        </label>
                        <div className="relative group">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M4 19a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                id="user2"
                                value={user2}
                                onChange={(e) => setUser2(e.target.value)}
                                placeholder="Steam64 ID or Profile URL"
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                        <p className="text-[11px] text-gray-500 pl-1">Game details must be Public</p>
                    </div>
                </div>
            </div>

            {/* Optional Friends Section */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Additional Friends (Optional)</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Friend 2 */}
                    <div className="space-y-2">
                        <label htmlFor="user3" className="block text-sm font-medium text-gray-300 pl-1">
                            Friend 2
                        </label>
                        <div className="relative group">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M4 19a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                id="user3"
                                value={user3}
                                onChange={(e) => setUser3(e.target.value)}
                                placeholder="Steam64 ID or Profile URL"
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Friend 3 */}
                    <div className="space-y-2">
                        <label htmlFor="user4" className="block text-sm font-medium text-gray-300 pl-1">
                            Friend 3
                        </label>
                        <div className="relative group">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M4 19a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                id="user4"
                                value={user4}
                                onChange={(e) => setUser4(e.target.value)}
                                placeholder="Steam64 ID or Profile URL"
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Steam Auth Section */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Quick Login</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <SteamLoginButton />
                    <FriendPickerBridge
                        setUser1={setUser1}
                        setUser2={setUser2}
                        setUser3={setUser3}
                        setUser4={setUser4}
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="pt-6 mt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-sm text-gray-400 hover:text-blue-400 underline underline-offset-4 decoration-white/20 transition-colors order-2 sm:order-1"
                        type="button"
                    >
                        How to find your Steam64 ID?
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-[15px]
                 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
                 text-white shadow-lg shadow-blue-500/25 transition-all duration-200
                 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] order-1 sm:order-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                            </span>
                        ) : (
                            "Compare Now"
                        )}
                    </button>
                </div>

                {/* Privacy reassurance */}
                <p className="mt-5 text-xs text-center text-gray-500 flex items-center justify-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    We don't store your IDs or libraries — comparisons run in real time using public data
                </p>
            </div>
        </form>
    );
}
