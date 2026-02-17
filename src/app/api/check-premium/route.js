import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const steamid = searchParams.get('steamid');

    if (!steamid) {
        return NextResponse.json({ isPremium: false });
    }

    try {
        const result = await query(
            'SELECT tier FROM users WHERE steam_id = $1 AND (expires_at IS NULL OR expires_at > NOW())',
            [steamid]
        );
        const dbTier = result.rowCount > 0 ? result.rows[0].tier : 'Noob';
        const isPremium = dbTier === 'Hacker' || dbTier === 'Pro';

        return NextResponse.json({
            isPremium,
            tier: dbTier
        });
    } catch (error) {
        console.error('Database error:', error);
        // Fail safe on error
        return NextResponse.json({ isPremium: false, error: 'Database check failed' });
    }
}
