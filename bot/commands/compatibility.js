const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
            return interaction.editReply({ content: access.reason, components: access.components || [] });
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
            const shared = data.shared || [];
            const u1Unique = data.unique[id1]?.length || 0;
            const u2Unique = data.unique[id2]?.length || 0;

            // Score: (Shared / Min(Lib1, Lib2)) * 100
            const minLib = Math.min(sharedCount + u1Unique, sharedCount + u2Unique);
            let score = 0;
            if (minLib > 0) {
                score = Math.round((sharedCount / minLib) * 100);
            }

            // Visual progress bar
            const barLength = 20;
            const filled = Math.round((score / 100) * barLength);
            const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

            // Personality messages based on score
            let message, color;
            if (score >= 90) { message = "Soulmates! You're basically the same person. 💍"; color = 0xFF1493; }
            else if (score >= 75) { message = "Power couple. Your libraries were made for each other. 💕"; color = 0xFF69B4; }
            else if (score >= 60) { message = "Best friends energy. Squad up! 👯"; color = 0xFFB6C1; }
            else if (score >= 45) { message = "Solid overlap. You'll find something to play. 🤝"; color = 0x87CEEB; }
            else if (score >= 30) { message = "Casual acquaintances. Some common ground. 👋"; color = 0x90EE90; }
            else if (score >= 15) { message = "Different vibes. Very different tastes. 🤔"; color = 0xFFA500; }
            else if (score >= 5) { message = "Do you even know each other? 🧊"; color = 0x808080; }
            else { message = "Completely incompatible. This is a gaming divorce. 💔"; color = 0x2F3136; }

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`❤️ Compatibility: ${user1.username} + ${user2.username}`)
                .setDescription(`# ${score}%\n\`${progressBar}\`\n\n*${message}*`)
                .addFields(
                    { name: '🎮 Shared Games', value: `${sharedCount}`, inline: true },
                    { name: `📚 ${user1.username}`, value: `${sharedCount + u1Unique} total`, inline: true },
                    { name: `📚 ${user2.username}`, value: `${sharedCount + u2Unique} total`, inline: true }
                )
                .setTimestamp();

            // Top 3 shared games by combined playtime
            if (shared.length > 0) {
                const topShared = shared.map(g => {
                    const totalMinutes = Object.values(g.playtimes).reduce((a, b) => a + b, 0);
                    return { ...g, totalMinutes };
                }).sort((a, b) => b.totalMinutes - a.totalMinutes)
                    .slice(0, 3)
                    .map((g, i) => {
                        const hours = Math.round(g.totalMinutes / 60);
                        const medals = ['🥇', '🥈', '🥉'];
                        return `${medals[i]} **${g.name}** (${hours}h combined)`;
                    }).join('\n');

                embed.addFields({ name: '🏆 Top Shared Games', value: topShared });
            }

            const compareUrl = `${API_BASE}/?steamid=${id1}&steamid=${id2}`;
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🔗 Compare Full Libraries')
                        .setStyle(ButtonStyle.Link)
                        .setURL(compareUrl)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (err) {
            console.error("Compatibility error:", err);
            await interaction.editReply({ content: `❌ Failed to calculate compatibility: ${err.message}` });
        }
    },
};
