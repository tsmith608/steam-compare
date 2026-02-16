import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
        ? { rejectUnauthorized: false }
        : undefined,
});

export const query = (text, params) => pool.query(text, params);
