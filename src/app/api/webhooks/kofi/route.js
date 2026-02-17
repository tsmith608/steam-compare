import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const data = JSON.parse(formData.get('data'));

        // 1. Verify Verification Token
        const verificationToken = process.env.KOFI_WEBHOOK_VERIFICATION_TOKEN;
        if (verificationToken && data.verification_token !== verificationToken) {
            console.error('Webhook verification failed: Invalid token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Received Ko-fi Webhook:', data);

        // 2. Filter for successful payments/subscriptions
        const isSuccess = ['Donation', 'Subscription', 'Commission', 'Shop Order'].includes(data.type);
        if (!isSuccess) {
            return NextResponse.json({ status: 'ignored' });
        }

        // 3. Extract Meta Info
        const transactionId = data.kofi_transaction_id;
        const amount = parseFloat(data.amount);
        const tierName = data.tier_name || 'Pro';
        const message = (data.message || '').trim();

        // 4. Extract Steam ID or Short Code from message
        const steamIdMatch = message.match(/\d{17}/);
        const urlMatch = message.match(/profiles\/(\d{17})/);
        const shortCodeMatch = message.match(/WBP-([A-Z0-9]{3,8})/i);

        let steamId = steamIdMatch ? steamIdMatch[0] : (urlMatch ? urlMatch[1] : null);
        let shortCode = shortCodeMatch ? shortCodeMatch[1].toUpperCase() : null;

        // resolve code
        if (!steamId && shortCode) {
            const pending = await query('SELECT steam_id FROM pending_upgrades WHERE short_code = $1', [shortCode]);
            if (pending.rows.length > 0) {
                steamId = pending.rows[0].steam_id;
                await query('DELETE FROM pending_upgrades WHERE short_code = $1', [shortCode]);
            }
        }

        // AUTO-RESOLVE RECURRING PAYMENTS
        // If no code is provided, check if we've seen this email before and linked it to a Steam ID
        if (!steamId && data.email) {
            const prev = await query(
                'SELECT steam_id FROM kofi_transactions WHERE supporter_email = $1 AND steam_id IS NOT NULL ORDER BY processed_at DESC LIMIT 1',
                [data.email]
            );
            if (prev.rows.length > 0) {
                steamId = prev.rows[0].steam_id;
                console.log(`Auto-resolved Steam ID ${steamId} for recurring subscriber ${data.email}`);
            }
        }

        // 5. Log EVERY successful transaction
        await query(
            `INSERT INTO kofi_transactions 
             (transaction_id, amount, currency, tier_name, message, supporter_name, supporter_email, steam_id, processed_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
             ON CONFLICT (transaction_id) DO UPDATE SET 
                steam_id = EXCLUDED.steam_id,
                tier_name = EXCLUDED.tier_name`,
            [transactionId, amount, data.currency, tierName, message, data.from_name, data.email, steamId]
        );

        // 6. Update Primary Premium Table if ID found
        if (steamId) {
            await query(
                `INSERT INTO users (steam_id, transaction_id, purchased_at, source, tier, expires_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, NOW() + interval '32 days') 
                 ON CONFLICT (steam_id) DO UPDATE SET 
                    transaction_id = EXCLUDED.transaction_id,
                    purchased_at = EXCLUDED.purchased_at,
                    source = EXCLUDED.source,
                    tier = EXCLUDED.tier,
                    expires_at = EXCLUDED.expires_at`,
                [steamId, transactionId, 'kofi', tierName]
            );
            console.log(`Successfully upgraded/extended Steam ID ${steamId} to ${tierName} via Ko-fi (${transactionId})`);
        }

        return NextResponse.json({ status: 'success', steamId, tier: tierName });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
