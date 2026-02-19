const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Adding new columns to users table...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS custom_banner TEXT,
            ADD COLUMN IF NOT EXISTS custom_page_bg TEXT,
            ADD COLUMN IF NOT EXISTS custom_banner_pos INTEGER DEFAULT 50,
            ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS gamer_title TEXT,
            ADD COLUMN IF NOT EXISTS featured_collection_id TEXT,
            ADD COLUMN IF NOT EXISTS profile_theme_preset TEXT;
        `);
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
