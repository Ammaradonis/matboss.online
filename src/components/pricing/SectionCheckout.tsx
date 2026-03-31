import { useState } from 'react';

interface CheckoutFormData {
  school_name: string;
  owner_name: string;
  email: string;
  phone: string;
  num_students: string;
  current_software: string;
}

export default function SectionCheckout() {
  const [formData, setFormData] = useState<CheckoutFormData>({
    school_name: '',
    owner_name: '',
    email: '',
    phone: '',
    num_students: '',
    current_software: '',
  });
  const [showPayment, setShowPayment] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowPayment(true);
    }
  };

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full px-4 py-3 rounded-xl bg-dojo-carbon border text-white text-sm font-body
     placeholder-gray-600 focus:outline-none focus:border-dojo-red transition-colors
     ${errors[field] ? 'border-dojo-red/60' : 'border-white/10'}`;

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
                  />
                  {errors.current_software && (
                    <p className="text-[10px] text-dojo-red mt-1">{errors.current_software}</p>
                  )}
                </div>
              </div>

              {/* Checkout button - only show when payment is NOT yet revealed */}
              {!showPayment && (
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-dojo-red text-white font-heading text-lg tracking-wider
                             hover:bg-dojo-crimson transition-all red-glow-hover mt-2"
                >
                  Check Out
                </button>
              )}
            </form>

            {/* Payment section — only visible after form validation + "Check Out" click */}
            {showPayment && (
              <div className="px-6 pb-6">
                <div className="border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-4 h-4 text-dojo-gold"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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

                  {/* Stripe placeholder — will be replaced with real Stripe Elements */}
                  <div
                    id="stripe-payment-element"
                    className="min-h-[120px] rounded-xl bg-dojo-carbon border border-white/10 p-6 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-dojo-red/10 border border-dojo-red/20 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-dojo-red"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-400">
                        Stripe payment integration loading...
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        Secure payment processing will appear here
                      </p>
                    </div>
                  </div>

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
                      Then $197/month. No contracts. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg
                className="w-4 h-4 text-dojo-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              <svg
                className="w-4 h-4 text-dojo-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              <svg
                className="w-4 h-4 text-dojo-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
