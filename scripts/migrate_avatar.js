const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Manually load .env.local
try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
} catch (e) {
    console.warn('Failed to load .env.local manually', e);
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
    console.error('No database connection string found in environment variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
        ? { rejectUnauthorized: false }
        : undefined,
});

async function migrate() {
    try {
        console.log('Starting migration...');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Add avatar_url column if it doesn't exist
            console.log('Adding avatar_url column if not exists...');
            await client.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            `);

            await client.query('COMMIT');
            console.log('Migration completed successfully.');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
