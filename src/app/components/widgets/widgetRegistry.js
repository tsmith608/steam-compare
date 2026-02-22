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

// ─── Size Presets ──────────────────────────────────────────────
// ─── Universal Size Presets ────────────────────────────────────
export const UNIVERSAL_SIZES = {
    S: { w: 3, h: 2 },
    M: { w: 4, h: 3 },
    L: { w: 6, h: 4 },
    XL: { w: 12, h: 4 }
};

export const WIDGET_REGISTRY = {
    // Built-in widgets
    playtime: {
        label: "Playtime",
        icon: "⏱️",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 6,
        presets: UNIVERSAL_SIZES
    },
    library: {
        label: "Library",
        icon: "📚",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 6,
        presets: UNIVERSAL_SIZES
    },
    socials: {
        label: "Socials",
        icon: "🌐",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 6,
        presets: UNIVERSAL_SIZES
    },
    mostPlayed: {
        label: "Most Played",
        icon: "🏆",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 2,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    favorites: {
        label: "Favorites",
        icon: "📌",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    achievements: {
        label: "Achievements",
        icon: "🎖️",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    collections: {
        label: "Collections",
        icon: "📂",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    statRings: {
        label: "Stat Breakdown",
        icon: "📊",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    heatmap: {
        label: "Activity",
        icon: "🔥",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 2,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    quickNav: {
        label: "Quick Nav",
        icon: "🧭",
        category: "builtin",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 6,
        presets: UNIVERSAL_SIZES
    },

    // Custom widgets
    customText: {
        label: "Text Block",
        icon: "📝",
        category: "custom",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    customImage: {
        label: "Image",
        icon: "🖼️",
        category: "custom",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 12,
        presets: UNIVERSAL_SIZES
    },
    customEmbed: {
        label: "Video Embed",
        icon: "▶️",
        category: "custom",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 12,
        presets: UNIVERSAL_SIZES
    },
    customGif: {
        label: "GIF / Motion",
        icon: "🎬",
        category: "premium",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 12,
        presets: UNIVERSAL_SIZES
    },
    customMusic: {
        label: "Spotify / Music",
        icon: "🎵",
        category: "premium",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
    customClock: {
        label: "Digital Clock",
        icon: "🕒",
        category: "premium",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 6,
        presets: UNIVERSAL_SIZES
    },
    customCountdown: {
        label: "Countdown",
        icon: "⌛",
        category: "premium",
        defaultW: 3,
        defaultH: 2,
        minW: 3,
        minH: 1,
        maxW: 12,
        maxH: 6,
        presets: UNIVERSAL_SIZES
    },
    customInventory: {
        label: "Steam Inventory",
        icon: "🎒",
        category: "premium",
        defaultW: 6,
        defaultH: 4,
        minW: 4,
        minH: 3,
        maxW: 12,
        maxH: 12,
        presets: UNIVERSAL_SIZES
    },
    customDiscord: {
        label: "Discord Active",
        icon: "💬",
        category: "social",
        defaultW: 3,
        defaultH: 4,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 8,
        presets: UNIVERSAL_SIZES
    },
};

// ─── Default Layout ───────────────────────────────────────────
// Standardized to 3x2 blocks (4 per row on 12-col grid)
export const DEFAULT_LAYOUT = [
    { i: "playtime", x: 0, y: 0, w: 3, h: 2 },
    { i: "library", x: 3, y: 0, w: 3, h: 2 },
    { i: "socials", x: 6, y: 0, w: 3, h: 2 },
    { i: "mostPlayed", x: 9, y: 0, w: 3, h: 2 },
    { i: "favorites", x: 0, y: 2, w: 3, h: 2 },
    { i: "achievements", x: 3, y: 2, w: 3, h: 2 },
    { i: "collections", x: 6, y: 2, w: 3, h: 2 },
    { i: "statRings", x: 9, y: 2, w: 3, h: 2 },
    { i: "heatmap", x: 0, y: 4, w: 3, h: 2 },
    { i: "quickNav", x: 3, y: 4, w: 3, h: 2 },
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
