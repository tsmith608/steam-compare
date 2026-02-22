"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const DEFAULT_CONFIG = { targetDate: "", eventTitle: "Big Release" };

/**
 * CustomCountdownWidget — Countdown to a specific date/event.
 */
export default function CustomCountdownWidget({
    config = DEFAULT_CONFIG,
    isEditing,
    onConfigChange,
}) {
    const { targetDate = "", eventTitle = "Big Release" } = config;
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        if (!targetDate) return null;
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { expired: true };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const handleDateChange = useCallback(
        (e) => onConfigChange({ ...config, targetDate: e.target.value }),
        [config, onConfigChange]
    );

    const handleTitleChange = useCallback(
        (e) => onConfigChange({ ...config, eventTitle: e.target.value }),
        [config, onConfigChange]
    );

    /* ── Edit mode ─────────────────────────────── */
    if (isEditing) {
        return (
            <div className="flex flex-col gap-3 h-full">
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            Event Title
                        </label>
                        <input
                            type="text"
                            value={eventTitle}
                            onChange={handleTitleChange}
                            placeholder="e.g. GTA VI Launch"
                            className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            Target Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={targetDate}
                            onChange={handleDateChange}
                            className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex items-center justify-center rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    {timeLeft && !timeLeft.expired ? (
                        <div className="text-center">
                            <div className="text-xs font-black text-emerald-500/60 uppercase tracking-widest mb-1">{eventTitle}</div>
                            <div className="flex gap-2 text-xl font-black text-white tabular-nums">
                                <div className="flex flex-col"><span className="leading-none">{timeLeft.days}</span><span className="text-[8px] text-gray-500">DAYS</span></div>
                                <div className="opacity-20">:</div>
                                <div className="flex flex-col"><span className="leading-none">{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-[8px] text-gray-500">HRS</span></div>
                                <div className="opacity-20">:</div>
                                <div className="flex flex-col"><span className="leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-[8px] text-gray-500">MIN</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Set a target date</div>
                    )}
                </div>
            </div>
        );
    }

    /* ── View mode ─────────────────────────────── */
    if (!targetDate || (timeLeft && timeLeft.expired)) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="text-emerald-500 text-2xl mb-2 flex items-center gap-2">
                    🥳 <span className="text-xs font-black uppercase tracking-widest">Completed</span>
                </div>
                <div className="text-sm font-black text-white uppercase tracking-tight">{eventTitle}</div>
                <div className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Event has reached its destination.</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 group">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 group-hover:scale-110 transition-transform">
                {eventTitle}
            </div>

            <div className="flex items-start gap-4 tabular-nums">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white tracking-tighter leading-none">{timeLeft.days}</span>
                    <span className="text-[9px] font-bold text-gray-500 mt-1">DAYS</span>
                </div>
                <div className="text-2xl font-black text-white/20 pt-1">:</div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white tracking-tighter leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-gray-500 mt-1">HOURS</span>
                </div>
                <div className="text-2xl font-black text-white/20 pt-1 hidden sm:block">:</div>
                <div className="flex flex-col items-center hidden sm:flex">
                    <span className="text-4xl font-black text-white tracking-tighter leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-gray-500 mt-1">MINS</span>
                </div>
            </div>

            <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
            </div>
        </div>
    );
}

CustomCountdownWidget.defaultConfig = DEFAULT_CONFIG;
