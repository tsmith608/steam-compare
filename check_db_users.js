
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
});

async function run() {
    await client.connect();
    try {
        const res = await client.query('SELECT steam_id, persona_name, vanity_id, avatar_url FROM users WHERE steam_id IN ($1, $2)', ['76561198274289867', '76561198305593588']);
        console.log("DB Records:");
        res.rows.forEach(r => console.log(JSON.stringify(r, null, 2)));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
