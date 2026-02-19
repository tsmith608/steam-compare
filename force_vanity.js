
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
});

async function run() {
    await client.connect();
    try {
        const CORRECT_ID = '76561198274289867';
        const VANITY = 'Farted';

        // 1. Ensure no one else has this vanity in DB (delete Namra if he's holding it)
        await client.query("UPDATE users SET vanity_id = NULL WHERE vanity_id = $1", [VANITY]);

        // 2. Assign to correct user
        // We already deleted Farted earlier, so we might need to INSERT him if he's gone, 
        // or UPDATE if he was re-fetched by the user's recent activity.
        // Let's try UPSERT.

        const res = await client.query(`
      INSERT INTO users (steam_id, persona_name, vanity_id, updated_at)
      VALUES ($1, 'Farted', $2, NOW())
      ON CONFLICT (steam_id) 
      DO UPDATE SET vanity_id = $2, updated_at = NOW()
    `, [CORRECT_ID, VANITY]);

        console.log(`Force-linked vanity '${VANITY}' to ${CORRECT_ID}.`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
