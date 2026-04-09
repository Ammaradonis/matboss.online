import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

const PROGRAMS = [
  'Brazilian Jiu-Jitsu (BJJ)',
  'Muay Thai / Kickboxing',
  'Mixed Martial Arts (MMA)',
  'Karate',
  'Judo',
  'Wrestling',
  'Kids Martial Arts',
];

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
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      <div className="max-w-lg mx-auto px-4 py-16 md:py-24">
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

      <Footer />
    </div>
  );
}
