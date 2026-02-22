"use client";

import { useCallback, useMemo } from "react";

const DEFAULT_CONFIG = { url: "", embedType: null };

/* ── URL parsing helpers ──────────────────────── */

/**
 * Attempt to extract an embed type + embed URL from user input.
 * Returns { embedType, embedUrl } or null if unsupported.
 */
function parseEmbedUrl(raw) {
    if (!raw) return null;

    try {
        const url = new URL(raw);
        const host = url.hostname.replace(/^www\./, "");

        // YouTube: youtube.com/watch?v=ID | youtu.be/ID | youtube.com/embed/ID
        if (host === "youtube.com" || host === "youtu.be") {
            let videoId = null;

            if (host === "youtu.be") {
                videoId = url.pathname.slice(1);
            } else if (url.pathname === "/watch") {
                videoId = url.searchParams.get("v");
            } else {
                const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);
                if (embedMatch) videoId = embedMatch[1];
            }

            if (videoId) {
                return {
                    embedType: "youtube",
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                };
            }
        }

        // Twitch: twitch.tv/CHANNEL
        if (host === "twitch.tv") {
            const channel = url.pathname.split("/").filter(Boolean)[0];
            if (channel) {
                return {
                    embedType: "twitch",
                    embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=localhost`,
                };
            }
        }
    } catch {
        // malformed URL — fall through
    }

    return null;
}

const SUPPORTED_LABEL = "Supports YouTube and Twitch links only.";

/**
 * CustomEmbedWidget — Sandboxed video embed for YouTube/Twitch.
 *
 * View mode:  Renders a sandboxed <iframe> for the detected platform.
 * Edit mode:  URL input with auto-detection and friendly error messaging.
 */
export default function CustomEmbedWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { url = "" } = config;

    const parsed = useMemo(() => parseEmbedUrl(url), [url]);

    const handleUrlChange = useCallback(
        (e) => {
            const newUrl = e.target.value;
            const result = parseEmbedUrl(newUrl);
            onConfigChange({
                url: newUrl,
                embedType: result ? result.embedType : null,
            });
        },
        [onConfigChange]
    );

    const hasInput = url.trim().length > 0;
    const isUnsupported = hasInput && !parsed;

    /* ── Edit mode ─────────────────────────────── */
    if (isEditing) {
        return (
            <div className="flex flex-col gap-3 h-full">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Video URL
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="https://www.youtube.com/watch?v=…"
                        className={`w-full rounded-xl bg-white/5 border text-sm text-white/90
                       placeholder-white/30 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30
                       transition-colors
                       ${isUnsupported ? "border-red-500/50 focus:ring-red-500/40" : "border-white/10"}`}
                    />
                    {isUnsupported && (
                        <p className="text-xs text-red-400">
                            Unsupported URL. {SUPPORTED_LABEL}
                        </p>
                    )}
                    {!isUnsupported && (
                        <p className="text-xs text-white/30">{SUPPORTED_LABEL}</p>
                    )}
                    {parsed && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Detected: {parsed.embedType === "youtube" ? "YouTube" : "Twitch"}
                        </span>
                    )}
                </div>

                {/* Live preview */}
                {parsed && (
                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/5">
                        <iframe
                            src={parsed.embedUrl}
                            title="Video preview"
                            sandbox="allow-scripts allow-same-origin"
                            allowFullScreen
                            className="w-full h-full border-0"
                        />
                    </div>
                )}
            </div>
        );
    }

    /* ── View mode ─────────────────────────────── */
    if (!parsed) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-white/30 italic">
                    {isUnsupported ? "Unsupported video URL." : "No video set."}
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl overflow-hidden">
            <iframe
                src={parsed.embedUrl}
                title={`${parsed.embedType} embed`}
                sandbox="allow-scripts allow-same-origin"
                allowFullScreen
                className="w-full h-full border-0"
            />
        </div>
    );
}

CustomEmbedWidget.defaultConfig = DEFAULT_CONFIG;
