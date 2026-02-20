const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, getLink } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backlog')
        .setDescription('Find a random game you own but haven\'t played much')
        .addUserOption(option => option.setName('user').setDescription('User to shame (optional)')),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
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

            if (!compareRes.ok) {
                const errorData = await compareRes.json().catch(() => ({}));
                throw new Error(errorData.error || "API Error");
            }
            const data = await compareRes.json();

            let library = data.shared || [];
            if (library.length === 0 && data.unique && data.unique[steamId]) {
                library = data.unique[steamId];
            }

            // Filter for backlog: < 3 hours (180 mins)
            const backlog = library.filter(g => {
                const pt = g.playtimes ? g.playtimes[steamId] : g.playtime_forever;
                return pt < 180;
            });

            if (backlog.length === 0) {
                return interaction.editReply({ content: '🎉 Amazing! You have no backlog! You play everything you buy.' });
            }

            const pick = backlog[Math.floor(Math.random() * backlog.length)];
            const pt = pick.playtimes ? pick.playtimes[steamId] : pick.playtime_forever;

            const embed = new EmbedBuilder()
                .setColor(0xE74C3C)
                .setTitle('🛑 PILE OF SHAME DETECTED')
                .setDescription(`You own **${pick.name}** but have only played it for **${pt} minutes**.\n\n*Go play it!*`)
                .setFooter({ text: `Selected from ${backlog.length} unplayed games.` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("Backlog error:", err);
            await interaction.editReply({ content: `❌ Failed to check backlog: ${err.message}` });
        }
    },
};
