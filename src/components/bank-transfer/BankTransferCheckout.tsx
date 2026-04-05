import { useState, useEffect, useRef } from 'react';

const CHECKOUT_STORAGE_KEY = 'matboss-bank-transfer-checkout';

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

const EMPTY_FORM_DATA: CheckoutFormData = {
  school_name: '',
  owner_name: '',
  email: '',
  phone: '',
  num_students: '',
  current_software: '',
};

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

export default function BankTransferCheckout() {
  const instructionsPanelRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<CheckoutFormData>(() => readStoredFormData());
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<BankTransferInstructions | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    if (!instructions || typeof window === 'undefined' || window.innerWidth >= 1024) return;

    const timeoutId = window.setTimeout(() => {
      instructionsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [instructions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setPaymentError(null);

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

      const data = await res.json();
      setInstructions({
        amountRemaining: data.amountRemaining,
        currency: data.currency,
        reference: data.reference,
        hostedInstructionsUrl: data.hostedInstructionsUrl,
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        recurringInvoiceDaysUntilDue: data.recurringInvoiceDaysUntilDue,
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyValue = async (field: string, value: string | null) => {
    if (!value || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
    }
  };

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full px-4 py-3 rounded-xl bg-dojo-carbon border text-white text-sm font-body
     placeholder-gray-600 focus:outline-none focus:border-dojo-red transition-colors
     ${errors[field] ? 'border-dojo-red/60' : 'border-white/10'}`;

  const schoolName = formData.school_name.trim();
  const customerEmail = formData.email.trim();
  const isFormLocked = Boolean(instructions);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (instructions?.currency || 'usd').toUpperCase(),
  }).format((instructions?.amountRemaining || 0) / 100);
  const transferSteps = [
    'Complete the academy profile and generate your private Stripe bank instructions.',
    'Open your banking app, send the first transfer, and include the payment reference if one is listed.',
    'After the first payment clears, Stripe emails each monthly transfer invoice automatically.',
  ];
  const trustSignals = [
    '256-bit SSL Encrypted',
    'No Long-Term Contracts',
    'Recurring Invoices by Email',
  ];

  if (instructions) {
    const instructionCards = [
      {
        key: 'account-holder',
        label: 'Account Holder',
        value: instructions.accountHolderName || 'See Stripe hosted instructions',
        copyValue: instructions.accountHolderName,
        monospace: false,
      },
      {
        key: 'bank-name',
        label: 'Bank Name',
        value: instructions.bankName || 'See Stripe hosted instructions',
        copyValue: instructions.bankName,
        monospace: false,
      },
      {
        key: 'routing-number',
        label: 'Routing Number',
        value: instructions.routingNumber || 'Available in Stripe hosted instructions',
        copyValue: instructions.routingNumber,
        monospace: true,
      },
      {
        key: 'account-number',
        label: 'Account Number',
        value: instructions.accountNumber || 'Available in Stripe hosted instructions',
        copyValue: instructions.accountNumber,
        monospace: true,
      },
    ];

    return (
      <section id="checkout" className="relative scroll-mt-32 overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-dojo-red/4 blur-[150px]" />
        </div>
        <div ref={instructionsPanelRef} className="mx-auto max-w-4xl reveal visible">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/5 bg-dojo-dark/80">
            <div className="border-b border-white/5 bg-dojo-carbon/50 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dojo-gold/30 bg-dojo-gold/10">
                    <svg className="h-5 w-5 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-4.418 0-8 1.79-8 4s3.582 4 8 4 8-1.79 8-4-3.582-4-8-4zm0 0V4m0 12v4m-4-8H4m16 0h-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl tracking-wide text-white sm:text-3xl">
                      U.S. Bank Transfer Instructions Ready
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400">
                      Send your first payment through your bank, then Stripe will email monthly bank-transfer invoices for the recurring plan.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dojo-red/20 bg-dojo-red/10 px-4 py-3 text-left sm:text-right">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Amount due today</div>
                  <div className="font-heading text-2xl text-dojo-red">{formattedAmount}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-6">
              <div className="rounded-2xl border border-white/5 bg-dojo-carbon/50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="mb-1 text-xs font-mono uppercase tracking-widest text-gray-500">How to pay</p>
                    <p className="text-sm leading-relaxed text-gray-300">
                      Open your bank app, send the transfer for {formattedAmount}, and include the reference code if one is shown below.
                    </p>
                  </div>
                  <div className="max-w-sm text-sm leading-relaxed text-gray-400">
                    Stripe keeps this first payment pending until the transfer lands. We start implementation only after the transfer succeeds.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {instructionCards.map((card) => (
                  <div key={card.key} className="rounded-2xl border border-white/5 bg-dojo-carbon/40 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-mono uppercase tracking-widest text-gray-500">{card.label}</p>
                      {card.copyValue && (
                        <button
                          type="button"
                          onClick={() => copyValue(card.key, card.copyValue)}
                          className="rounded-full border border-dojo-gold/20 bg-dojo-gold/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-dojo-gold transition-colors hover:bg-dojo-gold/20"
                        >
                          {copiedField === card.key ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                    <p className={`break-all text-sm text-white ${card.monospace ? 'font-mono' : ''}`}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/5 bg-dojo-carbon/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-mono uppercase tracking-widest text-gray-500">Transfer Reference</p>
                  {instructions.reference && (
                    <button
                      type="button"
                      onClick={() => copyValue('reference', instructions.reference)}
                      className="rounded-full border border-dojo-gold/20 bg-dojo-gold/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-dojo-gold transition-colors hover:bg-dojo-gold/20"
                    >
                      {copiedField === 'reference' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <p className="break-all text-sm font-mono text-white">
                  {instructions.reference || 'No reference code required for this transfer.'}
                </p>
              </div>

              <div className="rounded-2xl border border-dojo-gold/20 bg-dojo-gold/10 p-4 sm:p-5">
                <p className="mb-2 text-xs font-mono uppercase tracking-widest text-dojo-gold">Recurring Billing</p>
                <p className="text-sm leading-relaxed text-gray-300">
                  After Stripe marks this first {formattedAmount} transfer as paid, MatBoss creates your recurring $197 subscription in Stripe. Because bank transfers require payer action, Stripe emails a fresh monthly invoice with transfer instructions instead of auto-debiting your account. The recurring invoice will be due {instructions.recurringInvoiceDaysUntilDue} days after it is issued.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {instructions.hostedInstructionsUrl && (
                  <a
                    href={instructions.hostedInstructionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-dojo-red px-5 py-3 text-center font-heading tracking-wider text-white transition-colors hover:bg-dojo-crimson sm:w-auto"
                  >
                    Open Stripe Instructions
                  </a>
                )}
                <a
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-dojo-carbon px-5 py-3 text-center font-heading tracking-wider text-gray-300 transition-colors hover:bg-white/5 hover:text-white sm:w-auto"
                >
                  Use Card or Wallet Instead
                </a>
              </div>

              <p className="text-xs leading-relaxed text-gray-500">
                {schoolName ? `${schoolName}` : 'Your academy'} will move into onboarding after the first transfer clears.
                {customerEmail ? ` Stripe will use ${customerEmail} for receipts and invoice emails.` : ''}
              </p>
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
            Fill in your details below. Once confirmed, we prepare a private bank-transfer checkout for the first payment. No contracts. No lock-in. Cancel any time.
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

              <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
                <div className="rounded-2xl border border-white/5 bg-dojo-carbon/35 p-4 text-[11px] leading-relaxed text-gray-400 sm:text-xs">
                  We will generate private Stripe routing details for your first $316 payment. After that, Stripe emails a new transfer invoice every month because recurring bank transfers require your approval each cycle.
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

                <div className="mt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-dojo-red py-3.5 text-lg font-heading tracking-wider text-white transition-all hover:bg-dojo-crimson red-glow-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating bank transfer instructions...
                      </span>
                    ) : (
                      'Create Bank Transfer Instructions'
                    )}
                  </button>

                  <p className="text-[11px] leading-relaxed text-gray-500">
                    The first transfer covers setup plus the first month. After that, Stripe sends a fresh monthly invoice by email for each new bank transfer payment.
                  </p>
                </div>
              </form>
            </div>
          </div>

          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-dojo-red/15 bg-dojo-dark/80 p-5">
              <div className="mb-3 text-xs font-mono uppercase tracking-widest text-dojo-gold">
                How It Works
              </div>
              <ul className="space-y-3">
                {transferSteps.map((step) => (
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
                  Once the first transfer clears, recurring billing continues at $197/month through emailed Stripe invoices.
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
                href="/pricing"
                className="inline-flex w-full items-center justify-center rounded-xl border border-dojo-gold/20 bg-dojo-gold/10 px-4 py-3 text-center text-sm font-heading tracking-wider text-dojo-gold transition-colors hover:bg-dojo-gold/20"
              >
                Prefer Card or Wallet Checkout?
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
