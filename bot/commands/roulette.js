const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

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

        // reuse logic from compare to get users... 
        // ideally we'd refactor this into a helper, but for now copy-paste is safer for a quick implementation
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
        const API_BASE = 'https://webothplay.com';

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason });
        }

        // Resolve Steam IDs (Simplified for brevity)
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

        if (resolved.length < 1) { // Roulette can work for 1 person too!
            return interaction.editReply({ content: '❌ No linked users found! Use `/link` first.' });
        }

        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: resolved.map(r => r.steamId) })
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();

            // Shared or Unique (if single user, we use their unique games as "shared" effectively)
            let pool = data.shared || [];

            // If checking single user, use their owned games
            if (resolved.length === 1 && data.unique && data.unique[resolved[0].steamId]) {
                pool = data.unique[resolved[0].steamId];
            }

            if (pool.length === 0) {
                return interaction.editReply({ content: '❌ No games found to pick from!' });
            }

            // Pick Random
            const randomGame = pool[Math.floor(Math.random() * pool.length)];

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🎰 The Roulette Spun...')
                .setDescription(`And landed on:\n# **${randomGame.name}**`)
                .setFooter({ text: `Picked from ${pool.length} games.` });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Failed to spin the roulette.' });
        }
    },
};
