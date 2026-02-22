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
                    <button
                        className="drag-handle absolute top-2 left-2 z-10 flex items-center justify-center
                       w-7 h-7 rounded-md bg-white/10 hover:bg-white/20
                       text-white/60 hover:text-white cursor-grab active:cursor-grabbing
                       transition-colors duration-150 backdrop-blur-sm"
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

                    {/* Remove button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove?.(widgetId);
                        }}
                        className="absolute top-2 right-2 z-10 flex items-center justify-center
                       w-7 h-7 rounded-md bg-red-500/20 hover:bg-red-500/40
                       text-red-300 hover:text-red-100
                       transition-colors duration-150 backdrop-blur-sm"
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
            <div className={`relative z-1 h-full flex flex-col ${isCustomizing ? 'p-10' : 'p-5'}`}>
                {children}
            </div>
        </div>
    );
}
