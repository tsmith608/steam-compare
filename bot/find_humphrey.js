const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function run() {
    client.once('ready', async () => {
        const guildId = '1052429675013611540';
        try {
            const guild = await client.guilds.fetch(guildId);
            console.log(`Searching in guild: ${guild.name}`);
            const members = await guild.members.fetch();
            const target = members.find(m =>
                m.user.username.toLowerCase() === 'humphrey9549' ||
                m.displayName.toLowerCase() === 'humphrey9549' ||
                m.user.tag.toLowerCase() === 'humphrey9549'
            );

            if (target) {
                console.log(`SUCCESS_FOUND: ${target.user.tag} (${target.id})`);
            } else {
                console.log('User not found. Members list:');
                members.forEach(m => console.log(`- ${m.user.username} (ID: ${m.id})`));
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
