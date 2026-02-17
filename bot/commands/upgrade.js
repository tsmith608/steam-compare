const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upgrade')
        .setDescription('Upgrade to We Both Play Hacker or Pro tiers'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        // In the future, we might want to fetch Steam ID first to pre-link
        const url = `https://webothplay.com/upgrade`;

        await interaction.reply({
            content: `🚀 **Level Up Your Experience!**\n\nUpgrade to **Pro** or **Hacker** to unlock:\n• 6-12 user comparisons\n• Voice channel integration\n• Roulette, Stats, Backlog & more!\n\n[**View Plans & Upgrade Here**](${url})`,
            ephemeral: true
        });
    },
};
