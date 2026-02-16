import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { appids } = await req.json();
        if (!appids || !Array.isArray(appids)) {
            return NextResponse.json({ error: "Invalid appids" }, { status: 400 });
        }

        const results = {};

        // Fetch 5 at a time to be nice to rate limits but parallel enough to be fast
        const CONCURRENCY = 5;

        for (let i = 0; i < appids.length; i += CONCURRENCY) {
            const batch = appids.slice(i, i + CONCURRENCY);
            // console.log(`[API] Fetching batch ${i / CONCURRENCY + 1}: ${batch.join(", ")}`);

            await Promise.all(batch.map(async (appid) => {
                const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=categories,basic,platforms`;
                try {
                    const res = await fetch(url, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data[appid] && data[appid].success) {
                            results[appid] = data[appid].data;
                        }
                    } else {
                        // console.warn(`[API] Failed to fetch ${appid}: ${res.status}`);
                    }
                } catch (e) {
                    console.error(`[API] Error fetching ${appid}:`, e.message);
                }
            }));

            // Small delay between batches
            if (i + CONCURRENCY < appids.length) {
                await new Promise(r => setTimeout(r, 200));
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Game details fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
