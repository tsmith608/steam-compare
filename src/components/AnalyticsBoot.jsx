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
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    };
  }, []);

  useEffect(() => {
    const name = PAGE_EVENTS[pathname];
    if (name) track(name);
  }, [pathname]);

  return null;
}
