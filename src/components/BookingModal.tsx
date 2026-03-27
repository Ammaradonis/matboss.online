import { useState } from 'react';
import type { TimeSlot, BookingFormData, BookingConfirmation } from '../types';
import { bookSlot, formatTimeForDisplay } from '../lib/api';

interface Props {
  slot: TimeSlot;
  timezone: string;
  onClose: () => void;
  onComplete: (confirmation: BookingConfirmation) => void;
}

export default function BookingModal({ slot, timezone, onClose, onComplete }: Props) {
  const [form, setForm] = useState<BookingFormData>({
    school_name: '',
    owner_name: '',
    email: '',
    phone: '',
    num_students: 0,
    current_software: '',
    website: '',
    monthly_trial_volume: undefined,
    biggest_challenge: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof BookingFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.school_name || !form.owner_name || !form.email || !form.phone || !form.num_students || !form.current_software) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const confirmation = await bookSlot(slot.id, form, timezone);
      onComplete(confirmation);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const dateDisplay = new Date(slot.slot_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-dojo-dark border border-dojo-red/30 rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto red-glow animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-xl tracking-wider text-white">
              Book Your Leakage Diagnosis
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full
                         text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-dojo-red/20 text-dojo-red font-mono text-xs font-bold">
              {dateDisplay}
            </span>
            <span className="text-gray-400 font-mono">
              {formatTimeForDisplay(slot.start_time, timezone)} – {formatTimeForDisplay(slot.end_time, timezone)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Required Fields */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              School Name <span className="text-dojo-red">*</span>
            </label>
            <input
              type="text"
              value={form.school_name}
              onChange={(e) => update('school_name', e.target.value)}
              placeholder="e.g. San Diego Elite BJJ"
              className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                         text-white text-sm placeholder:text-gray-600
                         focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                         transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Owner Name <span className="text-dojo-red">*</span>
            </label>
            <input
              type="text"
              value={form.owner_name}
              onChange={(e) => update('owner_name', e.target.value)}
              placeholder="Your full name"
              className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                         text-white text-sm placeholder:text-gray-600
                         focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                         transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Email <span className="text-dojo-red">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@dojo.com"
                className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm placeholder:text-gray-600
                           focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                           transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Phone <span className="text-dojo-red">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="(619) 555-0100"
                className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm placeholder:text-gray-600
                           focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                           transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Current Students <span className="text-dojo-red">*</span>
              </label>
              <input
                type="number"
                value={form.num_students || ''}
                onChange={(e) => update('num_students', parseInt(e.target.value) || 0)}
                placeholder="e.g. 85"
                min="1"
                className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm placeholder:text-gray-600
                           focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                           transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Booking Software <span className="text-dojo-red">*</span>
              </label>
              <input
                type="text"
                value={form.current_software}
                onChange={(e) => update('current_software', e.target.value)}
                placeholder="e.g. MindBody, Zen Planner"
                className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm placeholder:text-gray-600
                           focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                           transition-colors"
                required
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Optional</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website || ''}
                  onChange={(e) => update('website', e.target.value)}
                  placeholder="https://yourdojo.com"
                  className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                             text-white text-sm placeholder:text-gray-600
                             focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                             transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Monthly Trial Volume
                </label>
                <input
                  type="number"
                  value={form.monthly_trial_volume || ''}
                  onChange={(e) => update('monthly_trial_volume', parseInt(e.target.value) || 0)}
                  placeholder="How many trials per month?"
                  className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                             text-white text-sm placeholder:text-gray-600
                             focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                             transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Biggest Challenge
                </label>
                <textarea
                  value={form.biggest_challenge || ''}
                  onChange={(e) => update('biggest_challenge', e.target.value)}
                  placeholder="What's your #1 enrollment challenge right now?"
                  rows={2}
                  className="w-full bg-dojo-carbon border border-white/10 rounded-lg px-3 py-2.5
                             text-white text-sm placeholder:text-gray-600
                             focus:border-dojo-red/50 focus:outline-none focus:ring-1 focus:ring-dojo-red/30
                             transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-dojo-red/10 border border-dojo-red/30 text-sm text-dojo-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-dojo-red text-white font-heading text-lg tracking-wider
                       hover:bg-dojo-crimson transition-all duration-200 red-glow-hover
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Securing Your Slot...
              </span>
            ) : (
              'Confirm Diagnosis Call'
            )}
          </button>

          <p className="text-[10px] text-gray-600 text-center">
            Free 30-minute call with Ammar Alkheder, Founder of MatBoss.
            <br />
            No obligation. No sales pitch. Just your enrollment data.
          </p>
        </form>
      </div>
    </div>
  );
}
