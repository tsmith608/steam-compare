"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SteamLoginButton
 *
 * Props:
 * - mode: "redirect" | "popup"  (default "redirect")
 * - startUrl: string             (default "/api/auth/steam/start")
 * - className: string            (extra classes for the button)
 * - label: string                (default "Sign in with Steam")
 * - onSuccess(profile): fn       (called in popup mode when the callback postsMessage)
 * - onError(err): fn
 */
export default function SteamLoginButton({
  mode = "redirect",
  startUrl = "/api/compare/auth/steam/start",
  className = "",
  label = "",
  onSuccess,
  onError,
}) {
  const [busy, setBusy] = useState(false);
  const popupRef = useRef(null);

  const handleRedirect = useCallback(() => {
    setBusy(true);
    window.location.href = startUrl;
  }, [startUrl]);

  const handlePopup = useCallback(() => {
    setBusy(true);

    const width = 600;
    const height = 720;
    const top = Math.max(0, Math.round((window.outerHeight - height) / 2));
    const left = Math.max(0, Math.round((window.outerWidth - width) / 2));

    const feat = `popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`;
    const win = window.open(startUrl, "steam_login_popup", feat);
    popupRef.current = win;

    if (!win) {
      // Popup blocked: fallback to redirect
      handleRedirect();
      return;
    }

    // If the user closes the popup, stop the spinner
    const timer = setInterval(() => {
      if (win.closed) {
        clearInterval(timer);
        setBusy(false);
      }
    }, 400);

    // Listener waits for your callback page to postMessage to the opener.
    // Example from your callback (same origin):
    // window.opener?.postMessage({type:"steam-auth-success", profile}, window.location.origin);
    const onMsg = (e) => {
      try {
        if (e.origin !== window.location.origin) return;
        if (!e.data || typeof e.data !== "object") return;

        if (e.data.type === "steam-auth-success") {
          clearInterval(timer);
          setBusy(false);
          try { win.close(); } catch { }
          onSuccess?.(e.data.profile);
        }
        if (e.data.type === "steam-auth-error") {
          clearInterval(timer);
          setBusy(false);
          try { win.close(); } catch { }
          onError?.(e.data.error || new Error("Steam auth error"));
        }
      } catch (err) {
        setBusy(false);
        onError?.(err);
      }
    };

    window.addEventListener("message", onMsg);
    // Clean up if the component unmounts
    const cleanup = () => {
      window.removeEventListener("message", onMsg);
      try { win.close(); } catch { }
    };
    // store cleanup on ref to run on unmount
    popupRef.current._cleanup = cleanup;
  }, [handleRedirect, onError, onSuccess, startUrl]);

  useEffect(() => {
    return () => {
      const win = popupRef.current;
      if (win && win._cleanup) {
        try { win._cleanup(); } catch { }
      }
    };
  }, []);

  const onClick = (e) => {
    e.preventDefault();
    if (busy) return;
    mode === "popup" ? handlePopup() : handleRedirect();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={[
        "inline-flex items-center gap-2 rounded-xl border border-white/10",
        "bg-white/10 hover:bg-white/15 text-gray-100",
        "px-3.5 py-2.5 text-sm shadow-sm transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      aria-label={label}
    >
      {/* Steam logo */}
      <img
        src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg"
        alt=""
        className="h-4 w-26 opacity-90 mx-auto"
      />
      <span>{busy ? "Connecting…" : label}</span>
    </button>
  );
}
