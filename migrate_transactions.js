const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function migrate() {
    console.log("Connecting to database...");
    const client = await pool.connect();
    try {
        console.log("Creating transactions table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS kofi_transactions (
        transaction_id TEXT PRIMARY KEY,
        amount DECIMAL(10,2),
        currency TEXT,
        tier_name TEXT,
        message TEXT,
        supporter_name TEXT,
        supporter_email TEXT,
        steam_id TEXT, -- Can be null initially
        processed_at TIMESTAMP DEFAULT NOW(),
        claimed_at TIMESTAMP -- Null if linked automatically via webhook
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
