
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_collections'");
        return NextResponse.json({ columns: res.rows });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
