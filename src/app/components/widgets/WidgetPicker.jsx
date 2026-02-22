"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    WIDGET_REGISTRY,
    MAX_CUSTOM_WIDGETS,
    getWidgetType,
} from "./widgetRegistry";

/**
 * WidgetPicker — modal overlay for adding widgets to the dashboard.
 *
 * Built-in widgets already present in the layout show as "Added" (disabled).
 * Custom widgets enforce a max cap (e.g. 8).
 */
export default function WidgetPicker({
    isOpen,
    onClose,
    onAdd, // simplified name
    currentLayout = [],
    maxCustom = MAX_CUSTOM_WIDGETS,
}) {
    // ── Derived data ─────────────────────────────────────
    const { builtinWidgets, customWidgets, premiumWidgets, customCount } = useMemo(() => {
        const builtin = [];
        const custom = [];
        const premium = [];

        Object.entries(WIDGET_REGISTRY).forEach(([type, meta]) => {
            if (meta.category === "builtin") {
                builtin.push({ type, ...meta });
            } else if (meta.category === "premium") {
                premium.push({ type, ...meta });
            } else {
                custom.push({ type, ...meta });
            }
        });

        // Count how many custom/premium widgets are currently placed
        const count = (currentLayout || []).filter((w) => {
            const wType = getWidgetType(w.i);
            const cat = WIDGET_REGISTRY[wType]?.category;
            return wType && (cat === "custom" || cat === "premium");
        }).length;

        return { builtinWidgets: builtin, customWidgets: custom, premiumWidgets: premium, customCount: count };
    }, [currentLayout]);

    console.log(`WidgetPicker stats -> built-in: ${builtinWidgets.length}, premium: ${premiumWidgets.length}, custom: ${customWidgets.length}`);

    const isCustomCapReached = customCount >= maxCustom;

    // ── Built-in widget is already placed? (exact match by type) ──
    // ── Built-in widget is already placed? (exact match by type) ──
    const isBuiltinAdded = (widgetType) => (currentLayout || []).some(w => w.i === widgetType);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ─────────────────────────────────── */}
                    <motion.div
                        key="picker-backdrop"
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* ── Modal ────────────────────────────────────── */}
                    <motion.div
                        key="picker-modal"
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-card w-full max-w-lg max-h-[80vh] overflow-y-auto pointer-events-auto
                         border border-white/10 shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10">
                                <h2 className="text-lg font-semibold text-white">
                                    Add Widget
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg
                             bg-white/5 hover:bg-white/10 text-white/60 hover:text-white
                             transition-colors duration-150"
                                    aria-label="Close"
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M2 2L12 12M12 2L2 12"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-6">
                                {/* ── Premium Widgets ────────────────────── */}
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/60 font-black flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            Premium Widgets
                                        </h3>
                                    </div>
                                    <div className="space-y-2">
                                        {premiumWidgets.length > 0 ? premiumWidgets.map((widget) => {
                                            console.log(`[Picker] Rendering Premium: ${widget.type}`);
                                            return (
                                                <WidgetRow
                                                    key={widget.type}
                                                    icon={widget.icon}
                                                    label={widget.label}
                                                    disabled={isCustomCapReached}
                                                    buttonLevel="premium"
                                                    buttonLabel={isCustomCapReached ? "Limit" : "Add"}
                                                    onAdd={() => onAdd(widget.type)}
                                                />
                                            );
                                        }) : <p className="text-xs text-white/20 italic">No premium widgets found.</p>}
                                    </div>
                                </section>

                                {/* ── Built-in Widgets ──────────────────── */}
                                <section>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                                        Built-in Widgets
                                    </h3>
                                    <div className="space-y-2">
                                        {builtinWidgets.length > 0 ? builtinWidgets.map((widget) => {
                                            console.log(`[Picker] Rendering Built-in: ${widget.type}`);
                                            const added = isBuiltinAdded(widget.type);
                                            return (
                                                <WidgetRow
                                                    key={widget.type}
                                                    icon={widget.icon}
                                                    label={widget.label}
                                                    disabled={added}
                                                    buttonLabel={added ? "Added" : "Add"}
                                                    onAdd={() => onAdd(widget.type)}
                                                />
                                            );
                                        }) : <p className="text-xs text-white/20 italic">No built-in widgets found.</p>}
                                    </div>
                                </section>

                                {/* ── Custom Widgets ────────────────────── */}
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                                            Custom Widgets
                                        </h3>
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isCustomCapReached
                                                ? "bg-red-500/20 text-red-300"
                                                : "bg-white/10 text-white/50"
                                                }`}
                                        >
                                            {customCount}/{maxCustom} custom widgets used
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {customWidgets.length > 0 ? customWidgets.map((widget) => (
                                            <WidgetRow
                                                key={widget.type}
                                                icon={widget.icon}
                                                label={widget.label}
                                                disabled={isCustomCapReached}
                                                buttonLabel={isCustomCapReached ? "Limit" : "Add"}
                                                onAdd={() => onAdd(widget.type)}
                                            />
                                        )) : <p className="text-xs text-white/20 italic">No custom widgets found.</p>}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── Reusable row inside the picker ──────────────────────
function WidgetRow({ icon, label, disabled, buttonLabel, onAdd, buttonLevel }) {
    const isPremium = buttonLevel === 'premium';
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-150 ${disabled
                ? "bg-white/[0.02] opacity-50"
                : "bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
        >
            <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
            <span className="text-sm font-medium text-white/90 flex-1">{label}</span>
            <button
                onClick={onAdd}
                disabled={disabled}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 ${disabled
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : isPremium
                        ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 shadow-lg shadow-amber-500/5"
                        : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200 press"
                    }`}
            >
                {buttonLabel}
            </button>
        </div>
    );
}
