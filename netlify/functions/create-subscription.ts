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

    // 3. Create the subscription
    //    collection_method MUST be charge_automatically for payment_behavior to create a PI
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      collection_method: 'charge_automatically',
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
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | null;

    // Fallback: retrieve separately if nested expand didn't populate the PI
    let clientSecret = paymentIntent?.client_secret ?? null;

    if (!clientSecret && invoice?.id) {
      const freshInvoice = await stripe.invoices.retrieve(invoice.id);
      const piId = typeof freshInvoice.payment_intent === 'string'
        ? freshInvoice.payment_intent
        : null;
      if (piId) {
        const pi = await stripe.paymentIntents.retrieve(piId);
        clientSecret = pi.client_secret;
      }
    }

    if (!clientSecret) {
      throw new Error(
        `No PaymentIntent for invoice ${invoice?.id} `
        + `(status=${invoice?.status}, amount=${invoice?.amount_due}, `
        + `collection=${invoice?.collection_method})`,
      );
    }

    return new Response(
      JSON.stringify({ clientSecret, subscriptionId: subscription.id }),
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
