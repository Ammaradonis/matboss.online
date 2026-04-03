import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface Props {
  onPaymentStateChange: (state: 'processing' | 'succeeded') => void;
  formData: {
    school_name: string;
    owner_name: string;
    email: string;
  };
}

export default function StripePaymentForm({ onPaymentStateChange, formData }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setError(submitError.message || 'Please review the payment details and try again.');
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pricing?payment_return=1`,
        receipt_email: formData.email,
        payment_method_data: {
          billing_details: {
            name: formData.owner_name,
            email: formData.email,
          },
        },
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setProcessing(false);
    } else {
      if (paymentIntent?.status === 'succeeded') {
        onPaymentStateChange('succeeded');
      } else if (paymentIntent?.status === 'processing') {
        onPaymentStateChange('processing');
      } else if (paymentIntent?.status === 'requires_payment_method') {
        setError('Your payment method was not accepted. Please choose another one and try again.');
        setProcessing(false);
        return;
      } else {
        setError('Payment setup is incomplete. Please review the payment form and try again.');
        setProcessing(false);
        return;
      }

      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
          business: { name: 'MatBoss' },
        }}
      />

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-5 py-3.5 rounded-xl bg-dojo-red text-white font-heading text-lg tracking-wider
                   hover:bg-dojo-crimson transition-all red-glow-hover
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Authorize & Pay $316'
        )}
      </button>

      <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
        By clicking Authorize &amp; Pay $316, you authorize MatBoss to charge $316 today and save this
        payment method for recurring $197 monthly billing until canceled. ACH bank debits can take up to
        4 business days to confirm and may require additional bank verification.
      </p>
    </form>
  );
}
