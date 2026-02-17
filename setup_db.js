const { Pool } = require('pg');

const connectionString = "postgresql://postgres.uvonvuoafgtnrnrbfiih:WhoDoesntPlayGamesRn12@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
});

async function setup() {
  console.log("Connecting to database...");
  const client = await pool.connect();
  try {
    console.log("Creating premium_users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS premium_users (
        steam_id TEXT PRIMARY KEY,
        added_at TIMESTAMP DEFAULT NOW(),
        source TEXT DEFAULT 'manual'
      );
    `);

    console.log("Creating user_profiles table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        steam_id TEXT PRIMARY KEY,
        discord_link TEXT,
        twitter_link TEXT,
        twitch_link TEXT,
        youtube_link TEXT,
        bio TEXT,
        pinned_game_ids JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Creating user_collections table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_steam_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        game_ids JSONB DEFAULT '[]',
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Inserting admin user (76561198881424318)...");
    await client.query(`
      INSERT INTO premium_users (steam_id, source)
      VALUES ($1, 'admin')
      ON CONFLICT (steam_id) DO NOTHING;
    `, ['76561198881424318']);

    console.log("Querying table to verify...");
    const res = await client.query('SELECT * FROM premium_users');
    console.log("Current Premium Users:", res.rows);

    console.log("Database setup complete!");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    client.release();
    pool.end();
  }
}

setup();
