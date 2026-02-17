const API_BASE = 'https://webothplay.com';

/**
 * Checks if a user has access to a specific tier (Pro/Hacker) 
 * OR if the server they are in has a Hacker-tier member.
 * 
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} requiredTier - 'Pro' or 'Hacker'
 * @returns {Promise<{allowed: boolean, reason?: string, currentTier: string}>}
 */
async function checkTierAccess(interaction, requiredTier = 'Pro') {
    const userId = interaction.user.id;
    const guild = interaction.guild;

    // 1. Check User's Own Tier
    let userTier = 'Noob';
    try {
        const res = await fetch(`${API_BASE}/api/discord/link?discord_id=${userId}`);
        if (res.ok) {
            const data = await res.json();
            userTier = data.tier || 'Noob';
        }
    } catch (err) {
        console.error("Tier Check Error (User):", err);
    }

    // Pro access: Pro or Hacker
    // Hacker access: Only Hacker
    if (userTier === 'Hacker') return { allowed: true, currentTier: userTier };
    if (requiredTier === 'Pro' && userTier === 'Pro') return { allowed: true, currentTier: userTier };

    // 2. Hacker Server Perk
    // Check if any member in the server is a Hacker
    if (guild) {
        try {
            // map() might be slow for massive servers, but with intents enabled and cache populated it's decent.
            // In very large servers, we might need a better strategy, but for most it works.
            const memberIds = guild.members.cache.map(m => m.id);

            const hackerRes = await fetch(`${API_BASE}/api/discord/server-hacker-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordIds: memberIds })
            });

            if (hackerRes.ok) {
                const { hasHacker } = await hackerRes.json();
                if (hasHacker) {
                    return { allowed: true, isServerPerk: true, currentTier: 'Hacker' };
                }
            }
        } catch (err) {
            console.error("Tier Check Error (Server):", err);
        }
    }

    return {
        allowed: false,
        currentTier: userTier,
        reason: `❌ This is a **${requiredTier}** feature.\n\nType \`/upgrade\` to unlock it, or have a **Hacker** tier member join your server!`
    };
}

module.exports = { checkTierAccess };
