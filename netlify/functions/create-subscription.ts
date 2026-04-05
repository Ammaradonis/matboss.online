import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

const SETUP_FEE = 11900;   // $119.00
const FIRST_MONTH = 19700;  // $197.00
const TOTAL = SETUP_FEE + FIRST_MONTH; // $316.00

const headers = { 'Content-Type': 'application/json' };

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers },
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!secretKey || !priceId) {
    console.error('Missing env vars — STRIPE_SECRET_KEY:', !!secretKey, 'STRIPE_MONTHLY_PRICE_ID:', !!priceId);
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

    // 1. Create a Stripe Customer (needed later for the subscription)
    const customer = await stripe.customers.create({
      name: owner_name,
      email,
      phone,
      metadata: { school_name, num_students: String(num_students), current_software },
    });

    // 2. Create a PaymentIntent with the proven automatic_payment_methods flow.
    //    setup_future_usage is set per-method (not top-level) so Stripe does not
    //    filter out payment methods whose saving support it cannot verify upfront
    //    (e.g. Venmo custom type, Klarna). Each method that supports saving gets
    //    setup_future_usage individually; the rest still appear for first payment.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: TOTAL,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session',
        },
        us_bank_account: {
          setup_future_usage: 'off_session',
          transaction_purpose: 'services',
          verification_method: 'automatic',
        },
        cashapp: {
          setup_future_usage: 'off_session',
        },
        paypal: {
          setup_future_usage: 'off_session',
        },
        klarna: {
          setup_future_usage: 'off_session',
        },
        link: {
          setup_future_usage: 'off_session',
        },
      },
      metadata: {
        school_name,
        owner_name,
        email,
        phone,
        num_students: String(num_students),
        current_software,
        price_id: priceId,           // webhook reads this to create the subscription
        setup_fee: String(SETUP_FEE),
        first_month: String(FIRST_MONTH),
      },
      receipt_email: email,
      description: 'MatBoss Enrollment Engine — Setup ($119) + First Month ($197)',
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers },
    );
  } catch (err: any) {
    console.error('Payment setup failed:', err.message, err.stack);
    return new Response(
      JSON.stringify({ error: err.message || 'Payment setup failed. Please try again.' }),
      { status: 500, headers },
    );
  }
};
