const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Log in to We Both Play (Alias for /link)'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const url = `https://webothplay.com/auth/discord?discord_id=${discordId}`;

        await interaction.reply({
            content: `🔗 **Link your Steam Account**\n\nClick the link below to sign in with Steam and link it to your Discord account.\n\n${url}`,
            ephemeral: true
        });
    },
};
