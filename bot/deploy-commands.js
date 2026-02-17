const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        if (!process.env.DISCORD_CLIENT_ID) {
            console.error("Error: DISCORD_CLIENT_ID is missing in .env");
            return;
        }

        // The put method is used to fully refresh all commands in the guild with the current set
        let data;
        const guildId = process.env.GUILD_ID;

        if (guildId) {
            console.log(`Using Guild ID: ${guildId} (Instant Updates)`);

            // 1. Deploy Guild Commands
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guildId),
                { body: commands },
            );

            // 2. Clear Global Commands (to prevent duplicates)
            console.log("Clearing Global Commands to prevent duplicates...");
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: [] },
            );
        } else {
            console.log("Using Global Commands (May take up to 1 hour to update)");
            data = await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands },
            );
        }

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
