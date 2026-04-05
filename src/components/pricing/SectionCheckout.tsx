import { useState, useCallback, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance, PaymentIntent } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHABLE_KEY);
const CHECKOUT_STORAGE_KEY = 'matboss-pricing-checkout';

const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#1a1a1a',
    colorText: '#ffffff',
    colorTextSecondary: '#9ca3af',
    colorTextPlaceholder: '#4b5563',
    colorDanger: '#f87171',
    fontFamily: '"Inter", system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
    fontSizeBase: '14px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#1a1a1a',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: 'none',
      padding: '12px 16px',
    },
    '.Input:focus': {
      border: '1px solid #2563eb',
      boxShadow: '0 0 0 2px rgba(37,99,235,0.15)',
    },
    '.Label': {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#6b7280',
    },
    '.Tab': {
      backgroundColor: '#111111',
      border: '1px solid rgba(255,255,255,0.05)',
      color: '#9ca3af',
    },
    '.Tab--selected': {
      backgroundColor: '#1a1a1a',
      border: '1px solid #2563eb',
      color: '#ffffff',
    },
    '.Tab:hover': {
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
    },
  },
};

interface CheckoutFormData {
  school_name: string;
  owner_name: string;
  email: string;
  phone: string;
  num_students: string;
  current_software: string;
}

type CheckoutCompletionState = 'processing' | 'succeeded' | null;

const EMPTY_FORM_DATA: CheckoutFormData = {
  school_name: '',
  owner_name: '',
  email: '',
  phone: '',
  num_students: '',
  current_software: '',
};

function getReturnClientSecret(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('payment_intent_client_secret');
}

function readStoredFormData(): CheckoutFormData {
  if (typeof window === 'undefined') return EMPTY_FORM_DATA;

  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return EMPTY_FORM_DATA;

    const parsed = JSON.parse(raw) as Partial<CheckoutFormData>;
    return {
      school_name: parsed.school_name ?? '',
      owner_name: parsed.owner_name ?? '',
      email: parsed.email ?? '',
      phone: parsed.phone ?? '',
      num_students: parsed.num_students ?? '',
      current_software: parsed.current_software ?? '',
    };
  } catch {
    return EMPTY_FORM_DATA;
  }
}

function describeReturnedIntentStatus(status: PaymentIntent.Status): {
  completionState: CheckoutCompletionState;
  error: string | null;
} {
  switch (status) {
    case 'succeeded':
      return { completionState: 'succeeded', error: null };
    case 'processing':
      return { completionState: 'processing', error: null };
    case 'requires_payment_method':
      return {
        completionState: null,
        error: 'Your payment method was not accepted. Please choose another card or bank account and try again.',
      };
    case 'requires_action':
      return {
        completionState: null,
        error: 'Stripe still needs an additional verification step. Please reopen the payment form and continue.',
      };
    default:
      return {
        completionState: null,
        error: `Payment status is currently ${status.replace(/_/g, ' ')}. Please complete the remaining steps in the payment form.`,
      };
  }
}

export default function SectionCheckout() {
  const returnClientSecret = getReturnClientSecret();
  const paymentPanelRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<CheckoutFormData>(() => readStoredFormData());
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [clientSecret, setClientSecret] = useState<string | null>(returnClientSecret);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<CheckoutCompletionState>(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(Boolean(returnClientSecret));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    if (!formData.school_name.trim()) newErrors.school_name = 'Required';
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.num_students.trim()) newErrors.num_students = 'Required';
    if (!formData.current_software.trim()) newErrors.current_software = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (!returnClientSecret) return;

    let ignore = false;
    setClientSecret(returnClientSecret);
    setCheckingPaymentStatus(true);
    setPaymentError(null);

    void (async () => {
      const stripe = await stripePromise;

      if (!stripe) {
        if (!ignore) {
          setPaymentError('Stripe could not be loaded to verify the payment status. Please refresh and try again.');
          setCheckingPaymentStatus(false);
        }
        return;
      }

      const { paymentIntent, error } = await stripe.retrievePaymentIntent(returnClientSecret);

      if (ignore) return;

      if (error || !paymentIntent) {
        setPaymentError(error?.message || 'We could not retrieve your payment status. Please refresh and try again.');
        setCheckingPaymentStatus(false);
        return;
      }

      const statusResult = describeReturnedIntentStatus(paymentIntent.status);
      setPaymentState(statusResult.completionState);
      setPaymentError(statusResult.error);
      setCheckingPaymentStatus(false);
    })();

    return () => {
      ignore = true;
    };
  }, [returnClientSecret]);

  useEffect(() => {
    if (!clientSecret || returnClientSecret || typeof window === 'undefined' || window.innerWidth >= 1024) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      paymentPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [clientSecret, returnClientSecret]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentState(null);

    try {
      const res = await fetch('/.netlify/functions/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: formData.school_name,
          owner_name: formData.owner_name,
          email: formData.email,
          phone: formData.phone,
          num_students: formData.num_students,
          current_software: formData.current_software,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Payment setup failed' }));
        throw new Error(err.error || 'Payment setup failed');
      }

      const { clientSecret: secret } = await res.json();
      setClientSecret(secret);
    } catch (err: any) {
      setPaymentError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentStateChange = useCallback((nextState: Exclude<CheckoutCompletionState, null>) => {
    setPaymentState(nextState);
    setPaymentError(null);
    // Scroll to the confirmation panel — the section re-renders and the user
    // may be mid-form; bring them to the top of the checkout section.
    setTimeout(() => {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, []);

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full px-4 py-3 rounded-xl bg-dojo-carbon border text-white text-sm font-body
     placeholder-gray-600 focus:outline-none focus:border-dojo-red transition-colors
     ${errors[field] ? 'border-dojo-red/60' : 'border-white/10'}`;

  const ownerName = formData.owner_name.trim();
  const schoolName = formData.school_name.trim();
  const customerEmail = formData.email.trim();
  const isFormLocked = Boolean(clientSecret);
  const deploymentSteps = [
    'Complete the academy profile once.',
    'Choose card, wallet, or ACH in the secure payment step.',
    'We start mapping your enrollment leaks within 24 hours of payment clearing.',
  ];
  const trustSignals = [
    '256-bit SSL Encrypted',
    'No Long-Term Contracts',
    'Live Within 72 Hours',
  ];

  if (checkingPaymentStatus || paymentState) {
    const isProcessing = checkingPaymentStatus || paymentState === 'processing';
    const title = checkingPaymentStatus
      ? 'Checking Payment Status'
      : isProcessing
        ? 'ACH Authorization Received'
        : 'Payment Confirmed';

    return (
      <section id="checkout" className="relative scroll-mt-32 overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-dojo-red/4 blur-[150px]" />
        </div>
        <div className="mx-auto max-w-lg reveal visible">
          <div className="rounded-[1.75rem] border border-white/5 bg-dojo-dark/80 p-6 text-center sm:p-8">
            <div
              className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                isProcessing
                  ? 'border-dojo-gold/40 bg-dojo-gold/10'
                  : 'border-green-500/40 bg-green-500/10'
              }`}
            >
              {isProcessing ? (
                <svg className="h-8 w-8 animate-spin text-dojo-gold" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h2 className="mb-3 font-heading text-3xl tracking-wide text-white md:text-4xl">{title}</h2>
            <p className="mb-2 text-base leading-relaxed text-gray-400">
              {checkingPaymentStatus
                ? 'We are pulling the latest status from Stripe.'
                : isProcessing
                  ? ownerName
                    ? `We received ${ownerName}'s payment authorization.`
                    : 'We received your payment authorization.'
                  : ownerName
                    ? `Welcome to MatBoss, ${ownerName}.`
                    : 'Your first payment cleared successfully.'}
            </p>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              {checkingPaymentStatus ? (
                'This only takes a moment.'
              ) : isProcessing ? (
                <>
                  Stripe can take up to 4 business days to confirm an ACH debit.
                  {schoolName
                    ? ` We will start mapping ${schoolName} as soon as the first payment clears.`
                    : ' We will start mapping your academy as soon as the first payment clears.'}{' '}
                  Your monthly $197 subscription is created automatically after that first payment succeeds.
                  {customerEmail ? ` Check ${customerEmail} for mandate or verification emails.` : ''}
                </>
              ) : (
                <>
                  {schoolName
                    ? `We'll begin system mapping for ${schoolName} within 24 hours.`
                    : 'We will begin system mapping within 24 hours.'}
                  {customerEmail ? ` Check ${customerEmail} for your receipt and onboarding details.` : ''}
                </>
              )}
            </p>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs ${
                isProcessing
                  ? 'border-dojo-gold/30 bg-dojo-gold/10 text-dojo-gold'
                  : 'border-white/5 bg-dojo-carbon text-gray-400'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isProcessing ? 'animate-pulse bg-dojo-gold' : 'animate-pulse bg-green-400'
                }`}
              />
              {isProcessing ? 'Waiting for bank settlement' : 'Deployment pipeline activated'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="checkout" className="relative scroll-mt-32 overflow-hidden px-4 py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-dojo-red/4 blur-[150px]" />
      </div>

      <div className="mx-auto max-w-5xl reveal">
        <div className="mb-12 text-center">
          <span
            className="mb-4 inline-block rounded-full border border-dojo-red/20 bg-dojo-red/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-dojo-red"
          >
            Deploy
          </span>

          <h2 className="mx-auto mb-4 max-w-3xl font-heading text-3xl leading-tight tracking-wide text-white md:text-5xl">
            Your San Diego Academy's Enrollment Engine
            <span className="text-dojo-red"> Is One Form Away.</span>
          </h2>

          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-gray-400 sm:text-base md:text-lg">
            Fill in your details below. Once confirmed, we begin system mapping within 24 hours.
            No contracts. No lock-in. Cancel any time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="order-2 mx-auto w-full max-w-2xl lg:order-1 lg:max-w-none">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/5 bg-dojo-dark/80">
              <div className="border-b border-white/5 bg-dojo-carbon/50 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dojo-red">
                      <span className="font-heading text-sm text-white">M</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-base tracking-wider text-white">
                        MatBoss Enrollment Engine
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        Founding Rate — San Diego Exclusive
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-dojo-red/20 bg-dojo-red/10 px-4 py-3 sm:text-right">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                        Due today
                      </div>
                      <div className="font-heading text-xl text-dojo-red">$316</div>
                    </div>
                    <div className="h-10 w-px bg-white/5" />
                    <div>
                      <div className="font-heading text-lg text-white">$197</div>
                      <div className="text-[10px] text-gray-500">monthly after setup</div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
                <div className="rounded-2xl border border-white/5 bg-dojo-carbon/35 p-4 text-[11px] leading-relaxed text-gray-400 sm:text-xs">
                  Enter the academy details first. Once the secure payment step appears, you can
                  finish with card, Apple Pay, Google Pay, Venmo, Cash App Pay, Klarna, or ACH.
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-gray-500">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleChange}
                      placeholder="e.g. San Diego BJJ Academy"
                      className={inputClass('school_name')}
                      disabled={isFormLocked}
                    />
                    {errors.school_name && (
                      <p className="mt-1 text-[10px] text-dojo-red">{errors.school_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-gray-500">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className={inputClass('owner_name')}
                      disabled={isFormLocked}
                    />
                    {errors.owner_name && (
                      <p className="mt-1 text-[10px] text-dojo-red">{errors.owner_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-gray-500">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@yourdojo.com"
                      className={inputClass('email')}
                      disabled={isFormLocked}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[10px] text-dojo-red">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-gray-500">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(619) 000-0000"
                      className={inputClass('phone')}
                      disabled={isFormLocked}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-[10px] text-dojo-red">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-gray-500">
                      Current Students
                    </label>
                    <input
                      type="number"
                      name="num_students"
                      value={formData.num_students}
                      onChange={handleChange}
                      placeholder="e.g. 80"
                      className={inputClass('num_students')}
                      disabled={isFormLocked}
                    />
                    {errors.num_students && (
                      <p className="mt-1 text-[10px] text-dojo-red">{errors.num_students}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-mono uppercase tracking-widest text-gray-500">
                      Current Software
                    </label>
                    <input
                      type="text"
                      name="current_software"
                      value={formData.current_software}
                      onChange={handleChange}
                      placeholder="e.g. Zen Planner, MindBody"
                      className={inputClass('current_software')}
                      disabled={isFormLocked}
                    />
                    {errors.current_software && (
                      <p className="mt-1 text-[10px] text-dojo-red">{errors.current_software}</p>
                    )}
                  </div>
                </div>

                {paymentError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {paymentError}
                  </div>
                )}

                {!clientSecret && (
                  <div className="mt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full rounded-xl bg-dojo-red py-3.5 text-lg font-heading tracking-wider text-white transition-all hover:bg-dojo-crimson red-glow-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paymentLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Setting up payment...
                        </span>
                      ) : (
                        'Continue to Secure Payment'
                      )}
                    </button>

                    <p className="text-[11px] leading-relaxed text-gray-500">
                      All supported payment methods save automatically for the recurring $197 monthly subscription.
                    </p>
                  </div>
                )}
              </form>

              {clientSecret && (
                <div ref={paymentPanelRef} id="checkout-payment" className="px-4 pb-5 sm:px-6 sm:pb-6">
                  <div className="border-t border-white/5 pt-6">
                    <div className="mb-4 rounded-2xl border border-white/5 bg-dojo-carbon/50 p-4 sm:p-5">
                      <p className="mb-2 text-xs font-mono uppercase tracking-widest text-dojo-gold">
                        Choose Your Payment Method
                      </p>
                      <p className="text-sm leading-relaxed text-gray-400">
                        Pay instantly with Apple Pay, Google Pay, Venmo, Cash App Pay, or Klarna,
                        or use a card. Select your preferred method below.
                      </p>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <svg className="h-4 w-4 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                        Secure Payment
                      </span>
                    </div>

                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: stripeAppearance,
                      }}
                    >
                      <StripePaymentForm
                        onPaymentStateChange={handlePaymentStateChange}
                        formData={formData}
                      />
                    </Elements>

                    <div className="mt-4 rounded-xl border border-white/5 bg-dojo-carbon/50 p-4 lg:hidden">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">MatBoss Enrollment Engine</span>
                        <span className="font-mono text-white">$197/mo</span>
                      </div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Setup &amp; Implementation</span>
                        <span className="font-mono text-white">$119</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="text-sm font-semibold text-white">Due today</span>
                        <span className="font-heading text-lg text-dojo-red">$316</span>
                      </div>
                      <p className="mt-2 text-[10px] text-gray-600">
                        Then $197/month to the saved payment method until canceled.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-dojo-red/15 bg-dojo-dark/80 p-5">
              <div className="mb-3 text-xs font-mono uppercase tracking-widest text-dojo-gold">
                Smooth Deployment
              </div>
              <ul className="space-y-3">
                {deploymentSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-gray-300">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-dojo-red/15 text-[10px] font-mono text-dojo-red">
                      ✓
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-dojo-dark/80 p-5">
              <div className="mb-3 text-xs font-mono uppercase tracking-widest text-gray-500">
                Order Summary
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">First month</span>
                <span className="font-mono text-white">$197</span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Setup</span>
                <span className="font-mono text-white">$119</span>
              </div>
              <div className="mt-3 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Due today</span>
                  <span className="font-heading text-xl text-dojo-red">$316</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  After checkout, billing continues at $197/month until canceled.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-dojo-dark/80 p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {trustSignals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-400"
                  >
                    {signal}
                  </span>
                ))}
              </div>
              <a
                href="/bank-transfer"
                className="inline-flex w-full items-center justify-center rounded-xl border border-dojo-gold/20 bg-dojo-gold/10 px-4 py-3 text-center text-sm font-heading tracking-wider text-dojo-gold transition-colors hover:bg-dojo-gold/20"
              >
                Prefer Bank Transfer Instead?
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
