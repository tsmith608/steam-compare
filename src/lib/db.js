import { Pool } from 'pg';

const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
// An sslmode in the URL (Vercel's Supabase integration adds ?sslmode=require) overrides
// the ssl option below and turns on certificate checks that Supabase's pooler fails,
// so drop it, as scripts/migrate.mjs does: the connection is still encrypted.
const connectionString = raw && raw.replace(/([?&])sslmode=[^&]*(&|$)/, (_, a, b) => (b ? a : '')).replace(/[?&]$/, '');

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
        ? { rejectUnauthorized: false }
        : undefined,
});

export const query = (text, params) => pool.query(text, params);
