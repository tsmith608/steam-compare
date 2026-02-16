import { useState, useEffect } from "react";

export default function FilterBar({ onFilterChange, isPremium, availableCategories = [] }) {
    const [activeCategory, setActiveCategory] = useState("all");

    // Common categories we always want to show if available, or just show everything dynamic?
    // User said "dynamically loaded", so let's rely on availableCategories.
    // But we should probably prioritize/sort them. 
    // For now, let's just take the unique list passed in.

    const handleCategoryClick = (cat) => {
        if (!isPremium) return;
        const newVal = activeCategory === cat ? "all" : cat;
        setActiveCategory(newVal);
        onFilterChange({ category: newVal });
    };

    // Prepare styles for non-premium
    const containerClass = isPremium
        ? "w-full mb-6"
        : "w-full mb-6 opacity-50 select-none pointer-events-none grayscale";

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
                    <div className="text-[10px] text-yellow-500 font-bold border border-yellow-500/30 px-2 py-0.5 rounded bg-yellow-500/10">
                        PREMIUM FEATURE
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleCategoryClick("all")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                        ${activeCategory === "all"
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                        }`}
                >
                    All
                </button>

                {sortedCats.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                            ${activeCategory === cat
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                            }`}
                    >
                        {cat}
                    </button>
                ))}

                {/* Loading state or no tags found */}
                {availableCategories.length === 0 && (
                    <span className="text-xs text-gray-500 py-1.5 italic">
                        {availableCategories === null ? "Loading tags..." : "No categories found."}
                    </span>
                )}
            </div>
        </div>
    );
}
