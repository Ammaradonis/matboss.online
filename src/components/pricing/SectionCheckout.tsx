import { useState, useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance, PaymentIntent } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHABLE_KEY);
const CHECKOUT_STORAGE_KEY = 'matboss-pricing-checkout';

const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#dc2626',
    colorBackground: '#1a1a1a',
    colorText: '#ffffff',
    colorTextSecondary: '#9ca3af',
    colorTextPlaceholder: '#4b5563',
    colorDanger: '#dc2626',
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
      border: '1px solid #dc2626',
      boxShadow: 'none',
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
      border: '1px solid #dc2626',
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

interface BankTransferInstructions {
  amountRemaining: number;
  currency: string;
  reference: string | null;
  hostedInstructionsUrl: string | null;
  accountHolderName: string | null;
  bankName: string | null;
  routingNumber: string | null;
  accountNumber: string | null;
  recurringInvoiceDaysUntilDue: number;
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
  const [formData, setFormData] = useState<CheckoutFormData>(() => readStoredFormData());
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [clientSecret, setClientSecret] = useState<string | null>(returnClientSecret);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bankTransferLoading, setBankTransferLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<CheckoutCompletionState>(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(Boolean(returnClientSecret));
  const [bankTransferInstructions, setBankTransferInstructions] = useState<BankTransferInstructions | null>(null);

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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email';
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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentState(null);
    setBankTransferInstructions(null);

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

  const handleBankTransfer = async () => {
    if (!validate()) return;

    setBankTransferLoading(true);
    setPaymentError(null);
    setPaymentState(null);
    setClientSecret(null);

    try {
      const res = await fetch('/.netlify/functions/create-bank-transfer', {
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
        const err = await res.json().catch(() => ({ error: 'Bank transfer setup failed' }));
        throw new Error(err.error || 'Bank transfer setup failed');
      }

      const instructions = await res.json();
      setBankTransferInstructions({
        amountRemaining: instructions.amountRemaining,
        currency: instructions.currency,
        reference: instructions.reference,
        hostedInstructionsUrl: instructions.hostedInstructionsUrl,
        accountHolderName: instructions.accountHolderName,
        bankName: instructions.bankName,
        routingNumber: instructions.routingNumber,
        accountNumber: instructions.accountNumber,
        recurringInvoiceDaysUntilDue: instructions.recurringInvoiceDaysUntilDue,
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBankTransferLoading(false);
    }
  };

  const handlePaymentStateChange = useCallback((nextState: Exclude<CheckoutCompletionState, null>) => {
    setPaymentState(nextState);
    setPaymentError(null);
  }, []);

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full px-4 py-3 rounded-xl bg-dojo-carbon border text-white text-sm font-body
     placeholder-gray-600 focus:outline-none focus:border-dojo-red transition-colors
     ${errors[field] ? 'border-dojo-red/60' : 'border-white/10'}`;

  const ownerName = formData.owner_name.trim();
  const schoolName = formData.school_name.trim();
  const customerEmail = formData.email.trim();
  const isFormLocked = Boolean(clientSecret || bankTransferInstructions);
  const formattedBankTransferAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (bankTransferInstructions?.currency || 'usd').toUpperCase(),
  }).format((bankTransferInstructions?.amountRemaining || 0) / 100);

  if (bankTransferInstructions) {
    return (
      <section id="checkout" className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-dojo-red/4 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-2xl mx-auto reveal">
          <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-dojo-carbon/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dojo-gold/10 border border-dojo-gold/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-4.418 0-8 1.79-8 4s3.582 4 8 4 8-1.79 8-4-3.582-4-8-4zm0 0V4m0 12v4m-4-8H4m16 0h-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl text-white tracking-wide">
                    U.S. Bank Transfer Instructions Ready
                  </h2>
                  <p className="text-sm text-gray-400">
                    Send your first payment through your bank, then Stripe will email monthly bank-transfer invoices for the recurring plan.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div className="p-4 rounded-xl bg-dojo-carbon/50 border border-white/5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Amount Due Today</p>
                    <p className="font-heading text-3xl text-dojo-red">{formattedBankTransferAmount}</p>
                  </div>
                  <div className="text-sm text-gray-400 max-w-sm">
                    Stripe keeps this first payment pending until the transfer lands. We start implementation only after the transfer succeeds.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-white text-sm break-words">{bankTransferInstructions.accountHolderName || 'See Stripe hosted instructions'}</p>
                </div>
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-white text-sm break-words">{bankTransferInstructions.bankName || 'See Stripe hosted instructions'}</p>
                </div>
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Routing Number</p>
                  <p className="text-white text-sm font-mono break-all">{bankTransferInstructions.routingNumber || 'Available in Stripe hosted instructions'}</p>
                </div>
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Account Number</p>
                  <p className="text-white text-sm font-mono break-all">{bankTransferInstructions.accountNumber || 'Available in Stripe hosted instructions'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Transfer Reference</p>
                <p className="text-white text-sm font-mono break-all">
                  {bankTransferInstructions.reference || 'No reference code required for this transfer.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dojo-gold/10 border border-dojo-gold/20">
                <p className="text-xs font-mono text-dojo-gold uppercase tracking-widest mb-2">Recurring Billing</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  After Stripe marks this first {formattedBankTransferAmount} transfer as paid, MatBoss creates
                  your recurring $197 subscription in Stripe. Because bank transfers require payer action, Stripe
                  emails a fresh monthly invoice with transfer instructions instead of auto-debiting your account.
                  The recurring invoice will be due {bankTransferInstructions.recurringInvoiceDaysUntilDue} days
                  after it is issued.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {bankTransferInstructions.hostedInstructionsUrl && (
                  <a
                    href={bankTransferInstructions.hostedInstructionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-dojo-red text-white font-heading tracking-wider hover:bg-dojo-crimson transition-colors"
                  >
                    Open Stripe Instructions
                  </a>
                )}
                <div className="inline-flex items-center px-4 py-3 rounded-xl bg-dojo-carbon border border-white/5 text-xs text-gray-400">
                  Stripe can also email the payment instructions if that setting is enabled in your dashboard.
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                {schoolName ? `${schoolName}` : 'Your academy'} will move into onboarding after the first transfer clears.
                {customerEmail ? ` Stripe will use ${customerEmail} for receipts and invoice emails.` : ''}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Payment Status State ──
  if (checkingPaymentStatus || paymentState) {
    const isProcessing = checkingPaymentStatus || paymentState === 'processing';
    const title = checkingPaymentStatus
      ? 'Checking Payment Status'
      : isProcessing
        ? 'ACH Authorization Received'
        : 'Payment Confirmed';

    return (
      <section id="checkout" className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-dojo-red/4 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-lg mx-auto reveal">
          <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-8 text-center">
            <div
              className={`w-16 h-16 mx-auto mb-6 rounded-full border-2 flex items-center justify-center ${
                isProcessing
                  ? 'bg-dojo-gold/10 border-dojo-gold/40'
                  : 'bg-green-500/10 border-green-500/40'
              }`}
            >
              {isProcessing ? (
                <svg className="w-8 h-8 text-dojo-gold animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-white tracking-wide mb-3">
              {title}
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-2">
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
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {checkingPaymentStatus ? (
                'This only takes a moment.'
              ) : isProcessing ? (
                <>
                  Stripe can take up to 4 business days to confirm an ACH debit.
                  {schoolName ? ` We will start mapping ${schoolName} as soon as the first payment clears.` : ' We will start mapping your academy as soon as the first payment clears.'}
                  {' '}
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs ${
                isProcessing
                  ? 'bg-dojo-gold/10 border-dojo-gold/30 text-dojo-gold'
                  : 'bg-dojo-carbon border-white/5 text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isProcessing ? 'bg-dojo-gold animate-pulse' : 'bg-green-400 animate-pulse'
                }`}
              />
              {isProcessing ? 'Waiting for bank settlement' : 'Deployment pipeline activated'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Main Checkout ──
  return (
    <section id="checkout" className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-dojo-red/4 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full bg-dojo-red/10 border border-dojo-red/20
                       text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-4"
          >
            Deploy
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            Your San Diego Academy's Enrollment Engine
            <span className="text-dojo-red"> Is One Form Away.</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Fill in your details below. Once confirmed, we begin system mapping
            within 24 hours. No contracts. No lock-in. Cancel any time.
          </p>
        </div>

        {/* Checkout form */}
        <div className="max-w-lg mx-auto">
          <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl overflow-hidden">
            {/* Form header */}
            <div className="px-6 py-4 border-b border-white/5 bg-dojo-carbon/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-dojo-red flex items-center justify-center">
                    <span className="font-heading text-white text-sm">M</span>
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
                <div className="text-right">
                  <div className="font-heading text-lg text-dojo-red">$197</div>
                  <div className="text-[10px] text-gray-500">/month</div>
                </div>
              </div>
            </div>

            {/* Form body */}
            <form onSubmit={handleCheckout} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
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
                    <p className="text-[10px] text-dojo-red mt-1">{errors.school_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
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
                    <p className="text-[10px] text-dojo-red mt-1">{errors.owner_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
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
                    <p className="text-[10px] text-dojo-red mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
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
                    <p className="text-[10px] text-dojo-red mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
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
                    <p className="text-[10px] text-dojo-red mt-1">{errors.num_students}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
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
                    <p className="text-[10px] text-dojo-red mt-1">{errors.current_software}</p>
                  )}
                </div>
              </div>

              {/* Error from payment intent creation or return status lookup */}
              {paymentError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {paymentError}
                </div>
              )}

              {/* Checkout button — only when payment element is NOT yet loaded */}
              {!clientSecret && (
                <div className="space-y-3 mt-2">
                  <button
                    type="submit"
                    disabled={paymentLoading || bankTransferLoading}
                    className="w-full py-3.5 rounded-xl bg-dojo-red text-white font-heading text-lg tracking-wider
                               hover:bg-dojo-crimson transition-all red-glow-hover
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Setting up card / ACH...
                      </span>
                    ) : (
                      'Pay Online By Card Or ACH'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBankTransfer}
                    disabled={paymentLoading || bankTransferLoading}
                    className="w-full py-3.5 rounded-xl border border-white/10 bg-dojo-carbon text-white font-heading text-base tracking-wider
                               hover:border-dojo-gold/40 hover:text-dojo-gold transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bankTransferLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating bank transfer instructions...
                      </span>
                    ) : (
                      'Use U.S. Bank Transfer Instead'
                    )}
                  </button>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Card and ACH save a payment method for automatic $197 monthly billing. U.S. bank transfer
                    creates instructions for the first $316 payment, then Stripe emails a fresh bank-transfer
                    invoice each month because recurring transfers require customer action.
                  </p>
                </div>
              )}
            </form>

            {/* ── Stripe Payment Element ── */}
            {clientSecret && (
              <div className="px-6 pb-6">
                <div className="border-t border-white/5 pt-6">
                  <div className="mb-4 p-4 rounded-xl bg-dojo-carbon/50 border border-white/5">
                    <p className="text-xs font-mono text-dojo-gold uppercase tracking-widest mb-2">
                      Card Or ACH
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Pay with a card or a US bank account. ACH bank debits can stay in processing for up to
                      4 business days, and Stripe might request microdeposit verification before the first
                      $316 payment clears.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
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

                  {/* Order summary */}
                  <div className="mt-4 p-4 rounded-xl bg-dojo-carbon/50 border border-white/5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">MatBoss Enrollment Engine</span>
                      <span className="text-white font-mono">$197/mo</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Setup & Implementation</span>
                      <span className="text-white font-mono">$119</span>
                    </div>
                    <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">Due today</span>
                      <span className="text-dojo-red font-heading text-lg">$316</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">
                      Then $197/month to the saved payment method until canceled. ACH can take up to 4
                      business days to clear.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              256-bit SSL Encrypted
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              No Long-Term Contracts
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Live Within 72 Hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
