const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
});

async function run() {
    await client.connect();
    try {
        console.log("Searching for Steam ID: 76561198274289867...");
        const res = await client.query('SELECT discord_id, steam_id, persona_name, vanity_id FROM users WHERE steam_id = $1', ['76561198274289867']);
        console.log("Record found:", res.rowCount);
        res.rows.forEach(r => console.log(JSON.stringify(r, null, 2)));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
