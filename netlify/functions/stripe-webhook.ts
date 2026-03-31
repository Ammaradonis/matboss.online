import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/yibfibqog07hbmut2jizf71k9u1jsqxy';

const headers = { 'Content-Type': 'application/json' };

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers },
    );
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      { status: 400, headers },
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;
      console.log(`Payment succeeded: ${pi.id} — ${meta.school_name} (${meta.email})`);

      // Forward to Make.com for automation workflows
      try {
        await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment_succeeded',
            payment_intent_id: pi.id,
            amount: pi.amount,
            currency: pi.currency,
            school_name: meta.school_name,
            owner_name: meta.owner_name,
            email: meta.email,
            phone: meta.phone,
            num_students: meta.num_students,
            current_software: meta.current_software,
            receipt_email: pi.receipt_email,
            created: new Date(pi.created * 1000).toISOString(),
          }),
        });
      } catch (webhookErr: any) {
        // Log but don't fail — Stripe delivery is the priority
        console.error('Make.com webhook forward failed:', webhookErr.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;
      console.error(
        `Payment failed: ${pi.id} — ${meta.school_name} (${meta.email}) — ${pi.last_payment_error?.message}`,
      );
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Always return 200 quickly to acknowledge receipt
  return new Response(JSON.stringify({ received: true }), { status: 200, headers });
};
