import { useState, useEffect, useMemo } from "react";

export default function FilterBar({ onFilterChange, isPremium, availableCategories = [], sharedGames = [], gameDetails = {} }) {
    const [activeCategory, setActiveCategory] = useState("all");

    // Common categories we always want to show if available, or just show everything dynamic?
    // User said "dynamically loaded", so let's rely on availableCategories.
    // But we should probably prioritize/sort them. 
    // For now, let's just take the unique list passed in.

    const handleCategoryClick = (cat) => {
        const newVal = activeCategory === cat ? "all" : cat;
        setActiveCategory(newVal);
        onFilterChange({ category: newVal });
    };

    // Calculate counts for each category
    const categoryCounts = useMemo(() => {
        const counts = {};
        sharedGames.forEach(g => {
            const details = gameDetails[g.appid];
            if (!details) return;

            // Check Genres
            details.genres?.forEach(gen => {
                counts[gen.description] = (counts[gen.description] || 0) + 1;
            });

            // Check Categories
            details.categories?.forEach(cat => {
                counts[cat.description] = (counts[cat.description] || 0) + 1;
            });
        });
        return counts;
    }, [sharedGames, gameDetails]);

    // Prepare styles for non-premium
    const containerClass = "w-full mb-8";
    const buttonBaseClass = "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border whitespace-nowrap flex items-center gap-2";

    // ... sort logic ...

    // Sort: "Multi-player", "Co-op" first, then others alphabetically?
    const priority = ["Multi-player", "Co-op", "Online Co-op", "Local Co-op", "PvP", "Full controller support"];
    const sortedCats = [...availableCategories].sort((a, b) => {
        const idxA = priority.indexOf(a);
        const idxB = priority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className={containerClass}>
            <div className="flex items-center gap-3 mb-2">
                <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Filter by Category</div>
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
            <div className={`flex flex-wrap gap-2 max-h-40 overflow-y-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 ${!isPremium ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : ''}`}>
                <button
                    onClick={() => isPremium && handleCategoryClick("all")}
                    className={`${buttonBaseClass} ${activeCategory === "all"
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                        } ${!isPremium ? 'pointer-events-none' : ''}`}
                >
                    All
                    <span className="text-[10px] bg-black/20 px-1.5 rounded-full">{sharedGames.length}</span>
                </button>

                {sortedCats.map(cat => (
                    <button
                        key={cat}
                        onClick={() => isPremium && handleCategoryClick(cat)}
                        className={`${buttonBaseClass} ${activeCategory === cat
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                            } ${!isPremium ? 'pointer-events-none' : ''}`}
                    >
                        {cat}
                        {categoryCounts[cat] && (
                            <span className="text-[10px] bg-black/20 px-1.5 rounded-full">{categoryCounts[cat]}</span>
                        )}
                    </button>
                ))}

                {/* Loading state or no tags found */}
                {availableCategories.length === 0 && (
                    <span className="text-xs text-gray-500 py-1.5 italic">
                        {availableCategories === null ? "Analyzing library tags..." : "No specific genre tags found."}
                    </span>
                )}
            </div>
        </div>
    );
}
