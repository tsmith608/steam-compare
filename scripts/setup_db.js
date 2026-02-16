const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Creating discord_users table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS discord_users (
        discord_id TEXT PRIMARY KEY,
        steam_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Table created successfully!');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
