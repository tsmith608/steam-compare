const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Generate your Gamer Resume')
        .addUserOption(option => option.setName('user').setDescription('User to lookup (optional)')),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;
        const API_BASE = 'https://webothplay.com';

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

        try {
            // "Compare" single user to get their library
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: [steamId, steamId] }) // double ID trick just in case, or API handles single
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();

            // Logic: API might return shared (if 2 ids) or unique. 
            // If we sent same ID twice, "shared" should be their whole library.
            let library = data.shared || [];

            if (library.length === 0 && data.unique && data.unique[steamId]) {
                library = data.unique[steamId];
            }

            if (library.length === 0) {
                return interaction.editReply({ content: '❌ No games found.' });
            }

            // Calc Stats
            const totalGames = library.length;
            let totalMinutes = 0;

            const sorted = library.map(g => {
                // If shared format, playtimes is obj. If unique, it's flat.
                const pt = g.playtimes ? g.playtimes[steamId] : g.playtime_forever;
                totalMinutes += pt;
                return { name: g.name, pt };
            }).sort((a, b) => b.pt - a.pt);

            const totalHours = Math.round(totalMinutes / 60);
            const days = (totalHours / 24).toFixed(1);

            const top3 = sorted.slice(0, 3).map((g, i) => {
                return `${i + 1}. **${g.name}** (${Math.round(g.pt / 60)}h)`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x9B59B6)
                .setTitle(`📜 Gamer Resume: ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: 'Total Playtime', value: `${totalHours} Hours (${days} Days)`, inline: true },
                    { name: 'Library Size', value: `${totalGames} Games`, inline: true },
                    { name: 'Most Played', value: top3 || 'None', inline: false }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Failed to generate stats.' });
        }
    },
};
