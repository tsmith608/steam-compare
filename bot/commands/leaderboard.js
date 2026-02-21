const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { resolveSteamIds, getRankings } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See who is the biggest gamer in the server!')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Ranking category')
                .addChoices(
                    { name: 'Playtime (2 Weeks)', value: 'playtime' },
                    { name: 'Library Size', value: 'library' }
                )),
    async execute(interaction) {
        await interaction.deferReply();
        const category = interaction.options.getString('category') || 'playtime';

        // 1. Robust Guild Resolution
        let guild = interaction.guild;
        if (!guild && interaction.guildId) {
            try {
                guild = await interaction.client.guilds.fetch(interaction.guildId);
            } catch (e) {
                console.error("Failed to fetch guild:", e);
            }
        }

        if (!guild) {
            return interaction.editReply({ content: "❌ This command can only be used in a server." });
        }

        try {
            // 2. Check Tier Access
            const access = await checkTierAccess(interaction, 'Pro');
            if (!access.allowed) {
                return interaction.editReply({ content: access.reason });
            }

            // 3. Fetch linked members
            // Ensure we have the latest members list
            let members;
            try {
                members = await guild.members.fetch({ limit: 1000 }).catch(() => guild.members.cache);
            } catch (err) {
                console.warn("Member fetch failed, falling back to cache:", err);
                members = guild.members.cache;
            }

            const discordIds = members.filter(m => !m.user.bot).map(m => m.id);

            if (discordIds.length === 0) {
                return interaction.editReply({ content: "❌ No members found in this server. Make sure the 'Server Members Intent' is enabled in the Discord Developer Portal!" });
            }

            const links = await resolveSteamIds(discordIds);
            const steamIds = links.map(l => l.steamId);

            if (steamIds.length === 0) {
                return interaction.editReply({ content: "❌ No linked accounts found in this server. Use `/link` to connect!" });
            }

            // 4. Fetch Rankings in bulk
            const stats = await getRankings(steamIds);

            // Map stats back to Discord users
            const rankData = stats.map(s => {
                const link = links.find(l => l.steamId === s.steamid);
                if (!link) return null;
                const member = members.get(link.discordId);
                return {
                    name: member ? member.displayName : 'Linked User',
                    ...s
                };
            }).filter(Boolean);

            if (rankData.length === 0) {
                return interaction.editReply({ content: "❌ No ranking data available for linked members." });
            }

            // 5. Sort and Format
            let title = "";
            if (category === 'playtime') {
                rankData.sort((a, b) => (b.recentMinutes || 0) - (a.recentMinutes || 0));
                title = "⏳ Playtime Rankings (Last 2 Weeks)";
            } else {
                rankData.sort((a, b) => (b.librarySize || 0) - (a.librarySize || 0));
                title = "📚 Library Size Rankings";
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle(`🏆 Server Leaderboard: ${guild.name}`)
                .setDescription(`**${title}**\n*Showing rankings for linked members*`)
                .setThumbnail(guild.iconURL())
                .setTimestamp();

            const description = rankData.slice(0, 10).map((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                const val = category === 'playtime' ? `${((u.recentMinutes || 0) / 60).toFixed(1)}h` : `${u.librarySize || 0} games`;
                return `${medal} **${u.name}**: ${val}`;
            }).join('\n');

            embed.addFields({ name: 'Rankings', value: description || "No data available." });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("Leaderboard error detail:", err);
            try {
                const msg = `❌ Failed to generate leaderboard: ${err.message}`;
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: msg });
                } else {
                    await interaction.reply({ content: msg, ephemeral: true });
                }
            } catch (replyErr) {
                console.error("Failed to send error reply:", replyErr);
            }
        }
    },
};
