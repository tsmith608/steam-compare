const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, resolveSteamIds } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flex')
        .setDescription('Compare achievements for a specific game')
        .addStringOption(option => option.setName('game').setDescription('Name of the game').setRequired(true))
        .addUserOption(option => option.setName('user').setDescription('Friend to flex on')),
    async execute(interaction) {
        await interaction.deferReply();
        const gameSearch = interaction.options.getString('game').toLowerCase();
        const targetUser = interaction.options.getUser('user');

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
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
            // 2. Find the game AppID via comparison
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: targetSteamId ? [execSteamId, targetSteamId] : [execSteamId, execSteamId] })
            });

            if (!compareRes.ok) {
                const errorData = await compareRes.json().catch(() => ({}));
                throw new Error(errorData.error || "Compare API Error");
            }
            const compareData = await compareRes.json();
            const pool = targetSteamId ? (compareData.shared || []) : (compareData.unique[execSteamId] || []);

            const game = pool.find(g => g.name.toLowerCase().includes(gameSearch));
            if (!game) {
                return interaction.editReply({ content: `❌ I couldn't find a game matching "${gameSearch}" in your ${targetSteamId ? 'shared' : ''} library.` });
            }

            // 3. Get Achievement Stats (Flex API)
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
                    embed.addFields({
                        name: interaction.user.displayName,
                        value: `✨ **${stats1.unlocked}/${stats1.total}** achievements (${p1Percent}%)`,
                        inline: false
                    });

                    if (stats2 && stats2.total > 0) {
                        const p2Percent = ((stats2.unlocked / stats2.total) * 100).toFixed(1);
                        embed.addFields({
                            name: targetUser.displayName,
                            value: `✨ **${stats2.unlocked}/${stats2.total}** achievements (${p2Percent}%)`,
                            inline: false
                        });

                        const winner = stats1.unlocked > stats2.unlocked ? interaction.user.displayName : stats2.unlocked > stats1.unlocked ? targetUser.displayName : null;
                        embed.setDescription(winner ? `👑 **${winner}** is the achievement king!` : "🤝 It's an achievement tie!");
                    } else {
                        embed.setDescription(`🚀 **${interaction.user.displayName}** is currently at ${p1Percent}%!`);
                    }
                } else {
                    // Fallback to playtime
                    const selfTime = Math.round((game.playtimes ? game.playtimes[execSteamId] : game.playtime_forever) / 60);
                    embed.addFields({ name: interaction.user.displayName, value: `⏱️ **${selfTime}h** played`, inline: true });

                    if (targetSteamId) {
                        const targetTime = Math.round(game.playtimes[targetSteamId] / 60);
                        embed.addFields({ name: targetUser.displayName, value: `⏱️ **${targetTime}h** played`, inline: true });
                        const winner = selfTime > targetTime ? interaction.user.displayName : targetTime > selfTime ? targetUser.displayName : null;
                        embed.setDescription(winner ? `🔥 **${winner}** has more hours in the tank!` : "🤝 Perfectly synced playtime!");
                    }
                }
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("Flex error:", err);
            await interaction.editReply({ content: `❌ Failed to flex stats: ${err.message}` });
        }
    },
};
