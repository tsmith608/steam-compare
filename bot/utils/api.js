const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const crypto = require('crypto');

const API_BASE = process.env.BOT_API_BASE || 'https://webothplay.com';

/**
 * fetch() against the website API. Sends BOT_API_KEY (when configured) so the
 * website can keep bot-only endpoints private and exempt the bot from
 * per-IP rate limits. Set the same BOT_API_KEY on the website and the bot.
 */
function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (process.env.BOT_API_KEY) headers.Authorization = `Bearer ${process.env.BOT_API_KEY}`;
    return fetch(`${API_BASE}${path}`, { ...options, headers });
}

/** Link to the full comparison on the website, tagged so visits are attributable. */
function compareUrl(steamIds, medium = 'bot') {
    const ids = steamIds.map(String).filter(id => /^\d{17}$/.test(id));
    return `${API_BASE}/compare?p=${ids.join(',')}&utm_source=discord&utm_medium=${medium}`;
}

/**
 * Signed one-hour link for /link. The website verifies the signature with the
 * shared DISCORD_LINK_SECRET so nobody can forge a link for another account.
 */
function linkUrl(discordId) {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const params = new URLSearchParams({ discord_id: discordId, exp: String(exp) });
    if (process.env.DISCORD_LINK_SECRET) {
        params.set('sig', crypto.createHmac('sha256', process.env.DISCORD_LINK_SECRET).update(`${discordId}.${exp}`).digest('hex'));
    }
    return `${API_BASE}/auth/discord?${params.toString()}`;
}

/**
 * Resolves Discord IDs to Steam IDs using the batch-links API.
 * @param {string[]} discordIds 
 * @returns {Promise<{discordId: string, steamId: string}[]>}
 */
async function resolveSteamIds(discordIds) {
    if (!discordIds || discordIds.length === 0) return [];
    try {
        const res = await apiFetch('/api/discord/batch-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discordIds })
        });
        if (!res.ok) throw new Error(`Batch API Error: ${res.status}`);
        const { links } = await res.json();
        return links || [];
    } catch (err) {
        console.error("resolveSteamIds failed:", err);
        return [];
    }
}

/**
 * Resolves a single Discord ID to its linked Steam ID.
 * @param {string} discordId 
 * @returns {Promise<string|null>}
 */
async function getLink(discordId) {
    try {
        const res = await apiFetch(`/api/discord/link?discord_id=${discordId}`);
        if (res.ok) {
            const data = await res.json();
            return data.steamId || null;
        }
    } catch (err) {
        console.error(`getLink failed for ${discordId}:`, err);
    }
    return null;
}

/**
 * Fetches rankings for a list of Steam IDs.
 * @param {string[]} steamIds 
 * @returns {Promise<{steamid: string, librarySize: number, recentMinutes: number}[]>}
 */
async function getRankings(steamIds) {
    if (!steamIds || steamIds.length === 0) return [];
    try {
        const res = await apiFetch('/api/user/rankings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steamIds })
        });
        if (!res.ok) throw new Error(`Rankings API Error: ${res.status}`);
        const { stats } = await res.json();
        return stats || [];
    } catch (err) {
        console.error("getRankings failed:", err);
        return [];
    }
}

module.exports = {
    API_BASE,
    apiFetch,
    compareUrl,
    linkUrl,
    resolveSteamIds,
    getLink,
    getRankings
};
