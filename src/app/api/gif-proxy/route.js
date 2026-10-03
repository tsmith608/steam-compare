/**
 * GET /api/gif-proxy?url=<encoded-url>
 *
 * Proxies GIFs from Tenor/Giphy (which block hotlinking) for profile widgets.
 * Only allow-listed hosts are fetched (including after redirects and og:image
 * extraction), and only image/video content types are relayed, so the proxy
 * can't be used to reach internal hosts or serve HTML/SVG from our origin.
 */
import { limitOrNull } from "@/lib/http";

const ALLOWED_HOSTS = ["tenor.com", "media.tenor.com", "c.tenor.com", "giphy.com", "media.giphy.com", "i.giphy.com"];
const ALLOWED_TYPES = ["image/gif", "image/webp", "image/png", "image/jpeg", "video/mp4", "video/webm"];
const MAX_BYTES = 15 * 1024 * 1024;

function allowedUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^www\./, "");
    const ok = ALLOWED_HOSTS.some((h) => host === h) || /^media\d?\.giphy\.com$/.test(host) || /^media\d?\.tenor\.com$/.test(host);
    return ok ? u : null;
  } catch {
    return null;
  }
}

async function fetchAllowed(url, hops = 3) {
  let current = url;
  for (let i = 0; i <= hops; i++) {
    const res = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WeBothPlay/1.0)", Accept: "image/*,video/*,text/html;q=0.8" },
    });
    if (res.status >= 300 && res.status < 400) {
      const next = allowedUrl(new URL(res.headers.get("location") || "", current).toString());
      if (!next) return null;
      current = next;
      continue;
    }
    return res;
  }
  return null;
}

function relay(upstream) {
  const type = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.includes(type)) return new Response("Unsupported media type", { status: 415 });
  const len = Number(upstream.headers.get("content-length") || 0);
  if (len > MAX_BYTES) return new Response("Too large", { status: 413 });
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}

export async function GET(req) {
  const limited = limitOrNull(req, "gif-proxy", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const target = allowedUrl(new URL(req.url).searchParams.get("url") || "");
  if (!target) return new Response("Host not allowed", { status: 403 });

  try {
    const upstream = await fetchAllowed(target);
    if (!upstream || !upstream.ok) return new Response("Upstream error", { status: 502 });

    const type = upstream.headers.get("content-type") || "";
    if (!type.includes("text/html")) return relay(upstream);

    // Tenor share pages: pull the real media URL from og:image / og:video.
    const html = (await upstream.text()).slice(0, 500_000);
    const og =
      html.match(/<meta[^>]+property="og:(?:image|video)"[^>]+content="([^"]+)"/i) ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:(?:image|video)"/i);
    const media = og && allowedUrl(og[1].replace(/&amp;/g, "&"));
    if (!media) return new Response("Could not extract media URL", { status: 422 });
    const mediaRes = await fetchAllowed(media);
    if (!mediaRes || !mediaRes.ok) return new Response("Media fetch error", { status: 502 });
    return relay(mediaRes);
  } catch {
    return new Response("Proxy fetch failed", { status: 502 });
  }
}
