const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log("Adding dashboard_layout column...");
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT NULL');
        console.log('Added dashboard_layout column');

        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log("Current columns:", cols.rows.map(r => r.column_name));
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
