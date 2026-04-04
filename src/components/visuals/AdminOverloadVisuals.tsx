import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Weekly Hours Burned — Time Hemorrhage Bars ─── */
export function AdminChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tasks = [
    { label: 'Texting trial reminders', hours: 3.5, max: 5 },
    { label: 'Calling no-shows', hours: 4.2, max: 5 },
    { label: 'DM replies & inquiries', hours: 2.5, max: 5 },
    { label: 'Spreadsheet updates', hours: 1.8, max: 5 },
    { label: 'Follow-up with attendees', hours: 3.3, max: 5 },
    { label: 'Chasing late payments', hours: 1.5, max: 5 },
  ];
  const totalWasted = tasks.reduce((s, t) => s + t.hours, 0);
  const teachingHours = 20;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Chart — Weekly Hours Burned On Admin
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8">
        <div className="space-y-4">
          {tasks.map((t, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{t.label}</span>
                <span className="text-xs font-mono text-dojo-red font-bold">{t.hours} hrs/week</span>
              </div>
              <div className="h-6 rounded-lg bg-dojo-carbon overflow-hidden relative">
                <div
                  className="h-full rounded-lg transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{
                    width: visible ? `${(t.hours / t.max) * 100}%` : '0%',
                    transitionDelay: `${i * 100}ms`,
                    background: 'linear-gradient(90deg, rgba(220,38,38,0.6), rgba(220,38,38,0.3))',
                  }}
                >
                  {/* Animated shimmer */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: visible ? 'shimmer 2s infinite' : 'none',
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Admin Waste</div>
            <div className="font-heading text-3xl text-dojo-red">{totalWasted.toFixed(1)}h</div>
            <div className="text-[9px] text-gray-600">per week</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Teaching</div>
            <div className="font-heading text-3xl text-green-400">{teachingHours}h</div>
            <div className="text-[9px] text-gray-600">per week</div>
          </div>
          <div className="p-4 rounded-xl bg-dojo-gold/10 border border-dojo-gold/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Admin Ratio</div>
            <div className="font-heading text-3xl text-dojo-gold">
              {Math.round((totalWasted / (totalWasted + teachingHours)) * 100)}%
            </div>
            <div className="text-[9px] text-gray-600">of working hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: Manual Chaos vs Automated Discipline ─── */
export function AdminDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const manualSteps = [
    { icon: '?', label: 'Lead comes in', sub: 'Owner notices hours later' },
    { icon: '!', label: 'Manual text sent', sub: 'Copy-paste, if they remember' },
    { icon: '...', label: 'No show happens', sub: 'Nobody follows up' },
    { icon: 'X', label: 'Student lost', sub: 'Owner never knew' },
  ];

  const autoSteps = [
    { icon: '>', label: 'Lead captured', sub: 'Instant, automatic' },
    { icon: '>>', label: '3-touch reminders', sub: '24h, 2h, 30min — zero effort' },
    { icon: '<>', label: 'No-show recovery', sub: '15-min auto sequence fires' },
    { icon: '+', label: 'Student enrolled', sub: 'Follow-up closes the deal' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Diagram — Chaos vs Discipline
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Manual / Chaos side */}
        <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-dojo-red animate-pulse" />
            <span className="text-xs font-mono text-dojo-red uppercase tracking-widest">Your Current System</span>
          </div>
          <div className="space-y-3">
            {manualSteps.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-dojo-red/5 border border-dojo-red/10 transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-30px)',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-dojo-red/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-sm text-dojo-red font-bold">{s.icon}</span>
                </div>
                <div>
                  <div className="text-sm text-white">{s.label}</div>
                  <div className="text-[10px] text-gray-500">{s.sub}</div>
                </div>
                {i < manualSteps.length - 1 && (
                  <div className="ml-auto">
                    <svg className="w-4 h-4 text-dojo-red/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-dojo-red/10 border border-dojo-red/20 text-center">
            <span className="font-heading text-lg text-dojo-red">RESULT: 12% CONVERSION</span>
          </div>
        </div>

        {/* Automated / Discipline side */}
        <div className="bg-dojo-dark/80 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-500 uppercase tracking-widest">With MatBoss</span>
          </div>
          <div className="space-y-3">
            {autoSteps.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(30px)',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-sm text-green-400 font-bold">{s.icon}</span>
                </div>
                <div>
                  <div className="text-sm text-white">{s.label}</div>
                  <div className="text-[10px] text-gray-500">{s.sub}</div>
                </div>
                {i < autoSteps.length - 1 && (
                  <div className="ml-auto">
                    <svg className="w-4 h-4 text-green-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <span className="font-heading text-lg text-green-400">RESULT: 72% CONVERSION</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: The Burnout Toggle ─── */
export function AdminInteractive() {
  const [automated, setAutomated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tasks = [
    { manual: 'Manually text each trial reminder', auto: 'Auto SMS at 24h, 2h, 30min', manualTime: 20, autoTime: 0 },
    { manual: 'Call no-shows between classes', auto: 'Recovery sequence fires in 15 min', manualTime: 25, autoTime: 0 },
    { manual: 'Update lead spreadsheet by hand', auto: 'CRM updates automatically', manualTime: 10, autoTime: 0 },
    { manual: 'DM replies throughout the day', auto: 'Auto-response + booking link', manualTime: 15, autoTime: 0 },
    { manual: 'Follow up with trial attendees', auto: 'Enrollment sequence auto-drips', manualTime: 20, autoTime: 0 },
    { manual: 'Chase down expired trial offers', auto: 'Deadline automation handles it', manualTime: 10, autoTime: 0 },
  ];

  const totalManual = tasks.reduce((s, t) => s + t.manualTime, 0);
  const totalAuto = tasks.reduce((s, t) => s + t.autoTime, 0);

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Toggle Your Reality
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border rounded-2xl p-6 md:p-8 transition-all duration-500"
        style={{
          borderColor: automated ? 'rgba(34,197,94,0.2)' : 'rgba(220,38,38,0.2)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        {/* Toggle switch */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-mono transition-colors ${!automated ? 'text-dojo-red' : 'text-gray-600'}`}>
            Manual Grind
          </span>
          <button
            onClick={() => setAutomated(!automated)}
            className="relative w-16 h-8 rounded-full transition-colors duration-300 cursor-pointer"
            style={{ background: automated ? '#22c55e' : '#dc2626' }}
          >
            <div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300"
              style={{ left: automated ? '34px' : '4px' }}
            />
          </button>
          <span className={`text-sm font-mono transition-colors ${automated ? 'text-green-400' : 'text-gray-600'}`}>
            MatBoss Automated
          </span>
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((t, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 ${
                automated
                  ? 'bg-green-500/5 border-green-500/10'
                  : 'bg-dojo-red/5 border-dojo-red/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {automated ? (
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-dojo-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm text-gray-300 transition-all duration-300">
                  {automated ? t.auto : t.manual}
                </span>
              </div>
              <span className={`text-xs font-mono font-bold transition-colors duration-300 ${
                automated ? 'text-green-500' : 'text-dojo-red'
              }`}>
                {automated ? `${t.autoTime} min` : `${t.manualTime} min`}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-sm text-gray-400">Daily admin time</span>
          <div className="flex items-center gap-3">
            <span
              className={`font-heading text-2xl transition-all duration-500 ${
                automated ? 'text-green-400' : 'text-dojo-red'
              }`}
              style={{
                textShadow: automated
                  ? '0 0 15px rgba(34,197,94,0.4)'
                  : '0 0 15px rgba(220,38,38,0.4)',
              }}
            >
              {automated ? `${totalAuto} min` : `${totalManual} min`}
            </span>
            {automated && (
              <span className="text-xs text-green-500 font-mono animate-pulse">
                {totalManual} min saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
