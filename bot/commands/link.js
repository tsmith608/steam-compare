const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Steam account to We Both Play'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        // TODO: detecting env to switch between localhost and production
        const url = `https://webothplay.com/auth/discord?discord_id=${discordId}`;

        await interaction.reply({
            content: `🔗 **Link your Steam Account**\n\nClick the link below to sign in with Steam and link it to your Discord account. This allows us to see your games for comparisons!\n\n${url}`,
            ephemeral: true
        });
    },
};
