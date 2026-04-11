import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import NoShowRecoveryEngine from '../components/demos/NoShowRecoveryEngine';
import EnrollmentLeakCalculator from '../components/demos/EnrollmentLeakCalculator';
import TrialConversionSequence from '../components/demos/TrialConversionSequence';
import LiveBookingBot from '../components/demos/LiveBookingBot';
import AdminHoursSavedDashboard from '../components/demos/AdminHoursSavedDashboard';
import CompetitiveGapAudit from '../components/demos/CompetitiveGapAudit';

const PROGRAMS = [
  'Brazilian Jiu-Jitsu (BJJ)',
  'Muay Thai / Kickboxing',
  'Mixed Martial Arts (MMA)',
  'Karate',
  'Judo',
  'Wrestling',
  'Kids Martial Arts',
];

const TRIAL_TIMES = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${hour12}:${String(m).padStart(2, '0')} ${period}`;
      slots.push({ value, label });
    }
  }
  return slots;
})();

const SAN_DIEGO_TZ = 'America/Los_Angeles';
const MIN_LEAD_HOURS = 25;

function getSanDiegoOffset(dateStr: string, timeStr: string) {
  const approxMoment = new Date(`${dateStr}T${timeStr}:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SAN_DIEGO_TZ,
    timeZoneName: 'longOffset',
  }).formatToParts(approxMoment);
  const raw = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT-08:00';
  const offset = raw.replace('GMT', '');
  return offset || '-08:00';
}

function buildMakeTimestamp(dateStr: string, timeStr: string) {
  return `${dateStr}T${timeStr}:00${getSanDiegoOffset(dateStr, timeStr)}`;
}

function buildHumanDateTime(dateStr: string, timeStr: string) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  const datePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, mo - 1, d)));
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const timePart = mi === 0 ? `${hour12} ${period}` : `${hour12}:${String(mi).padStart(2, '0')} ${period}`;
  return `${datePart} at ${timePart}`;
}

function getSanDiegoMinimum() {
  const target = new Date(Date.now() + MIN_LEAD_HOURS * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SAN_DIEGO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(target);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return {
    minDate: `${get('year')}-${get('month')}-${get('day')}`,
    minTime: `${get('hour')}:${get('minute')}`,
  };
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function DemoPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [form, setForm] = useState({
    trainer_name: '',
    school_name: '',
    student_name: '',
    role: '',
    email: '',
    phone: '',
    program: '',
    trial_date: '',
    trial_time: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { minDate, minTime } = useMemo(getSanDiegoMinimum, []);

  const availableTimes = useMemo(() => {
    if (form.trial_date && form.trial_date === minDate) {
      return TRIAL_TIMES.filter(t => t.value >= minTime);
    }
    return TRIAL_TIMES;
  }, [form.trial_date, minDate, minTime]);

  useEffect(() => {
    if (
      form.trial_date === minDate &&
      form.trial_time &&
      form.trial_time < minTime
    ) {
      setForm(prev => ({ ...prev, trial_time: '' }));
    }
  }, [form.trial_date, form.trial_time, minDate, minTime]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      form.trial_date < minDate ||
      (form.trial_date === minDate && form.trial_time < minTime)
    ) {
      setStatus('error');
      setErrorMsg('Trial must be booked at least 25 hours in advance (San Diego time).');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      trainer_name: form.trainer_name,
      school_name: form.school_name,
      student_name: form.student_name,
      role: form.role,
      email: form.email,
      phone: form.phone,
      program: form.program,
      trial_date: form.trial_date,
      trial_time: form.trial_time,
      Make_timestamp: buildMakeTimestamp(form.trial_date, form.trial_time),
      'date-time': buildHumanDateTime(form.trial_date, form.trial_time),
    };

    try {
      const res = await fetch('https://hook.eu1.make.com/yuamuo4cnbguxlh51ri2bsbmo0n1egu6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  const inputClass =
    'w-full rounded bg-dojo-carbon border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-dojo-red transition-colors';
  const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1';

  return (
    <div className="min-h-screen bg-dojo-black text-gray-300">
      <SEO
        title="Free Demo | MatBoss Official Website — Try MatBoss for Your San Diego Dojo"
        description="Request a free demo of MatBoss — the enrollment automation platform built exclusively for San Diego martial arts schools, BJJ academies, karate dojos, and MMA gyms. Fill out the form and see MatBoss in action with your own school's data."
        canonical="/demo"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Free Demo', url: '/demo' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://matboss.online/demo',
          name: 'Free Demo | MatBoss Official Website',
          description: 'Request a free demo of MatBoss enrollment automation for San Diego martial arts schools.',
          url: 'https://matboss.online/demo',
          inLanguage: 'en-US',
          isPartOf: { '@id': 'https://matboss.online/#website' },
          about: { '@id': 'https://matboss.online/#organization' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://matboss.online' },
              { '@type': 'ListItem', position: 2, name: 'Free Demo', item: 'https://matboss.online/demo' },
            ],
          },
          dateModified: '2026-04-09',
          publisher: { '@id': 'https://matboss.online/#organization' },
          author: { '@id': 'https://matboss.online/#founder' },
          keywords: 'MatBoss demo, MatBoss Official Website free trial, San Diego martial arts enrollment demo, BJJ academy demo, dojo automation free demo, Ammar Alkheder MatBoss',
        }}
      />

      <div className="max-w-lg mx-auto px-4 pt-16 md:pt-24 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-12">
          &larr; Back to Home
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-wider mb-2">
          TRY MATBOSS FREE
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          San Diego dojo owners — fill out the form below and we'll run a live demo using your school's real programs and student flow.
        </p>

        {status === 'success' ? (
          <div className="rounded border border-dojo-red/30 bg-dojo-red/10 px-6 py-8 text-center">
            <p className="text-white font-semibold text-lg mb-2">Demo request received.</p>
            <p className="text-gray-400 text-sm">We'll be in touch shortly to schedule your session.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="trainer_name" className={labelClass}>Trainer Name</label>
              <input
                id="trainer_name"
                name="trainer_name"
                type="text"
                required
                placeholder="Your name"
                value={form.trainer_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="school_name" className={labelClass}>School Name</label>
              <input
                id="school_name"
                name="school_name"
                type="text"
                required
                placeholder="Your school or academy name"
                value={form.school_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="student_name" className={labelClass}>Student Name</label>
              <input
                id="student_name"
                name="student_name"
                type="text"
                required
                placeholder="A sample student name for the demo"
                value={form.student_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="role" className={labelClass}>Are You a Parent or an Adult?</label>
              <select
                id="role"
                name="role"
                required
                value={form.role}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="" disabled>Select one</option>
                <option value="Adult Student">Adult Student</option>
                <option value="Parent of a Student">Parent of a Student</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@yourdojo.com"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="(619) 000-0000"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="program" className={labelClass}>Program</label>
              <select
                id="program"
                name="program"
                required
                value={form.program}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="" disabled>Select a program</option>
                {PROGRAMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="trial_date" className={labelClass}>Trial Date</label>
              <input
                id="trial_date"
                name="trial_date"
                type="date"
                required
                min={minDate}
                value={form.trial_date}
                onChange={handleChange}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-gray-600">
                Trials must be scheduled at least 25 hours ahead (San Diego time).
              </p>
            </div>

            <div>
              <label htmlFor="trial_time" className={labelClass}>Trial Time</label>
              <select
                id="trial_time"
                name="trial_time"
                required
                disabled={!form.trial_date}
                value={form.trial_time}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="" disabled>
                  {form.trial_date ? 'Select a start time' : 'Pick a trial date first'}
                </option>
                {availableTimes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {status === 'error' && (
              <p className="text-dojo-red text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded bg-dojo-red px-6 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending…' : 'Request Free Demo'}
            </button>
          </form>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LIVE DEMO SHOWCASE — 6 interactive demos below the form */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <DemoShowcaseIntro />

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <NoShowRecoveryEngine />
        <EnrollmentLeakCalculator />
        <TrialConversionSequence />
        <LiveBookingBot />
        <AdminHoursSavedDashboard />
        <CompetitiveGapAudit />

        {/* Final CTA back to the form */}
        <div className="my-24 text-center">
          <div className="inline-block px-6 py-3 rounded-full border border-dojo-red/30 bg-dojo-red/5 mb-6">
            <span className="text-[10px] font-mono text-dojo-red uppercase tracking-[0.3em]">
              ◆ You've seen the engine. Now run it on your own dojo.
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-6xl text-white tracking-wide mb-4">
            YOUR FUNNEL. YOUR STUDENTS.
            <br />
            <span className="text-dojo-red">ONE LIVE DEMO.</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Scroll back to the form. We'll plug your real programs and trial flow into a live MatBoss instance and show you, on a screen-share call, exactly what this looks like running 24/7 on your San Diego dojo.
          </p>
          <button
            onClick={() => {
              const form = document.querySelector('form');
              form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="inline-block px-8 py-4 rounded bg-dojo-red text-white text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 0 25px rgba(220,38,38,0.5), 0 0 60px rgba(220,38,38,0.2)' }}
          >
            ↑ Request My Free Demo
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DemoShowcaseIntro() {
  return (
    <div className="relative mt-12 mb-4 py-16 border-y border-dojo-red/10 overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-dojo-red/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-dojo-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-dojo-red/50" />
          <span className="text-[10px] font-mono text-dojo-red uppercase tracking-[0.3em]">
            ◆ The Live Demo Showcase ◆
          </span>
          <div className="h-px w-12 bg-dojo-red/50" />
        </div>

        <h2 className="font-heading text-4xl md:text-6xl text-white tracking-wide leading-tight mb-4">
          DON'T JUST TAKE OUR WORD.
          <br />
          <span className="text-dojo-red">PRESS EVERY BUTTON.</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-2">
          Six interactive demos below. Zero slides. No stock video. Every widget runs live in your browser — press play, punch in your numbers, talk to the bot, click the branches. This is the exact machinery that runs under the hood at every MatBoss-powered San Diego dojo.
        </p>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
          Fair warning: once you see the gap between what you're doing now and what automation handles in milliseconds, it's hard to un-see it.
        </p>

        {/* Demo index chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {[
            { id: 'demo-no-show-recovery', label: '01 · No-Show Recovery Engine', color: 'dojo-red' },
            { id: 'demo-leak-calculator', label: '02 · Enrollment Leak Calculator', color: 'dojo-gold' },
            { id: 'demo-trial-sequence', label: '03 · 72-Hour Conversion Sequence', color: 'dojo-red' },
            { id: 'demo-booking-bot', label: '04 · Live Booking Bot', color: 'dojo-gold' },
            { id: 'demo-admin-hours', label: '05 · Admin Hours Dashboard', color: 'dojo-red' },
            { id: 'demo-gap-audit', label: '06 · Competitive Gap Audit', color: 'dojo-gold' },
          ].map((chip) => (
            <a
              key={chip.id}
              href={`#${chip.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(chip.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-full border transition-all hover:scale-105 ${
                chip.color === 'dojo-red'
                  ? 'border-dojo-red/30 text-dojo-red hover:bg-dojo-red/10 hover:border-dojo-red/60'
                  : 'border-dojo-gold/30 text-dojo-gold hover:bg-dojo-gold/10 hover:border-dojo-gold/60'
              }`}
            >
              {chip.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
