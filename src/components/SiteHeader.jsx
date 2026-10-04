"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signInHref, useSession } from "@/components/SessionProvider";
import { Icon } from "@/components/Icon";

const NAV = [
  { href: "/", label: "Compare" },
  { href: "/discord", label: "Discord bot" },
  { href: "/guides", label: "Guides" },
  { href: "/upgrade", label: "Premium", premium: true },
];

export function Wordmark({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src="/logo-mark.png" alt="" width={29} height={24} className="h-6 w-auto" />
      <span className="font-display text-[1.12rem] font-extrabold tracking-[-0.01em] text-ink-1" style={{ fontStretch: "108%" }}>
        We<span className="text-accent-hi">Both</span>Play
      </span>
    </span>
  );
}

function AccountMenu({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "mousedown" && ref.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm text-ink-2 transition hover:border-line-strong hover:text-ink-1"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-3 text-xs font-bold">{user.name.slice(0, 1)}</span>
        )}
        <span className="max-w-[9rem] truncate font-medium">{user.name}</span>
        {user.isPremium && <span className="tag !bg-amber-wash !text-amber-hi">{user.tier}</span>}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-lg border border-line-strong bg-surface-1 p-1.5 shadow-2xl">
          <Link role="menuitem" href={`/${user.steamid}`} className="block rounded-md px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink-1" onClick={() => setOpen(false)}>
            Your profile
          </Link>
          <Link role="menuitem" href="/upgrade" className="block rounded-md px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink-1" onClick={() => setOpen(false)}>
            {user.isPremium ? "Plan & billing" : "Go Premium"}
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink-2 hover:bg-surface-2 hover:text-ink-1">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, loading, signOut } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation (state adjusted during render, as React recommends).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href) => (href === "/" ? pathname === "/" || pathname === "/compare" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" aria-label="WeBothPlay home" className="rounded-md">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-[0.9rem] font-medium transition-colors ${
                item.premium ? "text-amber-hi hover:text-amber" : isActive(item.href) ? "text-ink-1" : "text-ink-2 hover:text-ink-1"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            {loading ? (
              <span className="block h-9 w-28 rounded-full shimmer" aria-hidden />
            ) : user ? (
              <AccountMenu user={user} signOut={signOut} />
            ) : (
              <a href={signInHref(pathname)} className="btn btn-steam btn-sm">
                <Icon name="steam" className="h-4 w-4" /> Sign in
              </a>
            )}
          </div>
          <button
            type="button"
            className="btn btn-quiet btn-sm md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-50 overflow-y-auto bg-bg md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b border-line py-4 display text-2xl ${item.premium ? "text-amber-hi" : "text-ink-1"}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8">
              {user ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-4">
                  <Link href={`/${user.steamid}`} className="flex min-w-0 items-center gap-3">
                    {user.avatar && <img src={user.avatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />}
                    <span className="truncate font-semibold">{user.name}</span>
                  </Link>
                  <button type="button" onClick={signOut} className="btn btn-ghost btn-sm">Sign out</button>
                </div>
              ) : (
                <a href={signInHref(pathname)} className="btn btn-steam w-full">
                  <Icon name="steam" className="h-4 w-4" /> Sign in through Steam
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
