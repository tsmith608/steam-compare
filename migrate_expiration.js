const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function migrate() {
    console.log("Connecting to database...");
    const client = await pool.connect();
    try {
        console.log("Adding 'expires_at' column to premium_users...");
        await client.query(`
            ALTER TABLE premium_users ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
        `);

        // Update existing users to have no expiration (assume they are admins/manual for now)
        // or we could set them to +30 days if we wanted to be strict.
        // Let's leave them as NULL (unlimited) for now to avoid locking people out.

        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
