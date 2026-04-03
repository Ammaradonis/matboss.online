import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const SUCCESS_WEBHOOK_URL = process.env.PAYMENT_SUCCESSFUL_MAKE_WEBHOOK;
const FAILURE_WEBHOOK_URL = process.env.PAYMENT_FAILED_MAKE_WEBHOOK;

const headers = { 'Content-Type': 'application/json' };

function getPaymentMethodLabel(pm: Stripe.PaymentMethod | null | undefined): string {
  if (!pm) return 'Unknown';

  if (pm.type === 'card' && pm.card) {
    const wallet = pm.card.wallet?.type;
    if (wallet) {
      const walletLabels: Record<string, string> = {
        apple_pay: 'Apple Pay',
        google_pay: 'Google Pay',
        samsung_pay: 'Samsung Pay',
        link: 'Link',
      };
      return walletLabels[wallet] || wallet;
    }
    const brand = pm.card.brand || 'Unknown';
    const brandLabels: Record<string, string> = {
      visa: 'Visa card',
      mastercard: 'Mastercard card',
      amex: 'AMEX card',
      diners: 'Diners Club card',
      discover: 'Discover card',
      jcb: 'JCB card',
      unionpay: 'UnionPay card',
    };
    return brandLabels[brand] || `${brand} card`;
  }

  const typeLabels: Record<string, string> = {
    paypal: 'PayPal',
    klarna: 'Klarna',
    amazon_pay: 'Amazon Pay',
    revolut_pay: 'Revolut Pay',
    us_bank_account: 'ACH Direct Debit',
    customer_balance: 'Bank Transfer',
    link: 'Link',
    affirm: 'Affirm',
    afterpay_clearpay: 'Afterpay',
    cashapp: 'Cash App Pay',
  };
  return typeLabels[pm.type] || pm.type;
}

async function resolvePaymentMethod(
  pi: Stripe.PaymentIntent,
  failed: boolean,
): Promise<Stripe.PaymentMethod | null> {
  if (failed && pi.last_payment_error?.payment_method) {
    return pi.last_payment_error.payment_method as Stripe.PaymentMethod;
  }
  if (pi.payment_method) {
    try {
      const pmId = typeof pi.payment_method === 'string'
        ? pi.payment_method
        : pi.payment_method.id;
      return await stripe.paymentMethods.retrieve(pmId);
    } catch {
      return null;
    }
  }
  return null;
}

async function forwardToMakeWebhook(
  url: string,
  payload: Record<string, string>,
): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Make.com webhook returned ${res.status}: ${await res.text()}`);
    }
  } catch (err: any) {
    console.error('Make.com webhook forward failed:', err.message);
  }
}

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

  switch (event.type) {
    // ── Subscription invoice paid (initial + every recurring charge) ──
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) {
        console.log(`invoice.paid ${invoice.id} — not a subscription invoice, skipping`);
        break;
      }

      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;
      const subscription = await stripe.subscriptions.retrieve(subId);
      const meta = subscription.metadata;

      console.log(
        `Subscription invoice paid: ${invoice.id} (sub ${subId}) — ${meta.school_name} (${meta.email}) — $${(invoice.amount_paid / 100).toFixed(2)}`,
      );

      let pm: Stripe.PaymentMethod | null = null;
      if (invoice.payment_intent) {
        const piId = typeof invoice.payment_intent === 'string'
          ? invoice.payment_intent
          : invoice.payment_intent.id;
        const pi = await stripe.paymentIntents.retrieve(piId);
        pm = await resolvePaymentMethod(pi, false);
      }

      if (SUCCESS_WEBHOOK_URL) {
        await forwardToMakeWebhook(SUCCESS_WEBHOOK_URL, {
          school_name: meta.school_name || '',
          owner_name: meta.owner_name || '',
          email: meta.email || '',
          phone: meta.phone || '',
          current_students: meta.num_students || '',
          current_software: meta.current_software || '',
          payment_method: getPaymentMethodLabel(pm),
          amount: String((invoice.amount_paid / 100).toFixed(2)),
          status: 'success',
        });
      }
      break;
    }

    // ── Subscription invoice payment failed (recurring charge declined, etc.) ──
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) {
        console.log(`invoice.payment_failed ${invoice.id} — not a subscription invoice, skipping`);
        break;
      }

      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;
      const subscription = await stripe.subscriptions.retrieve(subId);
      const meta = subscription.metadata;

      console.error(
        `Subscription invoice failed: ${invoice.id} (sub ${subId}) — ${meta.school_name} (${meta.email})`,
      );

      let pm: Stripe.PaymentMethod | null = null;
      if (invoice.payment_intent) {
        const piId = typeof invoice.payment_intent === 'string'
          ? invoice.payment_intent
          : invoice.payment_intent.id;
        const pi = await stripe.paymentIntents.retrieve(piId);
        pm = await resolvePaymentMethod(pi, true);
      }

      if (FAILURE_WEBHOOK_URL) {
        await forwardToMakeWebhook(FAILURE_WEBHOOK_URL, {
          school_name: meta.school_name || '',
          owner_name: meta.owner_name || '',
          email: meta.email || '',
          phone: meta.phone || '',
          current_students: meta.num_students || '',
          current_software: meta.current_software || '',
          payment_method: getPaymentMethodLabel(pm),
          amount: String((invoice.amount_due / 100).toFixed(2)),
          status: 'failure',
        });
      }
      break;
    }

    // ── Legacy: one-time PaymentIntent succeeded (non-subscription) ──
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;

      // Skip if this PI was created by a subscription — invoice.paid handles those
      if (!meta.school_name) {
        console.log(`PI ${pi.id} succeeded — no direct metadata (subscription-managed), skipping`);
        break;
      }

      console.log(`Payment succeeded: ${pi.id} — ${meta.school_name} (${meta.email})`);

      const pm = await resolvePaymentMethod(pi, false);

      if (SUCCESS_WEBHOOK_URL) {
        await forwardToMakeWebhook(SUCCESS_WEBHOOK_URL, {
          school_name: meta.school_name || '',
          owner_name: meta.owner_name || '',
          email: meta.email || '',
          phone: meta.phone || '',
          current_students: meta.num_students || '',
          current_software: meta.current_software || '',
          payment_method: getPaymentMethodLabel(pm),
          status: 'success',
        });
      }
      break;
    }

    // ── Legacy: one-time PaymentIntent failed (non-subscription) ──
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;

      if (!meta.school_name) {
        console.log(`PI ${pi.id} failed — no direct metadata (subscription-managed), skipping`);
        break;
      }

      console.error(
        `Payment failed: ${pi.id} — ${meta.school_name} (${meta.email}) — ${pi.last_payment_error?.message}`,
      );

      const pm = await resolvePaymentMethod(pi, true);

      if (FAILURE_WEBHOOK_URL) {
        await forwardToMakeWebhook(FAILURE_WEBHOOK_URL, {
          school_name: meta.school_name || '',
          owner_name: meta.owner_name || '',
          email: meta.email || '',
          phone: meta.phone || '',
          current_students: meta.num_students || '',
          current_software: meta.current_software || '',
          payment_method: getPaymentMethodLabel(pm),
          status: 'failure',
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers });
};
