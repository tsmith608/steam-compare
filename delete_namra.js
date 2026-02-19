
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
});

async function run() {
    await client.connect();
    try {
        const id = '76561198305593588'; // Namra
        console.log(`Deleting Namra (${id}) from DB...`);
        const res = await client.query('DELETE FROM users WHERE steam_id = $1', [id]);
        console.log(`Deleted ${res.rowCount} row(s).`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
