const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Introduction to Steamer and how to use it.'),
    async execute(interaction) {
        const welcomeEncoded = `
**Welcome to Steamer!** 🎮
I'm here to help you and your friends find games to play together.

**How to get started:**
1.  **Link your Steam Account**:
    Type \`/link\` (or \`/login\`) to securely link your Discord account to your Steam profile.
    *This lets you skip typing your Steam ID every time!*

2.  **Compare Games**:
    Type \`/compare @Friend1 @Friend2\` to instantly see what multiplayer games you share.
    *You can mention up to 3 friends!*

3.  **Visit the Website**:
    Check out [Webothplay.com](https://webothplay.com) for the full visual experience.

**Need Help?**
Type \`/help\` for a list of all commands.

*Happy Gaming!* 🚀
`;
        await interaction.reply({ content: welcomeEncoded, ephemeral: true });
    },
};
