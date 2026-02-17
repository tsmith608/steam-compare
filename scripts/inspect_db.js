const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function inspect() {
    console.log("🔍 Inspecting database...");
    const client = await pool.connect();

    try {
        const users = await client.query("SELECT * FROM users LIMIT 5");
        console.log("👥 Users Sample:", users.rows);

        const kofi = await client.query("SELECT * FROM kofi_transactions LIMIT 5");
        console.log("☕ Ko-fi Transactions Sample:", kofi.rows);

        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("📁 Tables in database:", tables.rows.map(r => r.table_name));

    } catch (err) {
        console.error("❌ Inspection error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
