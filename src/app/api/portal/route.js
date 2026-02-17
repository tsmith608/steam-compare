import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('Missing STRIPE_SECRET_KEY');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
        }
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const { steamid } = await request.json();

        if (!steamid) {
            return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
        }

        // 1. Find the customer ID from our database
        const userRes = await query('SELECT stripe_customer_id FROM users WHERE steam_id = $1', [steamid]);

        if (userRes.rows.length === 0 || !userRes.rows[0].stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer found for this account' }, { status: 404 });
        }

        const customerId = userRes.rows[0].stripe_customer_id;

        // 2. Create a portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${request.nextUrl.origin}/upgrade`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Customer Portal error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
