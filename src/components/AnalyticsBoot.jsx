"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution, track } from "@/lib/track";

// Records attribution once per visit, a few key page views, and uncaught
// client errors (rate-limited) so the owner can see breakage without Sentry.
const PAGE_EVENTS = { "/": "landing_viewed", "/upgrade": "premium_viewed" };

export default function AnalyticsBoot() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    let sent = 0;
    const onError = (e) => {
      if (sent >= 3) return;
      sent++;
      const msg = String(e?.message || e?.reason?.message || "error").slice(0, 80);
      track("client_error", { message: msg, page: window.location.pathname.slice(0, 60) });
    };
    // Links in server components opt in with data-track="event_name" and an
    // optional data-track-location (no client JS per link).
    const onClick = (e) => {
      const el = e.target?.closest?.("[data-track]");
      if (!el) return;
      const loc = el.getAttribute("data-track-location");
      track(el.getAttribute("data-track"), loc ? { location: loc } : {});
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    const name = PAGE_EVENTS[pathname];
    if (name) track(name);
  }, [pathname]);

  return null;
}
