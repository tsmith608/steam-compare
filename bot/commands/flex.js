const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, resolveSteamIds, getLink } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flex')
        .setDescription('Compare achievements for a specific game')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Name of the game')
                .setRequired(true)
                .setAutocomplete(true))
        .addUserOption(option => option.setName('user').setDescription('Friend to flex on')),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();

        // Need the user's steam ID to search their library
        const steamId = await getLink(interaction.user.id);
        if (!steamId || focusedValue.length < 2) {
            return interaction.respond([]);
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: [steamId, steamId] })
            });

            if (!compareRes.ok) return interaction.respond([]);
            const data = await compareRes.json();
            const pool = data.shared || data.unique?.[steamId] || [];

            const matches = pool
                .filter(g => g.name.toLowerCase().includes(focusedValue))
                .slice(0, 25)
                .map(g => ({ name: g.name.substring(0, 100), value: g.name.substring(0, 100) }));

            await interaction.respond(matches);
        } catch (err) {
            console.error("Flex autocomplete error:", err);
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        await interaction.deferReply();
        const gameSearch = interaction.options.getString('game').toLowerCase();
        const targetUser = interaction.options.getUser('user');

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason, components: access.components || [] });
        }

        const discordIds = [interaction.user.id];
        if (targetUser) discordIds.push(targetUser.id);

        const links = await resolveSteamIds(discordIds);
        const execSteamId = links.find(l => l.discordId === interaction.user.id)?.steamId;

        if (!execSteamId) {
            return interaction.editReply({ content: "❌ You haven't linked your Steam account yet! Run `/link` first." });
        }

        let targetSteamId = null;
        if (targetUser) {
            targetSteamId = links.find(l => l.discordId === targetUser.id)?.steamId;
            if (!targetSteamId) {
                return interaction.editReply({ content: `❌ ${targetUser.username} hasn't linked their Steam account yet!` });
            }
        }

        try {
            // Find the game AppID via comparison
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: targetSteamId ? [execSteamId, targetSteamId] : [execSteamId, execSteamId] })
            });

            if (!compareRes.ok) throw new Error("Compare API Error");
            const compareData = await compareRes.json();
            const pool = targetSteamId ? (compareData.shared || []) : (compareData.unique?.[execSteamId] || compareData.shared || []);

            const game = pool.find(g => g.name.toLowerCase().includes(gameSearch));
            if (!game) {
                return interaction.editReply({ content: `❌ I couldn't find a game matching "**${gameSearch}**" in your ${targetSteamId ? 'shared ' : ''}library.` });
            }

            // Get Achievement Stats
            const flexRes = await fetch(`${API_BASE}/api/user/flex`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user1: execSteamId,
                    user2: targetSteamId,
                    appid: game.appid,
                    gameName: game.name
                })
            });

            const embed = new EmbedBuilder()
                .setColor(0x00BFFF)
                .setTitle(`💪 Flexing on ${game.name}`)
                .setThumbnail(`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`)
                .setTimestamp();

            if (flexRes.ok) {
                const { stats1, stats2 } = await flexRes.json();
                if (stats1 && stats1.total > 0) {
                    const p1Percent = ((stats1.unlocked / stats1.total) * 100).toFixed(1);
                    const p1Bar = _buildBar(stats1.unlocked, stats1.total);
                    embed.addFields({
                        name: interaction.user.displayName,
                        value: `✨ **${stats1.unlocked}/${stats1.total}** achievements (${p1Percent}%)\n\`${p1Bar}\``,
                        inline: false
                    });

                    if (stats2 && stats2.total > 0) {
                        const p2Percent = ((stats2.unlocked / stats2.total) * 100).toFixed(1);
                        const p2Bar = _buildBar(stats2.unlocked, stats2.total);
                        embed.addFields({
                            name: targetUser.displayName,
                            value: `✨ **${stats2.unlocked}/${stats2.total}** achievements (${p2Percent}%)\n\`${p2Bar}\``,
                            inline: false
                        });

                        const diff = stats1.unlocked - stats2.unlocked;
                        if (diff > 0) {
                            embed.setDescription(`👑 **${interaction.user.displayName}** is the achievement king! (+${diff} ahead)`);
                        } else if (diff < 0) {
                            embed.setDescription(`👑 **${targetUser.displayName}** is the achievement king! (+${Math.abs(diff)} ahead)`);
                        } else {
                            embed.setDescription("🤝 It's an achievement tie! Equally cracked.");
                        }
                    } else {
                        embed.setDescription(`🚀 **${interaction.user.displayName}** is currently at ${p1Percent}%!`);
                    }
                } else {
                    // Fallback to playtime
                    const selfTime = Math.round((game.playtimes ? game.playtimes[execSteamId] : game.playtime_forever) / 60);
                    embed.addFields({ name: interaction.user.displayName, value: `⏱️ **${selfTime}h** played`, inline: true });

                    if (targetSteamId) {
                        const targetTime = Math.round((game.playtimes?.[targetSteamId] || 0) / 60);
                        embed.addFields({ name: targetUser.displayName, value: `⏱️ **${targetTime}h** played`, inline: true });
                        const diff = selfTime - targetTime;
                        if (diff > 0) {
                            embed.setDescription(`🔥 **${interaction.user.displayName}** has **${diff}** more hours!`);
                        } else if (diff < 0) {
                            embed.setDescription(`🔥 **${targetUser.displayName}** has **${Math.abs(diff)}** more hours!`);
                        } else {
                            embed.setDescription("🤝 Perfectly synced playtime!");
                        }
                    } else {
                        embed.setDescription(`No achievements for this game. **${selfTime}h** played total.`);
                    }
                }
            } else {
                // Flex API not available, fallback to playtime
                const selfTime = Math.round((game.playtimes ? game.playtimes[execSteamId] : game.playtime_forever) / 60);
                embed.setDescription(`⏱️ **${selfTime}h** played`);
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🚀 Launch in Steam')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`steam://run/${game.appid}`)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (err) {
            console.error("Flex error:", err);
            await interaction.editReply({ content: `❌ Failed to flex stats: ${err.message}` });
        }
    },
};

function _buildBar(current, total) {
    const barLength = 15;
    const filled = Math.round((current / total) * barLength);
    return '█'.repeat(filled) + '░'.repeat(barLength - filled);
}
