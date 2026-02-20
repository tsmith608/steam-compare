const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.BOT_API_BASE || 'https://webothplay.com';

/**
 * Resolves Discord IDs to Steam IDs using the batch-links API.
 * @param {string[]} discordIds 
 * @returns {Promise<{discordId: string, steamId: string}[]>}
 */
async function resolveSteamIds(discordIds) {
    if (!discordIds || discordIds.length === 0) return [];
    try {
        const res = await fetch(`${API_BASE}/api/discord/batch-links`, {
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
        const res = await fetch(`${API_BASE}/api/discord/link?discord_id=${discordId}`);
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
        const res = await fetch(`${API_BASE}/api/user/rankings`, {
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
    resolveSteamIds,
    getLink,
    getRankings
};
