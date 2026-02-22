/**
 * Widget Registry — Central contract for the customizable dashboard.
 * 
 * Every widget (built-in and custom) is registered here with its metadata.
 * The DEFAULT_LAYOUT defines the starting grid positions for new users.
 * 
 * Grid: 12 columns, rows auto-sized.
 * w/h are in grid units (1 unit = 1 column, 1 row).
 */

// ─── Widget Definitions ───────────────────────────────────────

export const WIDGET_REGISTRY = {
    // Built-in widgets (data-driven, always available)
    playtime: {
        label: "Playtime",
        icon: "⏱️",
        category: "builtin",
        defaultW: 2,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 4,
        maxH: 2,
    },
    library: {
        label: "Library",
        icon: "📚",
        category: "builtin",
        defaultW: 2,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 4,
        maxH: 2,
    },
    socials: {
        label: "Socials",
        icon: "🌐",
        category: "builtin",
        defaultW: 4,
        defaultH: 1,
        minW: 3,
        minH: 1,
        maxW: 8,
        maxH: 2,
    },
    mostPlayed: {
        label: "Most Played",
        icon: "🏆",
        category: "builtin",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },
    favorites: {
        label: "Favorites",
        icon: "📌",
        category: "builtin",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 8,
        maxH: 2,
    },
    achievements: {
        label: "Achievements",
        icon: "🎖️",
        category: "builtin",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 8,
        maxH: 2,
    },
    collections: {
        label: "Collections",
        icon: "📂",
        category: "builtin",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },
    statRings: {
        label: "Stat Breakdown",
        icon: "📊",
        category: "builtin",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },
    heatmap: {
        label: "Activity",
        icon: "🔥",
        category: "builtin",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 8,
        maxH: 2,
    },
    quickNav: {
        label: "Quick Nav",
        icon: "🧭",
        category: "builtin",
        defaultW: 4,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },

    // Custom widgets (user-created content)
    customText: {
        label: "Text Block",
        icon: "📝",
        category: "custom",
        defaultW: 4,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 12,
        maxH: 3,
    },
    customImage: {
        label: "Image",
        icon: "🖼️",
        category: "custom",
        defaultW: 4,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 12,
        maxH: 3,
    },
    customEmbed: {
        label: "Video Embed",
        icon: "▶️",
        category: "custom",
        defaultW: 4,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 4,
    },
    customGif: {
        label: "GIF / Motion",
        icon: "🎬",
        category: "premium",
        defaultW: 4,
        defaultH: 2,
        minW: 2,
        minH: 1,
        maxW: 8,
        maxH: 4,
    },
    customMusic: {
        label: "Spotify / Music",
        icon: "🎵",
        category: "premium",
        defaultW: 4,
        defaultH: 1,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },
    customClock: {
        label: "Digital Clock",
        icon: "🕒",
        category: "premium",
        defaultW: 4,
        defaultH: 1,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },
    customCountdown: {
        label: "Countdown",
        icon: "⌛",
        category: "premium",
        defaultW: 4,
        defaultH: 1,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
    },
};

// ─── Default Layout ───────────────────────────────────────────
// Matches the current 3-row bento grid (12 cols)
// Row 0: Playtime(2) + Library(2) + Socials(4) + MostPlayed(4)
// Row 1: Favorites(4) + Achievements(4) + Collections(4)
// Row 2: StatRings(4) + Heatmap(4) + QuickNav(4)

export const DEFAULT_LAYOUT = [
    { i: "playtime", x: 0, y: 0, w: 2, h: 1 },
    { i: "library", x: 2, y: 0, w: 2, h: 1 },
    { i: "socials", x: 4, y: 0, w: 4, h: 1 },
    { i: "mostPlayed", x: 8, y: 0, w: 4, h: 1 },
    { i: "favorites", x: 0, y: 1, w: 4, h: 2 },
    { i: "achievements", x: 4, y: 1, w: 4, h: 2 },
    { i: "collections", x: 8, y: 1, w: 4, h: 2 },
    { i: "statRings", x: 0, y: 3, w: 4, h: 2 },
    { i: "heatmap", x: 4, y: 3, w: 4, h: 2 },
    { i: "quickNav", x: 8, y: 3, w: 4, h: 1 },
];

// ─── Limits ───────────────────────────────────────────────────

export const MAX_CUSTOM_WIDGETS = 8;

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Generate a unique ID for a custom widget instance.
 * e.g. "customText-a3f9x2"
 */
export function generateWidgetId(widgetType) {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${widgetType}-${suffix}`;
}

/**
 * Look up the base widget type from an instance ID.
 * "customText-a3f9x2" → "customText"
 * "playtime" → "playtime"
 */
export function getWidgetType(instanceId) {
    // Check if it's a direct match first (built-in)
    if (WIDGET_REGISTRY[instanceId]) return instanceId;
    // Otherwise strip the suffix for custom widgets
    const base = instanceId.replace(/-[a-z0-9]+$/, "");
    return WIDGET_REGISTRY[base] ? base : null;
}

/**
 * Get registry metadata for a widget instance.
 */
export function getWidgetMeta(instanceId) {
    const type = getWidgetType(instanceId);
    return type ? WIDGET_REGISTRY[type] : null;
}
