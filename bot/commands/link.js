const { SlashCommandBuilder } = require('discord.js');
const { linkUrl } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Steam account to We Both Play'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const url = linkUrl(discordId);

        await interaction.reply({
            content: `🔗 **Link your Steam Account**\n\nClick the link below (valid for 1 hour) to sign in with Steam and link it to your Discord account. We only read your public game library.\n\n${url}`,
            ephemeral: true
        });
    },
};
