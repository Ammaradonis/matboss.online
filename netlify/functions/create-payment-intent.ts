import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

  try {
    const body = await req.json();
    const { school_name, owner_name, email, phone, num_students, current_software } = body;

    if (!school_name || !owner_name || !email || !phone || !num_students || !current_software) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: TOTAL,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        school_name,
        owner_name,
        email,
        phone,
        num_students: String(num_students),
        current_software,
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
    console.error('PaymentIntent creation failed:', err.message);
    return new Response(
      JSON.stringify({ error: 'Payment setup failed. Please try again.' }),
      { status: 500, headers },
    );
  }
};
