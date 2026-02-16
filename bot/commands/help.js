const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Steamer Bot Commands')
            .setDescription('Here are the commands you can use:')
            .addFields(
                { name: '🔗 /link', value: 'Link your Steam account to your Discord user. This saves you from typing your ID every time.' },
                { name: '🎮 /compare [user1] [user2]...', value: 'Compare your Steam library with others. You can mention up to 3 friends!' },
                { name: '👋 /welcome', value: 'Show the introduction message.' },
                { name: '❓ /help', value: 'Show this list of commands.' },
            )
            .setFooter({ text: 'Visit webothplay.com for the full experience!' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
