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
        payment_method_types: ['card'],
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
    });
    console.log('Step 3 OK — subscription:', subscription.id, 'status:', subscription.status);

    // 4. Retrieve the invoice separately (avoids nested-expand issues)
    const invoiceId = typeof subscription.latest_invoice === 'string'
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id;

    if (!invoiceId) {
      throw new Error(`Subscription ${subscription.id} created with no invoice`);
    }
    console.log('Step 4 OK — invoice ID:', invoiceId);

    // 5. If invoice is still draft, finalize it so Stripe creates the PaymentIntent
    let invoice = await stripe.invoices.retrieve(invoiceId);
    console.log('Step 5 — invoice status:', invoice.status, 'amount_due:', invoice.amount_due, 'payment_intent:', invoice.payment_intent);

    if (invoice.status === 'draft') {
      console.log('Step 5a — invoice is draft, finalizing...');
      invoice = await stripe.invoices.finalizeInvoice(invoiceId);
      console.log('Step 5a OK — finalized, status:', invoice.status, 'payment_intent:', invoice.payment_intent);
    }

    // 6. Get the PaymentIntent from the finalized invoice
    const piId = typeof invoice.payment_intent === 'string'
      ? invoice.payment_intent
      : invoice.payment_intent?.id;

    if (!piId) {
      throw new Error(`Invoice ${invoiceId} (status=${invoice.status}, amount=${invoice.amount_due}) has no PaymentIntent`);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(piId);
    console.log('Step 6 OK — PI:', paymentIntent.id, 'status:', paymentIntent.status);

    if (!paymentIntent.client_secret) {
      throw new Error(`PaymentIntent ${paymentIntent.id} (status=${paymentIntent.status}) has no client_secret`);
    }

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
