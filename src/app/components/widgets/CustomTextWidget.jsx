"use client";

import { useCallback } from "react";

const DEFAULT_CONFIG = { content: "" };

/**
 * CustomTextWidget — A user-editable text block widget.
 *
 * View mode:  Renders config.content as pre-wrapped text with clickable links.
 * Edit mode:  Shows a textarea bound to config.content.
 */
export default function CustomTextWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { content = "" } = config;

    const handleChange = useCallback(
        (e) => onConfigChange({ ...config, content: e.target.value }),
        [config, onConfigChange]
    );

    /* ── Edit mode ─────────────────────────────── */
    if (isEditing) {
        return (
            <div className="flex flex-col gap-2 h-full">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    Text Content
                </label>
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder="Type something…"
                    className="flex-1 w-full resize-none rounded-xl bg-white/5 border border-white/10
                     text-sm text-white/90 placeholder-white/30 p-3
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30
                     transition-colors"
                />
            </div>
        );
    }

    /* ── View mode ─────────────────────────────── */
    return (
        <div className="h-full overflow-auto custom-scrollbar">
            {content ? (
                <p className="text-sm text-white/80 whitespace-pre-wrap break-words leading-relaxed">
                    <Linkify text={content} />
                </p>
            ) : (
                <p className="text-sm text-white/30 italic">No content yet.</p>
            )}
        </div>
    );
}

/* ── Tiny linkifier ──────────────────────────── */
const URL_RE =
    /(https?:\/\/[^\s<]+[^\s<.,;:!?"')}\]])/g;

function Linkify({ text }) {
    const parts = text.split(URL_RE);
    return parts.map((part, i) =>
        URL_RE.test(part) ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
                {part}
            </a>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

CustomTextWidget.defaultConfig = DEFAULT_CONFIG;
