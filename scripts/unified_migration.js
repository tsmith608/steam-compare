const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function runMigration() {
    console.log("🚀 Starting unified database migration...");
    const client = await pool.connect();

    try {
        // 1. Ensure users table exists with all required columns
        console.log("✅ Ensuring 'users' table and columns...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                steam_id TEXT PRIMARY KEY,
                tier TEXT DEFAULT 'Noob',
                stripe_customer_id TEXT,
                subscription_id TEXT,
                expires_at TIMESTAMP WITH TIME ZONE,
                transaction_id TEXT UNIQUE,
                source TEXT DEFAULT 'manual',
                purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add columns individually in case the table existed without them
        const columns = [
            { name: 'tier', type: 'TEXT DEFAULT \'Noob\'' },
            { name: 'stripe_customer_id', type: 'TEXT' },
            { name: 'subscription_id', type: 'TEXT' },
            { name: 'expires_at', type: 'TIMESTAMP WITH TIME ZONE' },
            { name: 'transaction_id', type: 'TEXT UNIQUE' },
            { name: 'source', type: 'TEXT DEFAULT \'manual\'' },
            { name: 'purchased_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' },
            { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' }
        ];

        for (const col of columns) {
            try {
                await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (e) {
                // Ignore if column already exists or other minor issues
            }
        }

        // 2. Ensure supporting tables exist
        console.log("✅ Ensuring 'kofi_transactions' and 'stripe_transactions' tables...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS kofi_transactions (
                transaction_id TEXT PRIMARY KEY,
                amount DECIMAL(10,2),
                currency TEXT,
                tier_name TEXT,
                message TEXT,
                supporter_name TEXT,
                supporter_email TEXT,
                steam_id TEXT,
                processed_at TIMESTAMP DEFAULT NOW(),
                claimed_at TIMESTAMP
            );

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

        // 3. Migrate data from premium_users if it exists
        console.log("✅ Checking for data to migrate from 'premium_users'...");
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'premium_users'
            );
        `);

        if (tableCheck.rows[0].exists) {
            console.log("📊 Found 'premium_users' table. Migrating data...");
            const oldUsers = await client.query("SELECT * FROM premium_users");
            console.log(`📝 Found ${oldUsers.rows.length} users in 'premium_users'.`);

            for (const user of oldUsers.rows) {
                await client.query(`
                    INSERT INTO users (steam_id, tier, source, purchased_at)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (steam_id) DO UPDATE SET
                        tier = CASE WHEN users.tier = 'Noob' THEN EXCLUDED.tier ELSE users.tier END,
                        source = COALESCE(users.source, EXCLUDED.source),
                        purchased_at = COALESCE(users.purchased_at, EXCLUDED.purchased_at)
                `, [
                    user.steam_id,
                    user.tier || 'Pro', // Default to Pro if they were in premium_users
                    user.source || 'legacy',
                    user.added_at || new Date()
                ]);
            }
            console.log("🎉 Migration of legacy users complete!");
        } else {
            console.log("ℹ️ No 'premium_users' table found. Skipping migration.");
        }

        console.log("✨ All migrations completed successfully!");

    } catch (err) {
        console.error("❌ Migration error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
