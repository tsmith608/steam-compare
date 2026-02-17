import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const { steamid, transactionId } = await request.json();

        if (!steamid || !transactionId) {
            return NextResponse.json({ error: 'Steam ID and Transaction ID are required' }, { status: 400 });
        }

        // 1. Find the transaction
        const check = await query(
            'SELECT tier_name, steam_id FROM kofi_transactions WHERE transaction_id = $1',
            [transactionId]
        );

        if (check.rows.length === 0) {
            return NextResponse.json({ error: 'Transaction ID not found. Please ensure the payment was successful.' }, { status: 404 });
        }

        const trans = check.rows[0];
        const tier = trans.tier_name || 'Bronze';

        // 2. Link it to the user's Steam ID
        // First update the transaction log
        await query(
            'UPDATE kofi_transactions SET steam_id = $1, claimed_at = NOW() WHERE transaction_id = $2',
            [steamid, transactionId]
        );

        // Then grant the premium
        await query(
            `INSERT INTO users (steam_id, transaction_id, purchased_at, source, tier) 
             VALUES ($1, $2, CURRENT_TIMESTAMP, 'claim', $3) 
             ON CONFLICT (steam_id) DO UPDATE SET 
                transaction_id = EXCLUDED.transaction_id,
                purchased_at = EXCLUDED.purchased_at,
                source = EXCLUDED.source,
                tier = EXCLUDED.tier`,
            [steamid, transactionId, tier]
        );

        return NextResponse.json({
            success: true,
            tier: tier
        });

    } catch (error) {
        console.error('Claim error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
