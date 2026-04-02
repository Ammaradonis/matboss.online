# Stripe Dashboard Setup Guide for MatBoss

This guide covers **exactly** what you need to do in your Stripe Dashboard to complete the integration.

---

## 1. Add Environment Variables to Netlify

Go to **Netlify Dashboard > Site > Site configuration > Environment variables** and add these four:

| Variable                            | Value                            |
|-------------------------------------|----------------------------------|
| `STRIPE_SECRET_KEY`                 | Your **Secret key** from Stripe (`sk_test_...` for test, `sk_live_...` for production) |
| `STRIPE_WEBHOOK_SECRET`             | The webhook signing secret you'll get in Step 3 below (`whsec_...`) |
| `PAYMENT_SUCCESSFUL_MAKE_WEBHOOK`   | Your Make.com webhook URL for **successful** payments |
| `PAYMENT_FAILED_MAKE_WEBHOOK`       | Your Make.com webhook URL for **failed** payments |

> The **Publishable key** (`pk_test_51TFyG9...`) is already hardcoded in the frontend code. When you switch to production, you will replace it with your `pk_live_...` key.

---

## 2. Verify Payment Methods Are Enabled

1. Go to [Stripe Dashboard > Settings > Payment methods](https://dashboard.stripe.com/settings/payment_methods).
2. Confirm that **Cards** is enabled (it is by default).
3. Optionally enable additional methods (Apple Pay, Google Pay, etc.) — these will automatically appear in the Payment Element because we use `automatic_payment_methods: { enabled: true }`.
4. No further configuration needed here; the Payment Element will dynamically show whatever you enable.

---

## 3. Create the Webhook Endpoint

This is the most important step. Stripe needs to know where to send payment events.

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **"Add endpoint"**.
3. Fill in the fields:

| Field             | Value                                                      |
|-------------------|------------------------------------------------------------|
| **Endpoint URL**  | `https://matboss.online/.netlify/functions/stripe-webhook`  |
| **Description**   | MatBoss payment webhook                                     |
| **Events**        | Select these specific events:                               |

4. Under "Select events to listen to", search for and check:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Click **"Add endpoint"**.

6. On the endpoint detail page, click **"Reveal"** next to **Signing secret**. It will look like `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.

7. **Copy this value** and add it as the `STRIPE_WEBHOOK_SECRET` environment variable in Netlify (Step 1).

---

## 4. Set Up Apple Pay / Google Pay Domain Verification (Optional but Recommended)

If you want Apple Pay and Google Pay to appear in the Payment Element:

1. Go to [Stripe Dashboard > Settings > Payment methods](https://dashboard.stripe.com/settings/payment_methods).
2. Click on **Apple Pay** (or Google Pay if listed).
3. Click **"Add new domain"**.
4. Enter: `matboss.online`
5. Stripe will give you a **domain verification file** (a small text file).
6. Download it and place it in your `public/.well-known/` directory:
   ```
   public/.well-known/apple-developer-merchantid-domain-association
   ```
7. Deploy to Netlify so the file is live at:
   ```
   https://matboss.online/.well-known/apple-developer-merchantid-domain-association
   ```
8. Click **"Verify"** in the Stripe Dashboard.

> Google Pay generally works automatically without domain verification in test mode.

---

## 5. Test the Integration

### Using Stripe Test Cards

With your **test keys** active (`pk_test_...` / `sk_test_...`), use these test card numbers on the checkout page:

| Scenario                  | Card Number         | Expiry  | CVC  |
|---------------------------|---------------------|---------|------|
| Successful payment        | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Requires authentication   | `4000 0025 0000 3155` | Any future date | Any 3 digits |
| Declined                  | `4000 0000 0000 0002` | Any future date | Any 3 digits |
| Insufficient funds        | `4000 0000 0000 9995` | Any future date | Any 3 digits |

### Testing the Webhook Locally

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Log in: `stripe login`
3. Forward events to your local Netlify dev server:
   ```
   stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
   ```
4. The CLI will print a temporary webhook signing secret (`whsec_...`). Add it to your local `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
   ```
5. Run `netlify dev` in another terminal and make a test payment.
6. The CLI will show events flowing through in real time.

---

## 6. Go Live Checklist

When you're ready to accept real payments:

- [ ] **Switch API keys**: In the Stripe Dashboard, toggle from "Test mode" to live mode. Copy your **live** Secret key and Publishable key.
- [ ] **Update Netlify env vars**: Replace `STRIPE_SECRET_KEY` with your `sk_live_...` key. Verify that `PAYMENT_SUCCESSFUL_MAKE_WEBHOOK` and `PAYMENT_FAILED_MAKE_WEBHOOK` are set to your production Make.com webhook URLs.
- [ ] **Update the frontend key**: In `src/components/pricing/SectionCheckout.tsx`, replace the `pk_test_...` key with your `pk_live_...` key.
- [ ] **Create a live webhook**: Repeat Step 3 above, but make sure you're NOT in test mode. The endpoint URL stays the same. Copy the new live `whsec_...` and update `STRIPE_WEBHOOK_SECRET` in Netlify.
- [ ] **Verify domain for Apple Pay**: If not done already, complete Step 4 in live mode.
- [ ] **Deploy**: Push the code and trigger a Netlify deploy.
- [ ] **Test with a real card**: Make a small real payment to confirm end-to-end flow, then refund it from the Stripe Dashboard.

---

## Architecture Summary

```
Customer fills form  ──>  "Check Out" button
                                │
                                v
              ┌─────────────────────────────────┐
              │  Netlify Function:               │
              │  create-payment-intent           │
              │  Creates PaymentIntent ($316)    │
              │  Returns clientSecret            │
              └──────────────┬──────────────────┘
                             │
                             v
              ┌─────────────────────────────────┐
              │  Frontend:                       │
              │  Stripe Payment Element renders  │
              │  Customer enters card details    │
              │  stripe.confirmPayment()         │
              └──────────────┬──────────────────┘
                             │
                   ┌─────────┴──────────┐
                   │                    │
              (no redirect)      (redirect-based
               Card, etc.         payment method)
                   │                    │
                   v                    v
           Show success        Redirect to Stripe
           state inline        then back to
                               /pricing?payment_status=success
                   │                    │
                   └─────────┬──────────┘
                             │
                             v
              ┌─────────────────────────────────┐
              │  Stripe sends webhook POST to:   │
              │  /stripe-webhook                 │
              │                                  │
              │  Verifies signature              │
              │  Resolves payment method label   │
              │  Routes by event type:           │
              │                                  │
              │  payment_intent.succeeded ──>     │
              │    PAYMENT_SUCCESSFUL_MAKE_WEBHOOK│
              │                                  │
              │  payment_intent.payment_failed ─> │
              │    PAYMENT_FAILED_MAKE_WEBHOOK    │
              └─────────────────────────────────┘
```

### Make.com Webhook Payloads

Both the success and failure Make.com webhooks receive the **same JSON payload shape**. The only difference is the `status` field value.

| Field              | Description                                                       | Example                 |
|--------------------|-------------------------------------------------------------------|-------------------------|
| `school_name`      | Name of the martial arts school                                   | `"San Diego MMA"`       |
| `owner_name`       | Full name of the school owner                                     | `"John Smith"`          |
| `email`            | Owner's email address                                             | `"john@example.com"`    |
| `phone`            | Owner's phone number                                              | `"(619) 555-0123"`      |
| `current_students` | Number of current students                                        | `"75"`                  |
| `current_software` | Software the school currently uses                                | `"Zen Planner"`         |
| `payment_method`   | Resolved payment method label (card brand, wallet, or alternative)| `"Visa card"`, `"Apple Pay"` |
| `status`           | `"success"` or `"failure"`                                        | `"success"`             |

> The `payment_method` field auto-detects the method used: card brands (Visa, Mastercard, AMEX, etc.), digital wallets (Apple Pay, Google Pay, Samsung Pay, Link), and alternative methods (PayPal, Klarna, Cash App Pay, etc.).

### Pricing Breakdown

| Item                     | Amount  | Stripe amount (cents) |
|--------------------------|---------|----------------------|
| Setup & Implementation   | $119.00 | 11900                |
| First Month              | $197.00 | 19700                |
| **Total due today**      | **$316.00** | **31600**        |

> Recurring $197/month billing is not yet automated via Stripe Subscriptions. This initial integration handles the one-time first payment. Subscriptions can be added as a follow-up using Stripe Billing with Products and Prices.
