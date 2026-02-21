const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
});

async function run() {
    await client.connect();
    try {
        const discordId = '458081832156790794';
        const steamId = '76561198274289867';

        console.log(`Linking Discord ID ${discordId} to Steam ID ${steamId}...`);

        const res = await client.query(
            'UPDATE users SET discord_id = $1 WHERE steam_id = $2 RETURNING *',
            [discordId, steamId]
        );

        if (res.rowCount > 0) {
            console.log("SUCCESS: Link updated!");
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log("ERROR: Steam ID not found in database.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
