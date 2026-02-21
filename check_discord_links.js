const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
});

async function run() {
    await client.connect();
    try {
        console.log("Searching for linked users...");
        const res = await client.query('SELECT discord_id, steam_id, persona_name, vanity_id FROM users WHERE discord_id IS NOT NULL');
        console.log("Total linked users:", res.rowCount);
        res.rows.forEach(r => console.log(JSON.stringify(r, null, 2)));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
