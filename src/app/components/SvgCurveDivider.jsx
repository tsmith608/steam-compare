"use client";
import React, { useEffect, useRef, useState } from 'react';

const SvgCurveDivider = ({ flip = false, color = "rgba(255, 255, 255, 0.05)" }) => {
    const curveRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const $curve = curveRef.current;
        const $container = containerRef.current;
        if (!$curve || !$container) return;

        let ticking = false;
        const defaultCurveValue = 350;
        const curveRate = 3;

        const updateCurve = () => {
            const rect = $container.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // We want to animate when the divider is coming into or leaving the viewport
            // The logic from the snippet: curveValue = defaultCurveValue - parseFloat(scrollPos / curveRate)
            // We'll adapt it to relative scroll position within the section proximity

            const scrollPos = viewHeight - rect.top; // Distance from bottom of viewport to top of divider

            if (scrollPos >= 0 && scrollPos < 1000) {
                const curveValue = defaultCurveValue - parseFloat(scrollPos / curveRate);
                const path = `M 800 300 Q 400 ${curveValue} 0 300 L 0 0 L 800 0 L 800 300 Z`;
                $curve.setAttribute("d", path);
            }

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateCurve);
                ticking = true;
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        updateCurve(); // Initial call

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute top-0 left-0 right-0 z-0 pointer-events-none overflow-hidden ${flip ? 'rotate-180' : ''}`}
            style={{ height: '300px', transform: flip ? 'rotate(180deg) translateY(1px)' : 'translateY(-1px)' }}
        >
            <svg
                viewBox="0 0 800 400"
                preserveAspectRatio="none"
                className="w-full h-full opacity-70"
                style={{ filter: 'drop-shadow(0 -1px 0 rgba(255,255,255,0.1))' }}
            >
                <path
                    id="curve"
                    ref={curveRef}
                    fill={color}
                    d="M 800 300 Q 400 350 0 300 L 0 0 L 800 0 L 800 300 Z"
                    style={{ transition: 'd 0.1s ease-out' }}
                />
            </svg>
            <div
                className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"
                style={{ mixBlendMode: 'overlay' }}
            />
        </div>
    );
};

export default SvgCurveDivider;
