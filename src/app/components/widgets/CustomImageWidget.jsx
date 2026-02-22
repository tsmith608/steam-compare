"use client";

import { useCallback, useMemo } from "react";

const DEFAULT_CONFIG = { url: "", caption: "" };

/**
 * CustomImageWidget — URL-based image embed with optional caption.
 *
 * View mode:  Renders <img> with object-cover + caption.
 * Edit mode:  URL input + caption input, validates http(s).
 */
export default function CustomImageWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { url = "", caption = "" } = config;

    const isValidUrl = useMemo(
        () => url === "" || /^https?:\/\//i.test(url),
        [url]
    );

    const handleUrlChange = useCallback(
        (e) => onConfigChange({ ...config, url: e.target.value }),
        [config, onConfigChange]
    );

    const handleCaptionChange = useCallback(
        (e) => onConfigChange({ ...config, caption: e.target.value }),
        [config, onConfigChange]
    );

    /* ── Edit mode ─────────────────────────────── */
    if (isEditing) {
        return (
            <div className="flex flex-col gap-3 h-full">
                {/* URL field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Image URL
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="https://example.com/image.png"
                        className={`w-full rounded-xl bg-white/5 border text-sm text-white/90
                       placeholder-white/30 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30
                       transition-colors
                       ${!isValidUrl ? "border-red-500/50 focus:ring-red-500/40" : "border-white/10"}`}
                    />
                    {!isValidUrl && (
                        <p className="text-xs text-red-400">
                            URL must start with http:// or https://
                        </p>
                    )}
                </div>

                {/* Caption field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Caption <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={caption}
                        onChange={handleCaptionChange}
                        placeholder="A short description…"
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white/90
                       placeholder-white/30 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30
                       transition-colors"
                    />
                </div>

                {/* Live preview */}
                {url && isValidUrl && (
                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/5">
                        <img
                            src={url}
                            alt={caption || "Preview"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>
        );
    }

    /* ── View mode ─────────────────────────────── */
    if (!url) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-white/30 italic">No image set.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
                <img
                    src={url}
                    alt={caption || "User image"}
                    className="w-full h-full object-cover"
                />
            </div>
            {caption && (
                <p className="mt-2 text-xs text-white/50 text-center truncate">
                    {caption}
                </p>
            )}
        </div>
    );
}

CustomImageWidget.defaultConfig = DEFAULT_CONFIG;
