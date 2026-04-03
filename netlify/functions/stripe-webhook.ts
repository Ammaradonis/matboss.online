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

async function ensurePaymentMethodAttached(
  customerId: string,
  paymentMethodId: string,
): Promise<void> {
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const attachedCustomerId = typeof paymentMethod.customer === 'string'
    ? paymentMethod.customer
    : paymentMethod.customer?.id;

  if (!attachedCustomerId) {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    return;
  }

  if (attachedCustomerId !== customerId) {
    throw new Error(
      `Payment method ${paymentMethodId} belongs to customer ${attachedCustomerId}, expected ${customerId}`,
    );
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
    case 'payment_intent.processing': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;

      if (!meta.school_name) {
        console.log(`PI ${pi.id} entered processing without metadata, skipping`);
        break;
      }

      console.log(
        `Payment processing: ${pi.id} — ${meta.school_name} (${meta.email}) — waiting on bank settlement`,
      );
      break;
    }

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

    // ── First payment succeeded — create the recurring subscription ──
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;

      if (!meta.school_name) {
        console.log(`PI ${pi.id} succeeded — no metadata, skipping`);
        break;
      }

      console.log(`Payment succeeded: ${pi.id} — ${meta.school_name} (${meta.email})`);

      const pm = await resolvePaymentMethod(pi, false);

      // ── Create the monthly subscription if this PI has a price_id ──
      if (meta.price_id && pi.customer) {
        try {
          const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer.id;
          const pmId = typeof pi.payment_method === 'string'
            ? pi.payment_method
            : pi.payment_method?.id;

          if (pmId) {
            // Guard: skip if customer already has a subscription (webhook retry)
            const existing = await stripe.subscriptions.list({
              customer: customerId,
              limit: 1,
            });
            if (existing.data.length > 0) {
              console.log(`Customer ${customerId} already has subscription ${existing.data[0].id}, skipping`);
            } else {
              // setup_future_usage already saves eligible methods; only attach if Stripe has not done so yet
              await ensurePaymentMethodAttached(customerId, pmId);
              await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: pmId },
              });

              // Create subscription starting ~30 days from now (first month already paid)
              const trialEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
              const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: meta.price_id }],
                default_payment_method: pmId,
                trial_end: trialEnd,
                metadata: {
                  school_name: meta.school_name || '',
                  owner_name: meta.owner_name || '',
                  email: meta.email || '',
                  phone: meta.phone || '',
                  num_students: meta.num_students || '',
                  current_software: meta.current_software || '',
                },
              });
              console.log(`Subscription created: ${subscription.id} for ${meta.school_name} — bills $197/mo starting ${new Date(trialEnd * 1000).toISOString()}`);
            }
          }
        } catch (subErr: any) {
          // Log but don't fail the webhook — the payment already succeeded
          console.error('Subscription creation failed after payment:', subErr.message);
        }
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
          status: 'success',
        });
      }
      break;
    }

    // ── First payment failed ──
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata;

      if (!meta.school_name) {
        console.log(`PI ${pi.id} failed — no metadata, skipping`);
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
