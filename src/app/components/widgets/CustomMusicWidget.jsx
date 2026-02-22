"use client";

import { useCallback, useMemo } from "react";

const DEFAULT_CONFIG = { url: "", embedType: null };

/**
 * Attempt to extract an embed type + embed URL from user input for music.
 * Supports Spotify and SoundCloud.
 */
function parseMusicUrl(raw) {
    if (!raw) return null;

    try {
        const url = new URL(raw);
        const host = url.hostname.replace(/^www\./, "");

        // Spotify: open.spotify.com/track/ID | open.spotify.com/playlist/ID | open.spotify.com/album/ID
        if (host === "open.spotify.com") {
            const parts = url.pathname.split("/").filter(Boolean);
            if (parts.length >= 2) {
                const type = parts[0]; // track, album, playlist
                const id = parts[1];
                return {
                    embedType: "spotify",
                    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
                };
            }
        }

        // SoundCloud: soundcloud.com/USER/TRACK
        if (host === "soundcloud.com") {
            // SoundCloud embeds are usually better via their iframe generator, 
            // but we can try to wrap the URL in their standard player.
            // Note: SoundCloud API/Widget usually requires the full URL.
            return {
                embedType: "soundcloud",
                embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
            };
        }
    } catch {
        // malformed URL
    }

    return null;
}

/**
 * CustomMusicWidget — Spotify/SoundCloud embed with premium feel.
 */
export default function CustomMusicWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { url = "" } = config;

    const parsed = useMemo(() => parseMusicUrl(url), [url]);

    const handleUrlChange = useCallback(
        (e) => {
            const newUrl = e.target.value;
            const result = parseMusicUrl(newUrl);
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
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        Music URL (Spotify/SoundCloud)
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="Paste track or playlist link..."
                        className={`w-full rounded-xl bg-white/5 border text-sm text-white/90
                       placeholder-white/30 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30
                       transition-colors
                       ${isUnsupported ? "border-red-500/50 focus:ring-red-500/40" : "border-white/10"}`}
                    />
                    {isUnsupported && (
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-tighter mt-1">
                            Unsupported Music URL. Spotify & SoundCloud only.
                        </p>
                    )}
                    {parsed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 mt-1 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {parsed.embedType} Loaded
                        </span>
                    )}
                </div>

                {/* Preview */}
                {parsed && (
                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                        <iframe
                            src={parsed.embedUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title="Music preview"
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
            <div className="flex items-center justify-center h-full border border-dashed border-white/5 rounded-xl">
                <div className="text-center px-4">
                    <span className="text-2xl mb-2 block">🎵</span>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Silent for now...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl overflow-hidden glass-card shadow-2xl border border-white/5">
            <iframe
                src={parsed.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`${parsed.embedType} player`}
                className="w-full h-full border-0"
            />
        </div>
    );
}

CustomMusicWidget.defaultConfig = DEFAULT_CONFIG;
