"use client";
import { useEffect, useRef } from "react";

export default function GoogleAdSense({ isPremium, slot, className = "" }) {
    const adRef = useRef(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined" || isPremium || !adRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && !initialized.current) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        initialized.current = true;
                        observer.disconnect();
                    } catch (err) {
                        console.error("AdSense error:", err);
                    }
                }
            }
        });

        observer.observe(adRef.current);
        return () => observer.disconnect();
    }, [isPremium, slot]);

    if (isPremium) return null;

    return (
        <div className={`adsense-container min-h-[90px] w-full flex justify-center ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-5774226834741887"
                data-ad-slot={slot || "8627342981"} // Default slot if none provided
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
}
