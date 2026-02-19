import { useState, useEffect } from "react";

export default function PresetManager({ users, setUsers, onSelect, currentSteamId, isPremium }) {
    const [presets, setPresets] = useState([]);
    const [showSave, setShowSave] = useState(false);
    const [newName, setNewName] = useState("");

    // Dynamic Storage Key
    const storageKey = currentSteamId ? `steam_squad_presets_${currentSteamId}` : "steam_squad_presets_guest";

    useEffect(() => {
        if (!isPremium) {
            setPresets([]);
            return;
        }
        try {
            // 1. Load Current Presets
            const saved = localStorage.getItem(storageKey);

            // 2. Migration Logic (Only if logged in and no current presets found)
            if (!saved && currentSteamId) {
                const oldGlobal = localStorage.getItem("steam_squad_presets");
                if (oldGlobal) {
                    // Migrate
                    localStorage.setItem(storageKey, oldGlobal);
                    localStorage.removeItem("steam_squad_presets");
                    setPresets(JSON.parse(oldGlobal));
                    return;
                }
            }

            if (saved) {
                setPresets(JSON.parse(saved));
            } else {
                setPresets([]);
            }
        } catch (e) {
            console.error("Failed to load presets", e);
        }
    }, [currentSteamId, storageKey, isPremium]);

    const savePreset = () => {
        if (!newName.trim()) return;
        const currentUsers = users.filter(u => u && u.trim());
        if (currentUsers.length === 0) {
            alert("Add some friends first!");
            return;
        }

        const squad = {
            id: Date.now(),
            name: newName.trim(),
            users: currentUsers
        };

        const updated = [...presets, squad];
        setPresets(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setNewName("");
        setShowSave(false);
    };

    const loadPreset = (presetUsers) => {
        let newUsers = [...presetUsers];
        while (newUsers.length < 2) {
            newUsers.push("");
        }
        setUsers(newUsers);
        if (onSelect) onSelect(newUsers);
    };

    const deletePreset = (id) => {
        if (confirm("Delete this squad?")) {
            const updated = presets.filter(p => p.id !== id);
            setPresets(updated);
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
    };

    return (
        <div className="w-full mb-6 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                        Squad Presets
                    </h3>
                </div>

                <div className="flex items-center gap-4">
                    {isPremium && (
                        <button
                            type="button"
                            onClick={() => setShowSave(!showSave)}
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                            {showSave ? "Cancel" : "+ Save Squad"}
                        </button>
                    )}

                    {/* Premium Label */}
                    {!isPremium && (
                        <a
                            href="/upgrade"
                            className="text-[10px] text-yellow-500 font-bold border border-yellow-500/30 px-2 py-0.5 rounded bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                            PRO+ FEATURE
                        </a>
                    )}
                </div>
            </div>

            {showSave && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Squad Name (e.g. 'The Boys')"
                        className="flex-grow bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={savePreset}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded"
                    >
                        Save
                    </button>
                </div>
            )}

            {presets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {presets.map(p => (
                        <div key={p.id}
                            className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 rounded-xl group border border-white/5 hover:border-white/20 transition-all cursor-pointer active:scale-95 shadow-lg shadow-black/10"
                            onClick={() => loadPreset(p.users)}>
                            <div className="truncate pr-2 flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                                    {p.users.length}
                                </div>
                                <div className="truncate">
                                    <span className="text-sm text-gray-200 font-bold block truncate">{p.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-tight">{p.users.length} Friends Saved</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deletePreset(p.id); }}
                                className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg"
                                title="Delete Squad"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {presets.length === 0 && !showSave && (
                <p className="text-xs text-gray-500 italic text-center py-1">
                    {isPremium ? "No saved squads yet." : "Upgrade to Pro to save your favorite squads!"}
                </p>
            )}
        </div>
    );
}
