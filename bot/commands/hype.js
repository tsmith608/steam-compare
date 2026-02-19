const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

const API_BASE = 'https://webothplay.com';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hype')
        .setDescription('See what games are trending in this server right now!'),
    async execute(interaction) {
        await interaction.deferReply();
        const guild = interaction.guild;

        if (!guild) {
            return interaction.editReply({ content: "❌ This command can only be used in a server." });
        }

        try {
            // 0. Check Tier Access
            const access = await checkTierAccess(interaction, 'Pro');
            if (!access.allowed) {
                return interaction.editReply({ content: access.reason });
            }

            // 1. Fetch linked members using batch API
            const members = await guild.members.fetch({ limit: 100 });
            const discordIds = members.filter(m => !m.user.bot).map(m => m.id);

            const batchRes = await fetch(`${API_BASE}/api/discord/batch-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordIds })
            });

            if (!batchRes.ok) throw new Error("Failed to resolve links");
            const { links } = await batchRes.json();
            const steamIds = links.map(l => l.steamId);

            if (steamIds.length < 2) {
                return interaction.editReply({
                    content: "❌ Not enough linked users in this server to generate hype! Need at least 2 people to run `/link`."
                });
            }

            // 2. Fetch Activity for these users
            const activityRes = await fetch(`${API_BASE}/api/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: steamIds })
            });

            if (!activityRes.ok) throw new Error("Activity API failed");
            const activityData = await activityRes.json();
            const hotGames = activityData.hot || [];

            if (hotGames.length === 0) {
                return interaction.editReply({ content: "🏮 Things are quiet... No recent shared activity found!" });
            }

            const embed = new EmbedBuilder()
                .setColor(0xFF4500)
                .setTitle(`🔥 Squad Hype: ${guild.name}`)
                .setDescription(`Trending games based on recent playtime from **${steamIds.length} linked members**.`)
                .setThumbnail(guild.iconURL())
                .setTimestamp();

            hotGames.forEach((game, i) => {
                const hours = (game.totalRecentMinutes / 60).toFixed(1);
                const playerNames = game.players.map(p => {
                    const link = links.find(l => l.steamId === p.steamid);
                    return members.get(link?.discordId)?.displayName || "Unknown";
                });

                embed.addFields({
                    name: `${i + 1}. ${game.name}`,
                    value: `🚀 **${game.players.length} players** • ⏱️ **${hours}h** total\n*Played by: ${playerNames.join(', ')}*`,
                    inline: false
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("Hype command error:", err);
            await interaction.editReply({ content: "❌ Something went wrong while generating the hype train." });
        }
    },
};
