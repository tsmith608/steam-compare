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
                { name: '🟢 Free Commands (Noob)', value: '🔗 **/link**: Link Steam\n🎮 **/compare**: Compare with friends (up to 3 users)\n👋 **/welcome**: Show guide\n❓ **/help**: Show this list' },
                { name: '💎 Premium Commands (Pro/Hacker)', value: '🎰 **/roulette**: Pick a random game\n🔍 **/common**: Search shared games\n📜 **/stats**: View Gamer Resume\n🛑 **/backlog**: Find unplayed games\n❤️ **/compatibility**: Check library overlap\n🔥 **/hype**: Trending games in server\n🏆 **/leaderboard**: Top gamers in server' },
                { name: '✨ Hacker Server Perk', value: 'If a **Hacker** tier member is in your server, **everyone** gets access to Premium commands and higher comparison limits (up to 12 users)!' }
            )
            .setFooter({ text: 'Visit webothplay.com for the full experience!' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
