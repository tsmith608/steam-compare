const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function migrate() {
    console.log("Connecting to database...");
    const client = await pool.connect();
    try {
        console.log("Adding Stripe columns to 'users' table...");
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
            ADD COLUMN IF NOT EXISTS subscription_id TEXT;
        `);

        console.log("Creating stripe_transactions table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS stripe_transactions (
                id TEXT PRIMARY KEY,
                customer_id TEXT,
                steam_id TEXT,
                amount DECIMAL(10,2),
                currency TEXT,
                status TEXT,
                type TEXT,
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
