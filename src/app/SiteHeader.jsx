"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [steamUser, setSteamUser] = useState({ steamid: null, name: null, avatar: null });

  useEffect(() => {
    // 1. Check URL params
    const urlId = searchParams.get("steamid");
    const urlName = searchParams.get("name");
    const urlAvatar = searchParams.get("avatar");

    if (urlId) {
      // Save to storage
      sessionStorage.setItem("wb.steamid", urlId);
      if (urlName) sessionStorage.setItem("wb.username", urlName);
      if (urlAvatar) sessionStorage.setItem("wb.avatar", urlAvatar);

      setSteamUser({ steamid: urlId, name: urlName, avatar: urlAvatar });
    } else {
      // 2. Fallback to storage
      const sId = sessionStorage.getItem("wb.steamid");
      const sName = sessionStorage.getItem("wb.username");
      const sAvatar = sessionStorage.getItem("wb.avatar");

      if (sId) {
        setSteamUser({ steamid: sId, name: sName, avatar: sAvatar });
      } else {
        setSteamUser({ steamid: null, name: null, avatar: null });
      }
    }
  }, [searchParams]);

  const { steamid, name: userName, avatar: userAvatar } = steamUser;

  const handleSignOut = () => {
    // Clear Session
    sessionStorage.removeItem("wb.steamid");
    sessionStorage.removeItem("wb.username");
    sessionStorage.removeItem("wb.avatar");
    setSteamUser({ steamid: null, name: null, avatar: null });

    // Force hard redirect to home to ensure all components clear their state
    window.location.href = "/";
  };

  const goHome = (e) => {
    if (e) e.preventDefault();
    setIsMenuOpen(false);
    setIsAboutOpen(false);

    const smoothToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        // Try to focus the first landing input if it exists
        const firstInput = document.querySelector('main input[placeholder*="Steam64"], main input');
        firstInput?.focus();
      }, 300);
    };

    if (pathname !== "/") {
      router.push("/");
      // Next.js router.push doesn't guarantee the page has rendered, 
      // but usually, it's fast enough for a small delay or just relying on browser default for new pages.
      // However, for consistency:
      setTimeout(smoothToTop, 100);
      return;
    }

    // Already on "/", check for results view
    const compareAgain = Array.from(document.querySelectorAll("button"))
      .find((b) => /compare again/i.test(b.textContent || ""));

    if (compareAgain) {
      window.location.replace("/"); // Hard reset to landing
      return;
    }

    smoothToTop();
  };

  const goFAQ = (e) => {
    if (e) e.preventDefault();
    setIsMenuOpen(false);
    setIsAboutOpen(false);

    const scrollToFAQ = () => {
      const faqSection = document.getElementById("faq");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (pathname !== "/") {
      router.push("/#faq");
      // Small timeout to allow hydration if it's a cold load, 
      // though Next usually handles hash-links via router.
      setTimeout(scrollToFAQ, 100);
      return;
    }

    scrollToFAQ();
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAboutOpen(false);
  }, [pathname, searchParams]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <header className="w-full relative z-40">
      <nav className="py-4 flex items-center justify-between max-w-7xl mx-auto px-6">

        {/* Left Section: Hamburger + Brand */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Trigger - Visible on ALL screens as requested */}
          <button
            onClick={toggleMenu}
            className="p-2 -ml-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Brand */}
          <a href="/" onClick={goHome} className="flex items-center gap-3" aria-label="We Both Play — Home">
            <img src="/logo.png" className="h-6 w-auto" onError={(e) => (e.currentTarget.style.display = "none")} />
            <span className="text-base sm:text-lg font-semibold tracking-tight text-gray-100 hidden sm:inline">We Both Play</span>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-gray-100 sm:hidden">WBP</span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/commands" className="text-gray-300 hover:text-white transition">Commands</Link>

          {/* About Dropdown */}
          <div className="relative group"
            onMouseEnter={() => setIsAboutOpen(true)}
            onMouseLeave={() => setIsAboutOpen(false)}>
            <button
              className="flex items-center gap-1 text-gray-300 hover:text-white transition py-2"
              onClick={() => router.push('/about')}
            >
              About
              <svg className={`w-4 h-4 transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`absolute top-full left-0 w-48 py-2 mt-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transition-all duration-200 origin-top-left ${isAboutOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
              <Link href="/about" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition">Our Mission</Link>
              <Link href="/blog" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition">Blog</Link>
              <a href="/#faq" onClick={goFAQ} className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition">FAQ</a>
              <Link href="/contact" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition border-t border-white/5 mt-1">Contact Us</Link>
            </div>
          </div>

          <Link href={`/upgrade?${searchParams.toString()}`} className="text-amber-400 hover:text-amber-300 transition font-medium">Premium</Link>

          {steamid && (
            <Link href={`/dashboard?${searchParams.toString()}`} className="text-blue-400 hover:text-blue-300 transition font-medium">Dashboard</Link>
          )}

          {steamid ? (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <img src={userAvatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-blue-500/50" />
              <div className="flex flex-col">
                <span className="text-white font-bold leading-tight max-w-[100px] truncate">{userName}</span>
                <button
                  onClick={handleSignOut}
                  className="text-[10px] text-gray-400 hover:text-red-400 uppercase tracking-widest font-bold text-left transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <a
              href="/api/compare/auth/steam/start"
              className="px-4 py-2 bg-[#171a21] hover:bg-[#2a475e] text-[#c5c3c0] hover:text-white border border-[#2a475e] rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 group"
            >
              <img src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg" className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              Sign In
            </a>
          )}
        </div>

        {/* Mobile: Just show Auth/Sign In if needed, or rely solely on Hamburger? 
            Common pattern: Show simple auth or nothing on right. 
            Let's keep the user avatar on mobile right for easy access, or just rely on the drawer.
            The user said "overlapping hamburger menu... that has all of our pages".
            I'll leave the right side clean on mobile (hamburger is the main way).
        */}
      </nav>

      {/* Overlapping Drawer Menu */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMenu}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#000000] border-r border-white/10 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="h-8 w-auto" onError={(e) => (e.currentTarget.style.display = "none")} />
              <span className="font-bold text-white text-lg">Menu</span>
            </div>
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {steamid ? (
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <img src={userAvatar} alt="" className="w-10 h-10 rounded-full ring-2 ring-blue-500" />
                  <div>
                    <div className="text-white font-bold truncate">{userName}</div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mb-6 px-2">
                <a
                  href="/api/compare/auth/steam/start"
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-[#171a21] hover:bg-[#2a475e] text-white border border-[#2a475e] rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg group"
                >
                  <img src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg" className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                  Sign In
                </a>
              </div>
            )}

            <a href="/" onClick={goHome} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Home
            </a>

            {steamid && (
              <Link href={`/dashboard?${searchParams.toString()}`} className="flex items-center gap-3 px-4 py-3 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-xl transition-all font-medium">
                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard
              </Link>
            )}



            <Link href="/commands" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Commands
            </Link>

            <Link href={`/upgrade?${searchParams.toString()}`} className="flex items-center gap-3 px-4 py-3 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Premium
            </Link>

            <a href="/#faq" onClick={goFAQ} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              FAQ
            </a>

            <Link href="/blog" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              Blog
            </Link>

            <Link href="/about" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              About
            </Link>
            <Link href="/contact" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all font-medium">
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.6c1.1 0 2 .9 2 2z" /><path d="M16 5l-2 2 2 2" /><path d="M20 7l-2 2 2 2" /></svg>
              Contact
            </Link>
          </div>

          <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} We Both Play
          </div>
        </div>
      </div>
    </header>
  );
}
