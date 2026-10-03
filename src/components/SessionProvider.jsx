"use client";
// Signed-in user for client components. The source of truth is the HttpOnly
// session cookie; this only mirrors /api/auth/me for rendering.
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const SessionContext = createContext({ user: null, loading: true, refresh: async () => {}, signOut: async () => {} });

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
      return data.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    try {
      sessionStorage.removeItem("wb.steamid");
      sessionStorage.removeItem("wb.username");
      sessionStorage.removeItem("wb.avatar");
    } catch {}
    setUser(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    refresh();
    // Clean up identity left in browser storage by the old client-side "login".
    try {
      sessionStorage.removeItem("wb.steamid");
      sessionStorage.removeItem("wb.username");
      sessionStorage.removeItem("wb.avatar");
      sessionStorage.removeItem("wb.vanity");
    } catch {}
  }, [refresh]);

  return <SessionContext.Provider value={{ user, loading, refresh, signOut }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);

/** Steam sign-in URL that returns to `next` afterwards. */
export function signInHref(next) {
  return `/api/compare/auth/steam/start${next ? `?next=${encodeURIComponent(next)}` : ""}`;
}
