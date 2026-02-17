import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamid');

    if (!steamId) {
        return NextResponse.json({ error: 'Steam ID required' }, { status: 400 });
    }

    try {
        // 1. Check if user already has a pending code
        const existing = await query('SELECT short_code FROM pending_upgrades WHERE steam_id = $1 LIMIT 1', [steamId]);

        if (existing.rows.length > 0) {
            return NextResponse.json({ shortCode: `WBP-${existing.rows[0].short_code}` });
        }

        // 2. Generate a new 6-character alphanumeric code if none exists
        const shortCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const displayCode = `WBP-${shortCode}`;

        await query(
            `INSERT INTO pending_upgrades (short_code, steam_id, created_at) 
             VALUES ($1, $2, NOW())`,
            [shortCode, steamId]
        );

        return NextResponse.json({ shortCode: displayCode });
    } catch (error) {
        console.error('Error generating short code:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
