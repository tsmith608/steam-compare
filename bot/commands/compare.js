const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compare')
        .setDescription('Compare games between yourself and other users')
        .addUserOption(option => option.setName('user1').setDescription('First user to compare with'))
        .addUserOption(option => option.setName('user2').setDescription('Second user to compare with'))
        .addUserOption(option => option.setName('user3').setDescription('Third user to compare with')),
    async execute(interaction) {
        await interaction.deferReply();

        // 1. Collect all users involved (Self + mentions)
        const targets = [interaction.user];
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');
        const u3 = interaction.options.getUser('user3');
        if (u1) targets.push(u1);
        if (u2) targets.push(u2);
        if (u3) targets.push(u3);

        // Remove duplicates
        const uniqueUsers = [...new Map(targets.map(u => [u.id, u])).values()];

        // 2. Resolve Steam IDs via valid API
        const resolved = [];
        const missing = [];

        // Production URL
        const API_BASE = 'https://webothplay.com';

        for (const user of uniqueUsers) {
            try {
                // Fetch from our local API
                const res = await fetch(`${API_BASE}/api/discord/link?discord_id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.steamId) {
                        resolved.push({ user, steamId: data.steamId });
                    } else {
                        missing.push(user);
                    }
                } else {
                    missing.push(user);
                }
            } catch (err) {
                console.error(`Failed to fetch for ${user.username}:`, err);
                missing.push(user);
            }
        }

        // 3. Handle Missing Users
        if (missing.length > 0) {
            const missingNames = missing.map(u => `**${u.username}**`).join(', ');
            return interaction.editReply({
                content: `❌ I couldn't find Steam accounts for: ${missingNames}.\n\nThey need to run \`/link\` first to connect their accounts!`,
            });
        }

        // 4. Generate Link
        const steamParams = resolved.map(r => `steamid=${r.steamId}`).join('&');
        const compareUrl = `${API_BASE}/?${steamParams}`;

        const embed = new EmbedBuilder()
            .setColor(0x60A5FA)
            .setTitle('🎮 Ready to Compare!')
            .setDescription(`Found Steam accounts for **${resolved.length} users**.\nClick below to see your shared games!`)
            .addFields(
                { name: 'Users', value: resolved.map(r => `• ${r.user.username}`).join('\n') }
            )
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('View Comparison')
                    .setStyle(ButtonStyle.Link)
                    .setURL(compareUrl)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};
