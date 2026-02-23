"use client";
import React from "react";

/**
 * WidgetWrapper – wraps every widget in the dashboard grid.
 *
 * Always applies glass-card + glow-border styling.
 * In customize mode it shows a drag handle and a remove button.
 */
export default function WidgetWrapper({
    widgetId,
    isCustomizing = false,
    noPadding = false,
    compact = false,
    currentSize = 'M',
    onSizeChange,
    onRemove,
    children,
}) {
    return (
        <div
            className={`glass-card glow-border overflow-hidden h-full relative${isCustomizing
                ? " border-2 !border-dashed !border-blue-500/50 ring-1 ring-blue-500/20"
                : ""
                }`}
        >
            {/* ── Customization Controls ────────────────────────── */}
            {isCustomizing && (
                <>
                    {/* Drag handle — react-grid-layout uses .drag-handle */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 backdrop-blur-sm p-1 bg-black/40 rounded-lg border border-white/10">
                        <button
                            className="drag-handle flex items-center justify-center
                           w-7 h-7 rounded-md bg-white/10 hover:bg-white/20
                           text-white/60 hover:text-white cursor-grab active:cursor-grabbing
                           transition-colors duration-150"
                            title="Drag to reposition"
                            aria-label="Drag handle"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="4" cy="3" r="1.25" fill="currentColor" />
                                <circle cx="10" cy="3" r="1.25" fill="currentColor" />
                                <circle cx="4" cy="7" r="1.25" fill="currentColor" />
                                <circle cx="10" cy="7" r="1.25" fill="currentColor" />
                                <circle cx="4" cy="11" r="1.25" fill="currentColor" />
                                <circle cx="10" cy="11" r="1.25" fill="currentColor" />
                            </svg>
                        </button>

                        <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

                        <div className="flex bg-black/40 rounded-md p-0.5 border border-white/5">
                            {['S', 'M', 'L'].map((sz) => (
                                <button
                                    key={sz}
                                    onClick={() => onSizeChange?.(sz)}
                                    className={`
                                        w-6 h-6 flex items-center justify-center text-[10px] font-black rounded
                                        transition-all duration-200
                                        ${currentSize === sz
                                            ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                            : 'text-white/40 hover:text-white hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {sz}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Remove button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove?.(widgetId);
                        }}
                        className="absolute top-2 right-2 z-10 flex items-center justify-center
                       w-7 h-7 rounded-md bg-red-500/20 hover:bg-red-500/40
                       text-red-300 hover:text-red-100
                       transition-colors duration-150 backdrop-blur-sm shadow-lg shadow-black/20"
                        title="Remove widget"
                        aria-label="Remove widget"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2 2L10 10M10 2L2 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </>
            )}

            {/* ── Widget Content ────────────────────────────────── */}
            <div className={`relative z-1 h-full flex flex-col ${noPadding ? 'p-0' : compact ? (isCustomizing ? 'px-3 pb-3 pt-0' : 'p-3') : isCustomizing ? 'px-4 pb-4 pt-0' : 'p-4'}`}>
                {children}
            </div>
        </div>
    );
}
