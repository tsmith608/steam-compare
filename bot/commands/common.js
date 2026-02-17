const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('common')
        .setDescription('Search for specific shared games details')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Name of game to search for (e.g. "Left 4 Dead")')
                .setRequired(true))
        .addUserOption(option => option.setName('user1').setDescription('First user'))
        .addChannelOption(option =>
            option.setName('voice')
                .setDescription('Use voice channel')
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const search = interaction.options.getString('search').toLowerCase();

        const targets = [interaction.user];
        const u1 = interaction.options.getUser('user1');
        const voiceChannel = interaction.options.getChannel('voice');

        if (u1) targets.push(u1);
        if (voiceChannel) {
            voiceChannel.members.forEach(member => {
                if (!member.user.bot) targets.push(member.user);
            });
        }

        const uniqueUsers = [...new Map(targets.map(u => [u.id, u])).values()];
        const API_BASE = 'https://webothplay.com';

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
        }

        const resolved = [];
        for (const user of uniqueUsers) {
            try {
                const res = await fetch(`${API_BASE}/api/discord/link?discord_id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.steamId) resolved.push({ user, steamId: data.steamId });
                }
            } catch (e) { }
        }

        if (resolved.length < 2) {
            return interaction.editReply({ content: '❌ Need at least 2 people to find "common" games!' });
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: resolved.map(r => r.steamId) })
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();
            const shared = data.shared || [];

            const matches = shared.filter(g => g.name.toLowerCase().includes(search));

            if (matches.length === 0) {
                return interaction.editReply({ content: `❌ No shared games found matching "${search}".` });
            }

            const description = matches.slice(0, 10).map(g => {
                const totalMinutes = Object.values(g.playtimes).reduce((a, b) => a + b, 0);
                const hours = Math.round(totalMinutes / 60);
                return `**${g.name}** (${hours}h combined)`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`🔍 Found ${matches.length} matches for "${search}"`)
                .setDescription(description)
                .setFooter({ text: matches.length > 10 ? 'Showing top 10 results...' : 'All results shown.' });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Failed to search.' });
        }
    },
};
