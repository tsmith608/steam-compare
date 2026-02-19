const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

const API_BASE = 'https://webothplay.com';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compatibility')
        .setDescription('Check how compatible your game library is with another user')
        .addUserOption(option => option.setName('user').setDescription('User to check compatibility with').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const user1 = interaction.user;
        const user2 = interaction.options.getUser('user');

        if (user1.id === user2.id) {
            return interaction.editReply({ content: "You are 100% compatible with yourself. Narcissist. 🪞" });
        }

        // Resolve IDs
        let id1, id2;
        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
        }

        const executorTier = access.currentTier;

        try {
            const r1 = await fetch(`${API_BASE}/api/discord/link?discord_id=${user1.id}`);
            const r2 = await fetch(`${API_BASE}/api/discord/link?discord_id=${user2.id}`);
            if (r1.ok) {
                const data1 = await r1.json();
                id1 = data1.steamId;
            }
            if (r2.ok) {
                const data2 = await r2.json();
                id2 = data2.steamId;
            }
        } catch (e) { }

        if (!id1 || !id2) {
            return interaction.editReply({ content: '❌ Both users must be linked to Steam!' });
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: [id1, id2] })
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();

            const sharedCount = data.shared.length;

            // Total Unique games for User 1
            const u1Unique = data.unique[id1]?.length || 0;
            // Total Games for User 1 = Shared + Unique
            const u1Total = sharedCount + u1Unique;

            // Simple Score: Shared / (Smaller Library) * 100
            // This represents overlap relative to the person with fewer games
            // Or Jaccard index: Intersection / Union

            const u2Unique = data.unique[id2]?.length || 0;
            const union = sharedCount + u1Unique + u2Unique;

            let score = 0;
            if (union > 0) {
                score = Math.round((sharedCount / union) * 100);
            }

            // Jaccard is harsh, let's boost it a bit for fun
            // Adjusted Score: (Shared / Min(Lib1, Lib2)) * 100
            const minLib = Math.min(sharedCount + u1Unique, sharedCount + u2Unique);
            let funnyScore = 0;
            if (minLib > 0) {
                funnyScore = Math.round((sharedCount / minLib) * 100);
            }

            let message = "";
            if (funnyScore > 80) message = "Soulmates! 💍";
            else if (funnyScore > 50) message = "Besties. 👯";
            else if (funnyScore > 20) message = "Casual acquaintances. 👋";
            else message = "Do you even know each other? 🧊";

            const embed = new EmbedBuilder()
                .setColor(0xFF69B4)
                .setTitle(`❤️ Compatibility: ${user1.username} + ${user2.username}`)
                .setDescription(`**${funnyScore}% Compatible**\n${message}`)
                .addFields(
                    { name: 'Shared Games', value: `${sharedCount}`, inline: true },
                    { name: 'Unique Games', value: `${u1Unique + u2Unique}`, inline: true }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Failed to calculate compatibility.' });
        }
    },
};
