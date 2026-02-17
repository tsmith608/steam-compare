import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;

    try {
        if (!sig || !webhookSecret) {
            console.error('Missing stripe-signature or webhook secret');
            return NextResponse.json({ error: 'Webhook Secret Required' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const steamId = session.metadata.steam_id || session.client_reference_id;
                const tier = session.metadata.tier || 'Pro';
                const customerId = session.customer;
                const subscriptionId = session.subscription;

                if (steamId) {
                    // Fetch subscription to get current_period_end
                    let expiresAt = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000); // Fallback
                    if (subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                        expiresAt = new Date(subscription.current_period_end * 1000);
                    }

                    // Update user table
                    await query(
                        `INSERT INTO users (steam_id, stripe_customer_id, subscription_id, purchased_at, source, tier, expires_at) 
                         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6) 
                         ON CONFLICT (steam_id) DO UPDATE SET 
                            stripe_customer_id = EXCLUDED.stripe_customer_id,
                            subscription_id = EXCLUDED.subscription_id,
                            purchased_at = EXCLUDED.purchased_at,
                            source = EXCLUDED.source,
                            tier = EXCLUDED.tier,
                            expires_at = EXCLUDED.expires_at`,
                        [steamId, customerId, subscriptionId, 'stripe', tier, expiresAt]
                    );

                    // Log transaction
                    await query(
                        `INSERT INTO stripe_transactions (id, customer_id, steam_id, amount, currency, status, type) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [session.id, customerId, steamId, session.amount_total / 100, session.currency, 'completed', 'checkout']
                    );

                    console.log(`Stripe: Successfully upgraded Steam ID ${steamId} to ${tier}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const tier = subscription.metadata.tier;
                const expiresAt = new Date(subscription.current_period_end * 1000);

                if (tier) {
                    await query(
                        'UPDATE users SET tier = $1, expires_at = $2 WHERE stripe_customer_id = $3',
                        [tier, expiresAt, customerId]
                    );
                    console.log(`Stripe: Subscription ${subscription.id} updated to tier ${tier} for customer ${customerId}`);
                } else {
                    await query(
                        'UPDATE users SET expires_at = $1 WHERE stripe_customer_id = $2',
                        [expiresAt, customerId]
                    );
                    console.log(`Stripe: Subscription ${subscription.id} updated (expiry: ${expiresAt}) for customer ${customerId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                // Mark the subscription as ended by setting subscription_id to NULL
                // But we keep the tier until expires_at passes
                await query(
                    'UPDATE users SET subscription_id = NULL WHERE stripe_customer_id = $1',
                    [customerId]
                );
                console.log(`Stripe: Subscription ${subscription.id} deleted for customer ${customerId}`);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const expiresAt = new Date(subscription.current_period_end * 1000);

                    // Extend membership
                    await query(
                        "UPDATE users SET expires_at = $1 WHERE subscription_id = $2",
                        [expiresAt, subscriptionId]
                    );
                    console.log(`Stripe: Invoice paid for subscription ${subscriptionId}, extended membership to ${expiresAt}.`);
                }
                break;
            }

            default:
                console.log(`Stripe: Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Stripe Webhook Error handler:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
