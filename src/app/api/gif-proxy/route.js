/**
 * GET /api/gif-proxy?url=<encoded-url>
 *
 * Server-side proxy for GIF/image URLs that block browser hotlinking (e.g. Tenor).
 * Fetches the resource from the Next.js server (no browser origin) and streams it back.
 *
 * Allowed hosts: tenor.com, media.tenor.com, giphy.com, media.giphy.com, media0-4.giphy.com
 */

const ALLOWED_HOSTS = [
    "tenor.com",
    "media.tenor.com",
    "giphy.com",
    "media.giphy.com",
    "media0.giphy.com",
    "media1.giphy.com",
    "media2.giphy.com",
    "media3.giphy.com",
    "media4.giphy.com",
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
        return new Response("Missing url parameter", { status: 400 });
    }

    // Validate URL
    let parsed;
    try {
        parsed = new URL(targetUrl);
    } catch {
        return new Response("Invalid URL", { status: 400 });
    }

    // Security: only proxy from allowed GIF hosts
    const host = parsed.hostname.replace(/^www\./, "");
    const isAllowed = ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    if (!isAllowed) {
        return new Response(`Host not allowed: ${host}`, { status: 403 });
    }

    try {
        const upstream = await fetch(targetUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "image/gif,image/webp,image/apng,image/*,text/html,*/*;q=0.8",
                Referer: "https://tenor.com/",
            },
            redirect: "follow",
        });

        if (!upstream.ok) {
            return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
        }

        const contentType = upstream.headers.get("content-type") ?? "";

        // If Tenor returned HTML, scrape the real media URL from og:image / og:video
        if (contentType.includes("text/html")) {
            const html = await upstream.text();

            // Try og:image first (GIF), then og:video (MP4)
            const ogMatch =
                html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
                html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i) ||
                html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i) ||
                html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:video"/i);

            if (!ogMatch || !ogMatch[1]) {
                console.error("[gif-proxy] Could not find media URL in HTML response");
                return new Response("Could not extract media URL from page", { status: 422 });
            }

            const mediaUrl = ogMatch[1];
            console.log("[gif-proxy] Extracted media URL from HTML:", mediaUrl);

            // Proxy the actual CDN media file
            const mediaRes = await fetch(mediaUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible)",
                    Referer: "https://tenor.com/",
                },
                redirect: "follow",
            });

            if (!mediaRes.ok) {
                return new Response(`Media fetch error: ${mediaRes.status}`, { status: mediaRes.status });
            }

            const mediaType = mediaRes.headers.get("content-type") ?? "image/gif";
            return new Response(mediaRes.body, {
                status: 200,
                headers: {
                    "Content-Type": mediaType,
                    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        // Direct media response — stream it straight back
        return new Response(upstream.body, {
            status: 200,
            headers: {
                "Content-Type": contentType || "image/gif",
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (err) {
        console.error("[gif-proxy] Fetch failed:", err);
        return new Response("Proxy fetch failed", { status: 502 });
    }
}
