import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const steamid = searchParams.get('steamid');

    if (!steamid) {
        return NextResponse.json({ isPremium: false });
    }

    try {
        const result = await query('SELECT 1 FROM premium_users WHERE steam_id = $1', [steamid]);
        return NextResponse.json({ isPremium: result.rowCount > 0 });
    } catch (error) {
        console.error('Database error:', error);
        // Fail safe on error
        return NextResponse.json({ isPremium: false, error: 'Database check failed' });
    }
}
