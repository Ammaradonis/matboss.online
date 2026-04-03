import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

const SETUP_FEE = 11900;   // $119.00
const FIRST_MONTH = 19700; // $197.00
const TOTAL = SETUP_FEE + FIRST_MONTH; // $316.00
const BANK_TRANSFER_DAYS_UNTIL_DUE = 7;

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

    const customer = await stripe.customers.create({
      name: owner_name,
      email,
      phone,
      metadata: { school_name, num_students: String(num_students), current_software },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: TOTAL,
      currency: 'usd',
      customer: customer.id,
      payment_method_types: ['customer_balance'],
      payment_method_data: { type: 'customer_balance' },
      confirm: true,
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'us_bank_transfer',
            requested_address_types: ['aba'],
          },
        },
      },
      metadata: {
        school_name,
        owner_name,
        email,
        phone,
        num_students: String(num_students),
        current_software,
        price_id: priceId,
        setup_fee: String(SETUP_FEE),
        first_month: String(FIRST_MONTH),
        initial_payment_method: 'bank_transfer',
        recurring_collection_method: 'customer_balance_invoice',
        invoice_days_until_due: String(BANK_TRANSFER_DAYS_UNTIL_DUE),
      },
      receipt_email: email,
      description: 'MatBoss Enrollment Engine — Setup ($119) + First Month ($197) via U.S. bank transfer',
    });

    const nextAction = paymentIntent.next_action as any;
    const instructions = nextAction?.display_bank_transfer_instructions ?? null;
    const financialAddresses = Array.isArray(instructions?.financial_addresses)
      ? instructions.financial_addresses
      : [];
    const abaAddress = financialAddresses.find((address: any) => address?.type === 'aba')?.aba ?? null;

    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        customerId: customer.id,
        status: paymentIntent.status,
        amountRemaining: instructions?.amount_remaining ?? TOTAL,
        currency: instructions?.currency ?? 'usd',
        reference: instructions?.reference ?? null,
        hostedInstructionsUrl: instructions?.hosted_instructions_url ?? null,
        accountHolderName: abaAddress?.account_holder_name ?? null,
        bankName: abaAddress?.bank_name ?? null,
        routingNumber: abaAddress?.routing_number ?? null,
        accountNumber: abaAddress?.account_number ?? null,
        recurringInvoiceDaysUntilDue: BANK_TRANSFER_DAYS_UNTIL_DUE,
      }),
      { status: 200, headers },
    );
  } catch (err: any) {
    console.error('Bank transfer setup failed:', err.message, err.stack);
    return new Response(
      JSON.stringify({ error: err.message || 'Bank transfer setup failed. Please try again.' }),
      { status: 500, headers },
    );
  }
};
