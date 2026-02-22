"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamePickerModal({ isOpen, onClose, fullLibrary, initialSelected = [], onSave }) {
    if (!isOpen) return null;

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState(initialSelected || []);

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return fullLibrary.slice(0, 50);
        return fullLibrary.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 50);
    }, [fullLibrary, searchTerm]);

    const toggleGame = (appid) => {
        setSelectedIds(prev =>
            prev.includes(appid)
                ? prev.filter(id => id !== appid)
                : [...prev, appid]
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#0e0e10] w-full max-w-2xl max-h-[80vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Pin Your Games</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Select up to 8 favorites</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                        ✕
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5 relative">
                    <input
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search your library..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600"
                    />
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredLibrary.map(g => {
                        const isSelected = selectedIds.includes(g.appid);
                        return (
                            <button
                                key={g.appid}
                                onClick={() => toggleGame(g.appid)}
                                className={`relative aspect-video rounded-xl overflow-hidden border transition-all group ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5 grayscale-[0.5] hover:grayscale-0 hover:border-white/20'}`}
                            >
                                <img
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt={g.name}
                                    onError={(e) => { e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`; }}
                                />
                                <div className={`absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t ${isSelected ? 'from-blue-900/80 to-transparent' : 'from-black/80 to-transparent'}`}>
                                    <span className="text-[9px] font-black text-white uppercase truncate text-left">{g.name}</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-[10px] text-white">✓</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0e0e10] flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {selectedIds.length} games selected
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(selectedIds)}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                        >
                            Save Selection
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
