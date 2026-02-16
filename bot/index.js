const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.GuildCreate, async guild => {
    const welcomeCommand = client.commands.get('welcome');
    if (welcomeCommand) {
        // Try to find a channel to send the welcome message to
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
        if (channel) {
            // Mock interaction-like object or just send message
            // Since execute expects interaction, we might want to refactor welcome logic or just construct a simplified message here.
            // For simplicity, let's just send a message directly matching what /welcome does.
            const welcomeText = `
**Welcome to Steamer!** 🎮
I'm here to help you and your friends find games to play together.

**How to get started:**
1.  **Link your Steam Account**:
    Type \`/link\` (or \`/login\`) to securely link your Discord account to your Steam profile.
    
2.  **Compare Games**:
    Type \`/compare @Friend1 @Friend2\` to instantly see what multiplayer games you share.

3.  **Visit the Website**:
    Check out [Webothplay.com](https://webothplay.com) for the full visual experience.

*Type \`/help\` for more info.*
`;
            await channel.send(welcomeText).catch(console.error);
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Check for token
if (!process.env.DISCORD_TOKEN) {
    console.warn("WARNING: DISCORD_TOKEN is missing in .env. Bot will not start.");
} else {
    client.login(process.env.DISCORD_TOKEN);
}

// Prevent crash on unhandled errors
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});
