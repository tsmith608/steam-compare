const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log("Checking for columns in 'users' table...");
        const res = await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS persona_name TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS vanity_id TEXT;
        `);
        console.log("Migration successful (or columns already exist).");

        // Let's also check the actual columns
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log("Current columns:", cols.rows.map(r => r.column_name));

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
