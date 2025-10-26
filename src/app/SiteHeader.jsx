"use client";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [pad, setPad] = useState({ left: 24, right: 24 });

  useLayoutEffect(() => {
    const compute = () => {
      const main = document.querySelector("main");
      if (!main) return setPad({ left: 24, right: 24 });
      const r = main.getBoundingClientRect();
      setPad({ left: Math.max(0, Math.round(r.left)), right: Math.max(0, Math.round(window.innerWidth - r.right)) });
    };
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

  const goHome = (e) => {
    e.preventDefault();

    const smoothToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        // Try to focus the first landing input if it exists
        const firstInput = document.querySelector('main input[placeholder*="Steam64"], main input');
        firstInput?.focus();
      }, 300);
    };

    if (pathname !== "/") {
      // Different route -> navigate home then scroll
      router.push("/");
      setTimeout(smoothToTop, 0);
      return;
    }

    // We are already on "/", decide if we're on results or landing.
    // If a "Compare Again" button exists, we’re on results. Hard reload to clear state.
    const compareAgain = Array.from(document.querySelectorAll("button"))
      .find((b) => /compare again/i.test(b.textContent || ""));
    if (compareAgain) {
      window.location.replace("/"); // resets state -> landing
      return;
    }

    // Already on landing -> just scroll/focus
    smoothToTop();
  };

  return (
    <header className="w-full">
      <nav className="py-4 flex items-center justify-between" style={{ paddingLeft: pad.left, paddingRight: pad.right }}>
        {/* Brand acts as "return to top/landing" */}
        <a href="/" onClick={goHome} className="flex items-center gap-2" aria-label="We Both Play — Home">
          <img src="/logo.png" className="h-6 w-auto" onError={(e) => (e.currentTarget.style.display = "none")} />
          <span className="text-base sm:text-lg font-semibold tracking-tight text-gray-100">We Both Play</span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#features" className="text-gray-300 hover:text-white transition">Features</Link>
          <Link href="/#faq" className="text-gray-300 hover:text-white transition">FAQ</Link>
          <Link href="/blog" className="text-gray-300 hover:text-white transition">Blog</Link>
        </div>

        <details className="md:hidden relative">
          <summary className="list-none inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-100 hover:bg-white/10 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
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
