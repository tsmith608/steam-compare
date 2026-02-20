const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, resolveSteamIds } = require('../utils/api');

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

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
        }

        const discordIds = [user1.id, user2.id];
        const links = await resolveSteamIds(discordIds);

        const id1 = links.find(l => l.discordId === user1.id)?.steamId;
        const id2 = links.find(l => l.discordId === user2.id)?.steamId;

        if (!id1 || !id2) {
            let missing = [];
            if (!id1) missing.push(user1.username);
            if (!id2) missing.push(user2.username);
            return interaction.editReply({ content: `❌ **Unlinked Accounts**: ${missing.join(' and ')} must be linked to Steam! Run \`/link\` to connect.` });
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: [id1, id2] })
            });

            if (!compareRes.ok) {
                const errorData = await compareRes.json().catch(() => ({}));
                throw new Error(errorData.error || "API Error");
            }
            const data = await compareRes.json();

            const sharedCount = data.shared.length;

            // Total Unique games for User 1
            const u1Unique = data.unique[id1]?.length || 0;
            const u2Unique = data.unique[id2]?.length || 0;
            const union = sharedCount + u1Unique + u2Unique;

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
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("Compatibility error:", err);
            await interaction.editReply({ content: `❌ Failed to calculate compatibility: ${err.message}` });
        }
    },
};
