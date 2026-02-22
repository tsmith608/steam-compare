const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, getLink } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Generate your Gamer Resume')
        .addUserOption(option => option.setName('user').setDescription('User to lookup (optional)')),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason, components: access.components || [] });
        }

        const steamId = await getLink(targetUser.id);
        if (!steamId) {
            return interaction.editReply({ content: `❌ ${targetUser.id === interaction.user.id ? 'You haven\'t' : targetUser.username + " hasn't"} linked a Steam account yet! Run \`/link\` to connect.` });
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: [steamId, steamId] })
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();

            let library = data.shared || [];
            if (library.length === 0 && data.unique && data.unique[steamId]) {
                library = data.unique[steamId];
            }

            if (library.length === 0) {
                return interaction.editReply({ content: '❌ No games found. Is your Steam profile private?' });
            }

            // Calc Stats
            const totalGames = library.length;
            let totalMinutes = 0;
            let playedCount = 0;

            const sorted = library.map(g => {
                const pt = g.playtimes ? g.playtimes[steamId] : g.playtime_forever;
                totalMinutes += pt;
                if (pt > 0) playedCount++;
                return { name: g.name, pt };
            }).sort((a, b) => b.pt - a.pt);

            const totalHours = Math.round(totalMinutes / 60);
            const days = (totalHours / 24).toFixed(1);
            const avgHours = (totalHours / totalGames).toFixed(1);
            const neverPlayed = totalGames - playedCount;
            const completionRate = ((playedCount / totalGames) * 100).toFixed(0);

            const top5 = sorted.slice(0, 5).map((g, i) => {
                const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
                return `${medals[i]} **${g.name}** (${Math.round(g.pt / 60)}h)`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x9B59B6)
                .setTitle(`📜 Gamer Resume: ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '⏱️ Total Playtime', value: `**${totalHours.toLocaleString()}** Hours\n(${days} Days)`, inline: true },
                    { name: '📚 Library Size', value: `**${totalGames}** Games`, inline: true },
                    { name: '📊 Avg Per Game', value: `**${avgHours}** Hours`, inline: true },
                    { name: '🎮 Games Played', value: `**${playedCount}** / ${totalGames} (${completionRate}%)`, inline: true },
                    { name: '🕸️ Never Touched', value: `**${neverPlayed}** Games`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: '🏆 Most Played', value: top5 || 'None', inline: false }
                )
                .setTimestamp();

            const dashboardUrl = `${API_BASE}/dashboard/${steamId}`;
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('📊 View Full Dashboard')
                        .setStyle(ButtonStyle.Link)
                        .setURL(dashboardUrl)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (err) {
            console.error("Stats error:", err);
            await interaction.editReply({ content: `❌ Failed to generate stats: ${err.message}` });
        }
    },
};
