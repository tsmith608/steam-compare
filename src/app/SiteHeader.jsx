"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";

/**
 * Self-aligning header:
 * - Finds <main> and copies its left/right offsets
 * - Recomputes on resize/scroll so it always matches your page container
 * - No changes to page.jsx required
 */
export default function SiteHeader() {
    
  const [pad, setPad] = useState({ left: 24, right: 24 });

  useLayoutEffect(() => {
    const getPads = () => {
      const main = document.querySelector("main");
      if (!main) return { left: 24, right: 24 };
      const rect = main.getBoundingClientRect();
      const left = Math.max(0, Math.round(rect.left));
      const right = Math.max(0, Math.round(window.innerWidth - rect.right));
      return { left, right };
    };

    const compute = () => setPad(getPads());
    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(document.documentElement);
    window.addEventListener("resize", compute, { passive: true });
    window.addEventListener("scroll", compute, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute);
    };
  }, []);

  // Minimal menu; aligns by inline padding set from measurements above
  return (
    <header className="w-full">
      <nav
        className="py-4 flex items-center justify-between"
        style={{ paddingLeft: pad.left, paddingRight: pad.right }}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo/logo.png"
            alt="We Both Play"
            className="h-6 w-auto"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="text-base sm:text-lg font-semibold tracking-tight text-gray-100">
            We Both Play
          </span>
        </Link>

        {/* Right-side links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#features" className="text-gray-300 hover:text-white transition">Features</Link>
          <Link href="/#faq" className="text-gray-300 hover:text-white transition">FAQ</Link>
          {/* <Link href="/blog" className="text-gray-300 hover:text-white transition">Blog</Link> */}
        </div>

        {/* Mobile menu (super light) */}
        <details className="md:hidden relative">
          <summary className="list-none inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-100 hover:bg-white/10 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-gray-100">
            <Link href="/#features" className="block px-2 py-2 rounded-lg hover:bg-white/10">Features</Link>
            <Link href="/#faq" className="block px-2 py-2 rounded-lg hover:bg-white/10">FAQ</Link>
            <Link href="/blog" className="block px-2 py-2 rounded-lg hover:bg-white/10">Blog</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
