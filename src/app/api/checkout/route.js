import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { steamid, tier } = await request.json();

        if (!steamid) {
            return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
        }

        // define prices based on tier (user should replace these with their actual Stripe Price IDs)
        const priceMap = {
            'Pro': process.env.STRIPE_PRICE_ID_PRO, // e.g. price_123...
            'Hacker': process.env.STRIPE_PRICE_ID_HACKER,
        };

        const priceId = priceMap[tier] || priceMap['Pro'];

        if (!priceId) {
            console.error('Missing Stripe Price IDs for tier:', tier);
            return NextResponse.json({ error: 'Payment system not fully configured' }, { status: 500 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            subscription_data: {
                metadata: {
                    steam_id: steamid,
                    tier: tier || 'Pro',
                },
            },
            success_url: `${request.nextUrl.origin}/?success=true`,
            cancel_url: `${request.nextUrl.origin}/upgrade?canceled=true`,
            client_reference_id: steamid,
            metadata: {
                steam_id: steamid,
                tier: tier || 'Pro',
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout session error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
