import { useState, useEffect } from "react";

export default function PresetManager({ users, setUsers, onSelect }) {
    const [presets, setPresets] = useState([]);
    const [showSave, setShowSave] = useState(false);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("steam_squad_presets");
            if (saved) {
                setPresets(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load presets", e);
        }
    }, []);

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
        localStorage.setItem("steam_squad_presets", JSON.stringify(updated));
        setNewName("");
        setShowSave(false);
    };

    const loadPreset = (presetUsers) => {
        // If onSelect is provided, we can skip confirmation or keep it?
        // User said "click a squad it should just trigger a comparison"
        // Let's keep confirmation to be safe, or maybe remove it for smoother UX if onSelect is there?
        // "autopopulates ... and on the results screen ... just trigger a comparison"
        // I'll keep confirmation for now but make it optional or smoother later if requested.
        // Actually, for "just trigger", maybe no confirm? 
        // Let's keep confirm for now but pass the data.
        if (confirm("Load this squad?")) {
            let newUsers = [...presetUsers];
            while (newUsers.length < 2) {
                newUsers.push("");
            }
            setUsers(newUsers);
            if (onSelect) onSelect(newUsers);
        }
    };

    const deletePreset = (id) => {
        if (confirm("Delete this squad?")) {
            const updated = presets.filter(p => p.id !== id);
            setPresets(updated);
            localStorage.setItem("steam_squad_presets", JSON.stringify(updated));
        }
    };

    return (
        <div className="w-full mb-6 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        The Squad Presets
                    </h3>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setShowSave(!showSave)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                        {showSave ? "Cancel" : "+ Save Squad"}
                    </button>

                    {/* Premium Label */}
                    <div className="hidden sm:block text-[10px] text-yellow-500 font-bold border border-yellow-500/30 px-2 py-0.5 rounded bg-yellow-500/10">
                        PREMIUM FEATURE
                    </div>
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
                        <div key={p.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-2 rounded group border border-white/5 hover:border-white/20 transition-all cursor-pointer" onClick={() => loadPreset(p.users)}>
                            <div className="truncate pr-2">
                                <span className="text-sm text-gray-200 font-medium block truncate">{p.name}</span>
                                <span className="text-xs text-gray-500">{p.users.length} members</span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deletePreset(p.id); }}
                                className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Squad"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {presets.length === 0 && !showSave && (
                <p className="text-xs text-gray-500 italic text-center py-1">No saved squads yet.</p>
            )}
        </div>
    );
}
