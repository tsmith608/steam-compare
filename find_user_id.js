const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'bot', '.env') });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function run() {
    client.once('ready', async () => {
        console.log('Ready!');
        const guildId = '1052429675013611540';
        try {
            const guild = await client.guilds.fetch(guildId);
            console.log(`Searching in guild: ${guild.name}`);
            const members = await guild.members.fetch();
            const target = members.find(m => m.user.username.toLowerCase().includes('humphrey') || m.displayName.toLowerCase().includes('humphrey'));

            if (target) {
                console.log(`Found User: ${target.user.tag} (${target.id})`);
            } else {
                console.log('User not found in guild.');
                console.log('Available members:');
                members.forEach(m => console.log(`- ${m.user.tag} (${m.id})` || `- ${m.user.username} (${m.id})`));
            }
        } catch (err) {
            console.error(err);
        } finally {
            client.destroy();
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

run();
