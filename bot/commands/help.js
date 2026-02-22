const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🎮 We Both Play — Bot Commands')
            .setDescription('Here\'s everything I can do:')
            .addFields(
                {
                    name: '🟢 Free Commands', value: [
                        '🔗 **/link** — Link your Steam account',
                        '🎮 **/compare** — Compare libraries (up to 3 users)',
                        '🔍 **/compare search:** — Search for a specific shared game',
                        '❓ **/help** — Show this list',
                    ].join('\n')
                },
                {
                    name: '💎 Premium Commands (Pro/Hacker)', value: [
                        '🎰 **/roulette** — Spin for a random shared game',
                        '📜 **/stats** — View your Gamer Resume',
                        '🛑 **/backlog** — Find unplayed games (Pile of Shame)',
                        '❤️ **/compatibility** — Check library overlap %',
                        '💪 **/flex** — Compare achievements on a game',
                        '🔥 **/hype** — Trending games in your server',
                        '🏆 **/leaderboard** — Top gamers in your server',
                    ].join('\n')
                },
                { name: '✨ Hacker Server Perk', value: 'If a **Hacker** tier member is in your server, **everyone** gets access to Premium commands and higher comparison limits (up to 12 users)!' }
            )
            .setFooter({ text: 'Visit webothplay.com for the full experience!' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
