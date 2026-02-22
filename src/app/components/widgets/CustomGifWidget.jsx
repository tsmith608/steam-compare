"use client";

import { useCallback, useMemo } from "react";

const DEFAULT_CONFIG = { url: "", caption: "", speed: 1 };

/**
 * CustomGifWidget — Specialized URL-based GIF/Video widget.
 * 
 * Supports:
 * - Direct GIF/MP4/WebM links
 * - Tenor page URLs
 * - GIPHY page URLs
 */
export default function CustomGifWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { url = "", caption = "" } = config;

    const mediaInfo = useMemo(() => {
        if (!url) return null;

        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace("www.", "");

            // Giphy
            if (host.includes("giphy.com")) {
                if (parsed.pathname.includes("/gifs/")) {
                    const parts = parsed.pathname.split("/").filter(Boolean);
                    const id = parts[parts.length - 1].split("-").pop();
                    if (id) {
                        const embedUrl = `https://giphy.com/embed/${id}`;
                        console.log("[GifWidget] Giphy detected:", embedUrl);
                        return { type: "embed", embedUrl };
                    }
                }
                if (parsed.pathname.includes("/embed/")) {
                    console.log("[GifWidget] Giphy embed detected:", url);
                    return { type: "embed", embedUrl: url };
                }
            }

            // Tenor — handles all URL shapes:
            //   tenor.com/view/name-12345       (numeric ID → embed)
            //   tenor.com/name-gif-12345         (numeric ID → embed)
            //   tenor.com/embed/12345            (already embed)
            //   tenor.com/v5fRTw3ZMPc.gif        (short share link → video)
            //   media.tenor.com/abc123/file.mp4  (CDN direct → video)
            if (host.includes("tenor.com")) {
                // Direct GIF share link (e.g. tenor.com/abc.gif) — proxy through server to bypass hotlinking
                if (url.match(/\.gif$/i)) {
                    const proxied = `/api/gif-proxy?url=${encodeURIComponent(url)}`;
                    console.log("[GifWidget] Tenor GIF via proxy:", proxied);
                    return { type: "image", directUrl: proxied };
                }
                // Direct video file from CDN
                if (url.match(/\.(mp4|webm)$/i)) {
                    console.log("[GifWidget] Tenor direct video:", url);
                    return { type: "video", directUrl: url };
                }
                // Already an embed URL
                if (parsed.pathname.startsWith("/embed/")) {
                    console.log("[GifWidget] Tenor embed detected:", url);
                    return { type: "embed", embedUrl: url };
                }
                // Extract trailing numeric ID from any page URL (numeric only — Tenor embed requires this)
                const parts = parsed.pathname.split("/").filter(Boolean);
                const lastPart = parts[parts.length - 1];
                const idMatch = lastPart.match(/(\d+)$/);
                if (idMatch) {
                    const embedUrl = `https://tenor.com/embed/${idMatch[1]}`;
                    console.log("[GifWidget] Tenor page detected:", embedUrl);
                    return { type: "embed", embedUrl };
                }
            }

            console.log("[GifWidget] Falling back to direct media check for:", host);

            // Media extensions
            if (url.match(/\.(mp4|webm|mov)$/i)) {
                return { type: "video", directUrl: url };
            }

            // Assume image/gif
            return { type: "image", directUrl: url };

        } catch (e) {
            return null;
        }
    }, [url]);

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

    function renderMedia(info, isBackground = false) {
        if (!info) return null;

        const baseClass = isBackground
            ? "w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
            : "w-full h-full object-cover";

        if (info.type === "embed") {
            return (
                <iframe
                    src={info.embedUrl}
                    className="w-full h-full border-0 pointer-events-none"
                    allowFullScreen
                />
            );
        }

        if (info.type === "video") {
            return (
                <video
                    src={info.directUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={baseClass}
                />
            );
        }

        return <img src={info.directUrl} alt={caption} referrerPolicy="no-referrer" className={baseClass} />;
    }

    /* ── Edit mode ─────────────────────────────── */
    if (isEditing) {
        return (
            <div className="flex flex-col gap-3 h-full">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        Premium GIF/Video URL
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="Paste Tenor, GIPHY, or MP4 link..."
                        className={`w-full rounded-xl bg-white/5 border text-sm text-white/90
                       placeholder-white/30 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30
                       transition-colors
                       ${!isValidUrl ? "border-red-500/50 focus:ring-red-500/40" : "border-white/10"}`}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        Label <span className="text-white/20">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={caption}
                        onChange={handleCaptionChange}
                        placeholder="Vibe check…"
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white/90
                       placeholder-white/30 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/30
                       transition-colors"
                    />
                </div>

                {url && isValidUrl && (
                    <div className="flex-1 min-h-[120px] rounded-xl overflow-hidden border border-amber-500/20 shadow-lg shadow-amber-500/5 relative group">
                        <div className="absolute top-2 right-2 z-10 bg-amber-500/80 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">PREMIUM</div>
                        {renderMedia(mediaInfo)}
                    </div>
                )}
            </div>
        );
    }

    /* ── View mode ─────────────────────────────── */
    if (!url) {
        return (
            <div className="flex items-center justify-center h-full border border-dashed border-white/5 rounded-xl">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic text-center px-4">Waiting for the vibe...</p>
            </div>
        );
    }

    return (
        <div className="relative h-full flex flex-col group overflow-hidden">
            {/* Subtle Premium Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

            <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
                {renderMedia(mediaInfo, true)}
            </div>

            {/* Premium Indicator Badge */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest">
                    ANIMATED
                </div>
            </div>

            {caption && (
                <div className="absolute bottom-3 left-3 right-3 z-20">
                    <p className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] drop-shadow-lg truncate">
                        {caption}
                    </p>
                </div>
            )}
        </div>
    );
}

CustomGifWidget.defaultConfig = DEFAULT_CONFIG;
