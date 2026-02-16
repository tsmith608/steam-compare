import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = 'force-dynamic';

export async function GET() {
    const result = {
        env: {
            DATABASE_URL_SET: !!process.env.DATABASE_URL,
            POSTGRES_URL_SET: !!process.env.POSTGRES_URL,
            NODE_ENV: process.env.NODE_ENV,
        },
        tests: {}
    };

    try {
        // Test 1: Explicit SSL Config
        const cs = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
        if (!cs) throw new Error("No connection string found in env");

        const pool = new Pool({
            connectionString: cs,
            ssl: { rejectUnauthorized: false } // FORCE THIS
        });

        const t1 = Date.now();
        const q1 = await pool.query("SELECT NOW() as now");
        await pool.end();

        result.tests.explicit_ssl = {
            success: true,
            time: q1.rows[0].now,
            duration: Date.now() - t1 + "ms"
        };

    } catch (err) {
        result.tests.explicit_ssl = {
            success: false,
            error: err.message,
            code: err.code
        };
    }

    return NextResponse.json(result);
}
