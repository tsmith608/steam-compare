const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, resolveSteamIds } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Randomly pick a game to play from your shared library')
        .addUserOption(option => option.setName('user1').setDescription('First user'))
        .addUserOption(option => option.setName('user2').setDescription('Second user'))
        .addChannelOption(option =>
            option.setName('voice')
                .setDescription('Use voice channel')
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
        }

        const targets = [interaction.user];
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');
        const voiceChannel = interaction.options.getChannel('voice');

        if (u1) targets.push(u1);
        if (u2) targets.push(u2);
        if (voiceChannel) {
            voiceChannel.members.forEach(member => {
                if (!member.user.bot) targets.push(member.user);
            });
        }

        const uniqueUsers = [...new Map(targets.map(u => [u.id, u])).values()];
        const discordIds = uniqueUsers.map(u => u.id);

        const links = await resolveSteamIds(discordIds);
        const resolved = links.map(l => ({
            user: uniqueUsers.find(u => u.id === l.discordId),
            steamId: l.steamId
        })).filter(r => r.user);

        if (resolved.length < 1) { // Roulette can work for 1 person too!
            return interaction.editReply({ content: '❌ No linked users found! Use `/link` first.' });
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: resolved.map(r => r.steamId) })
            });

            if (!compareRes.ok) {
                const errorData = await compareRes.json().catch(() => ({}));
                throw new Error(errorData.error || "API Error");
            }
            const data = await compareRes.json();

            // Shared or Unique (if single user, we use their unique games as "shared" effectively)
            let pool = data.shared || [];

            // If checking single user, use their owned games
            if (resolved.length === 1 && data.unique && data.unique[resolved[0].steamId]) {
                targetPool = data.unique[resolved[0].steamId];
                if (targetPool.length > 0) pool = targetPool;
            }

            if (pool.length === 0) {
                return interaction.editReply({ content: '❌ No games found to pick from! Is your Steam profile private?' });
            }

            // Pick Random
            const randomGame = pool[Math.floor(Math.random() * pool.length)];

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🎰 The Roulette Spun...')
                .setDescription(`And landed on:\n# **${randomGame.name}**`)
                .setFooter({ text: `Picked from ${pool.length} games.` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("Roulette error:", err);
            await interaction.editReply({ content: `❌ Failed to spin the roulette: ${err.message}` });
        }
    },
};
