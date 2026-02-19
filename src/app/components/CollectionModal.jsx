
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating';

export default function CollectionModal({ collection, isOpen, onClose, fullLibrary, onSave, readOnly = false, onShare }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState(collection?.title || "");
    const [description, setDescription] = useState(collection?.description || "");
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPublic, setIsPublic] = useState(collection?.is_public ?? true);

    useEffect(() => {
        if (collection) {
            setTitle(collection.title || "");
            setDescription(collection.description || "");
            setIsPublic(collection.is_public ?? true);

            // Normalize items
            const normalized = (collection.game_ids || []).map(g => {
                if (typeof g === 'object' && g !== null) return g;
                return { appid: g, rating: 0, comment: "" };
            });
            setItems(normalized);
        } else {
            setTitle("");
            setDescription("");
            setItems([]);
            setIsPublic(true);
        }
    }, [collection]);

    const handleAddItem = (game) => {
        if (items.find(i => i.appid === game.appid)) return;
        setItems([...items, { appid: game.appid, rating: 0, comment: "" }]);
        setSearchTerm("");
    };

    const handleRemoveItem = (appid) => {
        setItems(items.filter(i => i.appid !== appid));
    };

    const handleUpdateItem = (appid, field, value) => {
        setItems(items.map(i => i.appid === appid ? { ...i, [field]: value } : i));
    };

    const handleSave = () => {
        onSave({
            id: collection?.id,
            title,
            description,
            gameIds: items,
            isPublic
        });
    };

    const filteredLibrary = fullLibrary.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !items.find(i => i.appid === g.appid)
    ).slice(0, 10);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0e0e10] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}

                <div className={`p-6 border-b border-white/10 ${readOnly ? 'bg-transparent border-none pb-0' : 'bg-gradient-to-r from-blue-900/20 to-purple-900/20'}`}>
                    <div className="flex justify-between items-start mb-4">
                        {readOnly ? (
                            <div className="w-full flex flex-col items-center pt-8 pb-4">
                                <h2 className="text-5xl md:text-6xl font-black text-white text-center mb-4 tracking-tighter drop-shadow-2xl">{title}</h2>
                                {description && (
                                    <p className="text-gray-400 text-lg text-center max-w-2xl font-light leading-relaxed">{description}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Collection Title"
                                    className="bg-transparent text-3xl font-black text-white placeholder-gray-600 outline-none w-full"
                                />
                                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                    <span className="material-icons-outlined text-2xl">close</span>
                                </button>
                            </>
                        )}
                    </div>

                    {!readOnly && (
                        <>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this collection about?"
                                className="bg-transparent text-gray-400 placeholder-gray-600 outline-none w-full resize-none text-sm"
                                rows={2}
                            />
                            <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20 checked:bg-blue-600"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Public Collection</span>
                                </label>
                            </div>
                        </>
                    )}

                    {readOnly && (
                        <div className="absolute top-6 right-6 flex gap-3">
                            {onShare && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShare(collection.id); }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105"
                                >
                                    Share
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Add Game Search */}
                    {/* Add Game Search - Hide in ReadOnly */}
                    {!readOnly && (
                        <div className="relative mb-8 z-20">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search library to add games..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-blue-500 transition-colors"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>

                            {searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                                    {filteredLibrary.length === 0 ? (
                                        <div className="p-4 text-gray-500 text-center text-sm">No games found</div>
                                    ) : (
                                        filteredLibrary.map(g => (
                                            <button
                                                key={g.appid}
                                                onClick={() => handleAddItem(g)}
                                                className="w-full text-left p-3 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
                                            >
                                                <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`} className="w-8 rounded" alt="" />
                                                <span className="text-gray-300 font-bold truncate">{g.name}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items List */}
                    <div className={readOnly ? "grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-4" : "space-y-4"}>
                        {items.length === 0 && (
                            <div className="col-span-full text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                                <p className="text-gray-500 font-bold">This collection is empty.</p>
                                <p className="text-sm text-gray-600 mt-1">Search above to add games.</p>
                            </div>
                        )}
                        <AnimatePresence>
                            {items.map((item) => {
                                const gameDetails = fullLibrary.find(g => g.appid === item.appid);

                                if (readOnly) {
                                    return (
                                        <motion.div
                                            key={item.appid}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl hover:border-white/10 hover:shadow-blue-900/10 transition-all flex h-52 group"
                                        >
                                            <div className="w-36 h-full flex-shrink-0 relative">
                                                <img
                                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appid}/library_600x900.jpg`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    alt=""
                                                    onError={(e) => {
                                                        e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appid}/header.jpg`;
                                                        e.target.className = "w-full h-full object-cover opacity-80 scale-150";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                                            </div>
                                            <div className="flex-1 p-6 flex flex-col relative bg-gradient-to-br from-white/[0.02] to-transparent">
                                                <div className="flex-1">
                                                    <h4 className="text-xl font-black text-white mb-3 leading-tight line-clamp-2 drop-shadow-md">{gameDetails?.name || `AppID: ${item.appid}`}</h4>
                                                    {item.comment ? (
                                                        <p className="text-sm text-gray-400 italic font-medium leading-relaxed line-clamp-3">"{item.comment}"</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic">No comment added.</p>
                                                    )}
                                                </div>

                                                <div className="pt-4 mt-2 border-t border-white/5 flex items-center gap-3">
                                                    <StarRating rating={item.rating} size="sm" readOnly />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={item.appid}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-6 group hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-full md:w-32 aspect-[2/3] md:aspect-video rounded-lg overflow-hidden bg-black relative">
                                            <img
                                                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appid}/header.jpg`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                                onError={(e) => {
                                                    e.target.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appid}/capsule_sm_120.jpg`;
                                                }}
                                            />
                                            <button
                                                onClick={() => handleRemoveItem(item.appid)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-bold text-white mb-2">{gameDetails?.name || `AppID: ${item.appid}`}</h4>

                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Your Rating</label>
                                                    <StarRating
                                                        rating={item.rating}
                                                        onChange={(val) => handleUpdateItem(item.appid, 'rating', val)}
                                                    />
                                                </div>

                                                <div className="w-full">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Notes</label>
                                                    <input
                                                        value={item.comment}
                                                        onChange={(e) => handleUpdateItem(item.appid, 'comment', e.target.value)}
                                                        placeholder="Add a comment... (e.g. 'Best boss fight ever')"
                                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500/50 outline-none transition-colors placeholder-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer - Hide in ReadOnly as buttons are in header */}
                {!readOnly && (
                    <div className="p-6 border-t border-white/10 bg-[#0e0e10] flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                        >
                            Save Collection
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
