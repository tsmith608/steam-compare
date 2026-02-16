"use client";

import Script from "next/script";

export default function GoogleAdSense({ isPremium }) {
    if (isPremium) return null;

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1052603673324905"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
