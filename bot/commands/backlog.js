const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

const API_BASE = 'https://webothplay.com';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backlog')
        .setDescription('Find a random game you own but haven\'t played much')
        .addUserOption(option => option.setName('user').setDescription('User to shame (optional)')),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;

        let steamId = null;
        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
        }

        try {
            const res = await fetch(`${API_BASE}/api/discord/link?discord_id=${targetUser.id}`);
            if (res.ok) {
                const data = await res.json();
                steamId = data.steamId;
            }
        } catch (e) { }

        if (!steamId) {
            return interaction.editReply({ content: `❌ ${targetUser.username} hasn't linked their Steam account yet!` });
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

            // Filter for backlog: < 2 hours (120 mins) but > 0 (installed/opened once)
            // Or maybe strictly 0? Let's do < 3 hours to be safe Pile of Shame.
            const backlog = library.filter(g => {
                const pt = g.playtimes ? g.playtimes[steamId] : g.playtime_forever;
                return pt < 180; // less than 3 hours
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
                .setFooter({ text: `Selected from ${backlog.length} unplayed games.` });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Failed to check backlog.' });
        }
    },
};
