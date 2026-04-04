import { useState, useEffect } from 'react';

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
  const [formData, setFormData] = useState<CheckoutFormData>(() => readStoredFormData());
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<BankTransferInstructions | null>(null);

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

  // ── Bank Transfer Instructions ──
  if (instructions) {
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
                    <p className="font-heading text-3xl text-dojo-red">{formattedAmount}</p>
                  </div>
                  <div className="text-sm text-gray-400 max-w-sm">
                    Stripe keeps this first payment pending until the transfer lands. We start implementation only after the transfer succeeds.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-white text-sm break-words">{instructions.accountHolderName || 'See Stripe hosted instructions'}</p>
                </div>
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-white text-sm break-words">{instructions.bankName || 'See Stripe hosted instructions'}</p>
                </div>
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Routing Number</p>
                  <p className="text-white text-sm font-mono break-all">{instructions.routingNumber || 'Available in Stripe hosted instructions'}</p>
                </div>
                <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Account Number</p>
                  <p className="text-white text-sm font-mono break-all">{instructions.accountNumber || 'Available in Stripe hosted instructions'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dojo-carbon/40 border border-white/5">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Transfer Reference</p>
                <p className="text-white text-sm font-mono break-all">
                  {instructions.reference || 'No reference code required for this transfer.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dojo-gold/10 border border-dojo-gold/20">
                <p className="text-xs font-mono text-dojo-gold uppercase tracking-widest mb-2">Recurring Billing</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  After Stripe marks this first {formattedAmount} transfer as paid, MatBoss creates
                  your recurring $197 subscription in Stripe. Because bank transfers require payer action, Stripe
                  emails a fresh monthly invoice with transfer instructions instead of auto-debiting your account.
                  The recurring invoice will be due {instructions.recurringInvoiceDaysUntilDue} days
                  after it is issued.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {instructions.hostedInstructionsUrl && (
                  <a
                    href={instructions.hostedInstructionsUrl}
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

  // ── Main Checkout Form ──
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
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
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

              {paymentError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {paymentError}
                </div>
              )}

              <div className="space-y-3 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-dojo-red text-white font-heading text-lg tracking-wider
                             hover:bg-dojo-crimson transition-all red-glow-hover
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating bank transfer instructions...
                    </span>
                  ) : (
                    'Check Out'
                  )}
                </button>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  U.S. bank transfer creates instructions for the first $316 payment (setup + first month),
                  then Stripe emails a fresh bank-transfer invoice each month because recurring transfers
                  require customer action.
                </p>
              </div>
            </form>

            {/* Order summary */}
            <div className="px-6 pb-6">
              <div className="p-4 rounded-xl bg-dojo-carbon/50 border border-white/5">
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
                  Then $197/month via bank-transfer invoices emailed by Stripe until canceled.
                </p>
              </div>
            </div>
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
