const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function migrate() {
    console.log("Connecting to database...");
    const client = await pool.connect();
    try {
        console.log("Adding 'tier' column to premium_users...");
        await client.query(`
      ALTER TABLE premium_users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Bronze';
    `);

        console.log("Creating pending_upgrades table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS pending_upgrades (
        short_code TEXT PRIMARY KEY,
        steam_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
