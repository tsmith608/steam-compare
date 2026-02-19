
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    try {
        // Fetch strictly public collections by ID
        const res = await query(
            "SELECT * FROM user_collections WHERE id = $1 AND is_public = true",
            [id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: "Collection not found or private" }, { status: 404 });
        }

        return NextResponse.json({ collection: res.rows[0] });
    } catch (error) {
        console.error("Error fetching public collection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
