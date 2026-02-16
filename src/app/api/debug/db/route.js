import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const start = Date.now();
        // Simple query to checking connection
        const result = await query("SELECT NOW() as now");

        // Check environment variables (masked)
        const envCheck = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            POSTGRES_URL: !!process.env.POSTGRES_URL,
            POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
            NODE_ENV: process.env.NODE_ENV,
        };

        return NextResponse.json({
            success: true,
            time: result.rows[0].now,
            duration: Date.now() - start + "ms",
            env: envCheck
        });
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: err.message,
            code: err.code,
            detail: err.detail,
        }, { status: 500 });
    }
}
