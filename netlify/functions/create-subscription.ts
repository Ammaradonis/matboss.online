import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

const SETUP_FEE = 11900; // $119.00

const headers = { 'Content-Type': 'application/json' };

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers },
    );
  }

  // ── Validate env vars before doing anything ──
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return new Response(
      JSON.stringify({ error: 'Payment service is not configured.' }),
      { status: 500, headers },
    );
  }

  if (!priceId) {
    console.error('STRIPE_MONTHLY_PRICE_ID is not set — create a $197/month recurring price in Stripe Dashboard and add the price ID to Netlify env vars');
    return new Response(
      JSON.stringify({ error: 'Payment service is not configured.' }),
      { status: 500, headers },
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    const body = await req.json();
    const { school_name, owner_name, email, phone, num_students, current_software } = body;

    if (!school_name || !owner_name || !email || !phone || !num_students || !current_software) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers },
      );
    }

    // 1. Create a Stripe Customer
    const customer = await stripe.customers.create({
      name: owner_name,
      email,
      phone,
      metadata: {
        school_name,
        owner_name,
        num_students: String(num_students),
        current_software,
      },
    });
    console.log('Step 1 OK — customer:', customer.id);

    // 2. Add one-time setup fee — gets rolled into the first invoice automatically
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: SETUP_FEE,
      currency: 'usd',
      description: 'MatBoss Enrollment Engine — Setup & Implementation',
    });
    console.log('Step 2 OK — setup fee invoice item created');

    // 3. Create the subscription (incomplete until customer pays the first invoice)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        school_name,
        owner_name,
        email,
        phone,
        num_students: String(num_students),
        current_software,
      },
      expand: ['latest_invoice.payment_intent'],
    });
    console.log('Step 3 OK — subscription:', subscription.id, 'status:', subscription.status);

    const invoice = subscription.latest_invoice;
    console.log('Step 3a — latest_invoice type:', typeof invoice, 'value:', typeof invoice === 'string' ? invoice : (invoice as any)?.id);

    if (!invoice || typeof invoice === 'string') {
      const msg = `Subscription ${subscription.id} has no expanded invoice (got ${typeof invoice})`;
      console.error(msg);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 500, headers },
      );
    }

    const pi = (invoice as Stripe.Invoice).payment_intent;
    console.log('Step 3b — payment_intent type:', typeof pi, 'value:', typeof pi === 'string' ? pi : (pi as any)?.id, 'client_secret exists:', !!(pi as any)?.client_secret);

    if (!pi || typeof pi === 'string') {
      const msg = `Invoice ${(invoice as Stripe.Invoice).id} has no expanded payment_intent (got ${typeof pi}: ${pi})`;
      console.error(msg);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 500, headers },
      );
    }

    const paymentIntent = pi as Stripe.PaymentIntent;

    if (!paymentIntent.client_secret) {
      const msg = `PaymentIntent ${paymentIntent.id} has no client_secret (status: ${paymentIntent.status})`;
      console.error(msg);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 500, headers },
      );
    }

    console.log('Step 4 OK — returning client_secret for PI:', paymentIntent.id);
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      }),
      { status: 200, headers },
    );
  } catch (err: any) {
    console.error('Subscription creation failed:', err.message, err.stack);
    return new Response(
      JSON.stringify({ error: err.message || 'Payment setup failed. Please try again.' }),
      { status: 500, headers },
    );
  }
};
