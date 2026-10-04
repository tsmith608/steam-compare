// Client-side analytics: first-party events to /api/events (no cookies, no
// personal data) and, when Google Analytics is loaded, the same event there.
const ANON_KEY = "wbp.anon";
const UTM_KEY = "wbp.utm";
const REF_KEY = "wbp.ref";

function safeStorage(kind) {
  try {
    const s = window[kind];
    const probe = "__wbp";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function anonId() {
  if (typeof window === "undefined") return null;
  const ls = safeStorage("localStorage");
  let id = ls?.getItem(ANON_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`).slice(0, 36);
    ls?.setItem(ANON_KEY, id);
  }
  return id;
}

/** Remembers where this visit came from (first touch per tab session). */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const ss = safeStorage("sessionStorage");
  if (!ss || ss.getItem(UTM_KEY)) return;
  const p = new URLSearchParams(window.location.search);
  const utm = { source: p.get("utm_source") || undefined, medium: p.get("utm_medium") || undefined, campaign: p.get("utm_campaign") || undefined };
  ss.setItem(UTM_KEY, JSON.stringify(utm));
  ss.setItem(REF_KEY, document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "");
}

function attribution() {
  const ss = safeStorage("sessionStorage");
  try {
    return { utm: JSON.parse(ss?.getItem(UTM_KEY) || "{}"), referrer: ss?.getItem(REF_KEY) || undefined };
  } catch {
    return { utm: {}, referrer: undefined };
  }
}

/** Context sent with API calls whose outcome the server records (e.g. /api/compare). */
export function trackContext() {
  if (typeof window === "undefined") return {};
  const { utm, referrer } = attribution();
  return { anonId: anonId(), path: window.location.pathname, referrer, utm };
}

const STARTED_KEY = "wbp.started";

/** The form marks the group it just submitted so the results page doesn't count it twice. */
export function markStarted(groupKey) {
  safeStorage("sessionStorage")?.setItem(STARTED_KEY, groupKey);
}

/** True (once) when this group was just submitted from the form. */
export function consumeStarted(groupKey) {
  const ss = safeStorage("sessionStorage");
  if (!ss || ss.getItem(STARTED_KEY) !== groupKey) return false;
  ss.removeItem(STARTED_KEY);
  return true;
}

/**
 * @param {string} name one of the names in src/lib/analytics.js
 * @param {Record<string, string|number|boolean>} [props] counts/enums only
 */
export function track(name, props = {}) {
  if (typeof window === "undefined") return;
  const { utm, referrer } = attribution();
  const payload = JSON.stringify({ name, props, anonId: anonId(), path: window.location.pathname, referrer, utm });
  try {
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/events", blob)) {
      fetch("/api/events", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    // never let analytics break the page
  }
  try {
    window.gtag?.("event", name, props);
  } catch {}
}
