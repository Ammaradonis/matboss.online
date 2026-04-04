import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Deployment Velocity Tracker ─── */
export function DetonationChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const phases = [
    { label: 'Pipeline Audit', target: 100, days: '1-3', color: '#d4a017' },
    { label: 'Automation Build', target: 100, days: '3-5', color: '#f59e0b' },
    { label: 'Reminders Active', target: 100, days: '5-7', color: '#22c55e' },
    { label: 'Recovery Engine', target: 100, days: '7-10', color: '#22c55e' },
    { label: 'Follow-Up Drip', target: 100, days: '10-14', color: '#22c55e' },
    { label: 'Full Optimization', target: 100, days: '14-30', color: '#9333ea' },
  ];

  // MatBoss completes in 30 days total
  // Competitors take 90 days
  const matBossDays = 30;
  const competitorDays = 90;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Chart — Deployment Velocity: MatBoss vs Industry
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8">
        {/* Phase bars */}
        <div className="space-y-3 mb-8">
          {phases.map((p, i) => (
            <div
              key={i}
              className="transition-all duration-600"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{p.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-gray-500">Day {p.days}</span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: p.color }}>
                    {p.target}%
                  </span>
                </div>
              </div>
              <div className="h-5 rounded-lg bg-dojo-carbon overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-1200 ease-out relative overflow-hidden"
                  style={{
                    width: visible ? `${p.target}%` : '0%',
                    transitionDelay: `${i * 150 + 200}ms`,
                    background: `linear-gradient(90deg, ${p.color}50, ${p.color}20)`,
                    borderLeft: `3px solid ${p.color}`,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: visible ? 'shimmer 2s infinite' : 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Speed comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">MatBoss Full Deploy</div>
            <div className="font-heading text-4xl text-green-400">{matBossDays}</div>
            <div className="text-xs text-gray-500">days to full capacity</div>
          </div>
          <div className="p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Industry Average</div>
            <div className="font-heading text-4xl text-dojo-red">{competitorDays}</div>
            <div className="text-xs text-gray-500">days — if they finish at all</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: Mission Control Dashboard ─── */
export function DetonationDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      setActivePhase((p) => (p + 1) % 4);
    }, 2500);
    return () => clearInterval(iv);
  }, [visible]);

  const metrics = [
    [
      { label: 'Pipeline Mapped', value: '100%', active: activePhase >= 0 },
      { label: 'Leaks Identified', value: '4', active: activePhase >= 0 },
      { label: 'Integration Ready', value: 'YES', active: activePhase >= 0 },
    ],
    [
      { label: 'Reminders Active', value: '3-touch', active: activePhase >= 1 },
      { label: 'Recovery Engine', value: 'ARMED', active: activePhase >= 1 },
      { label: 'Follow-Up Drip', value: '7-day', active: activePhase >= 1 },
    ],
    [
      { label: 'No-Shows Recovered', value: '3/mo', active: activePhase >= 2 },
      { label: 'Response Time', value: '<30s', active: activePhase >= 2 },
      { label: 'Enrollment Rate', value: '+312%', active: activePhase >= 2 },
    ],
    [
      { label: 'Revenue Recovered', value: '$1,200+', active: activePhase >= 3 },
      { label: 'Admin Hours Saved', value: '6.5/wk', active: activePhase >= 3 },
      { label: 'System Status', value: 'OPTIMAL', active: activePhase >= 3 },
    ],
  ];

  const phaseLabels = ['Phase 1: Mapping', 'Phase 2: Activation', 'Phase 3: First Results', 'Phase 4: Full Capacity'];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Diagram — Mission Control: System Activation Dashboard
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        {/* Phase tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {phaseLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => setActivePhase(i)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activePhase === i
                  ? 'bg-dojo-gold/20 border border-dojo-gold/40 text-dojo-gold'
                  : i <= activePhase
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-dojo-carbon border border-white/5 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Metric grids */}
        <div className="space-y-4">
          {metrics.map((row, ri) => (
            <div key={ri}>
              <div className="grid grid-cols-3 gap-3">
                {row.map((m, mi) => (
                  <div
                    key={mi}
                    className="p-4 rounded-xl border transition-all duration-500 text-center"
                    style={{
                      borderColor: m.active ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)',
                      background: m.active ? 'rgba(34,197,94,0.05)' : 'rgba(26,26,26,0.5)',
                      opacity: visible ? 1 : 0,
                      transitionDelay: `${(ri * 3 + mi) * 50}ms`,
                    }}
                  >
                    <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                    <div className={`font-heading text-xl transition-colors duration-300 ${
                      m.active ? 'text-green-400' : 'text-gray-700'
                    }`}>
                      {m.active ? m.value : '---'}
                    </div>
                    {m.active && (
                      <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mt-2 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Day-by-Day Mission Log ─── */
export function DetonationInteractive() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const days: Record<number, { title: string; events: string[]; status: string }> = {
    1: { title: 'Kickoff & Discovery', events: ['Full enrollment pipeline audit begins', 'Interview with owner: current tools, pain points', 'Map every touchpoint from lead to enrollment'], status: 'RECON' },
    3: { title: 'Architecture Complete', events: ['Leak points documented and prioritized', 'Integration with existing booking software confirmed', 'Automation logic designed and approved'], status: 'MAPPED' },
    5: { title: 'Reminders Go Live', events: ['3-touch SMS reminder sequence activated', 'Email confirmation flow deployed', 'First trial leads enter the automated pipeline'], status: 'ACTIVE' },
    7: { title: 'Full Engine Online', events: ['No-show recovery engine armed and firing', 'Post-trial enrollment sequence activated', 'Real-time tracking dashboard configured'], status: 'DEPLOYED' },
    14: { title: 'First Recoveries Confirmed', events: ['2-3 no-show students recovered and rebooked', 'First automated enrollment conversion logged', 'MatBoss has already paid for itself'], status: 'ROI HIT' },
    30: { title: 'Pipeline at Full Capacity', events: ['All 5 systems at 100% operational capacity', 'Owner admin time reduced by 90 min/day', 'Monthly revenue recovery on track: $1,200+'], status: 'OPTIMAL' },
  };

  const dayKeys = Object.keys(days).map(Number);
  const current = days[selectedDay];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Day-by-Day Mission Log
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Day selector */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {dayKeys.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 rounded-lg font-mono text-xs transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  selectedDay === d
                    ? 'bg-dojo-red text-white'
                    : 'bg-dojo-carbon border border-white/5 text-gray-500 hover:border-dojo-red/20 hover:text-gray-300'
                }`}
                style={{
                  boxShadow: selectedDay === d ? '0 0 12px rgba(220,38,38,0.4)' : 'none',
                }}
              >
                Day {d}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] font-mono text-gray-500">Deployment Progress</span>
            <span className="text-[9px] font-mono text-dojo-gold">{Math.round((selectedDay / 30) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-dojo-carbon overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(selectedDay / 30) * 100}%`,
                background: 'linear-gradient(90deg, #dc2626, #d4a017, #22c55e)',
                boxShadow: '0 0 8px rgba(212,160,23,0.4)',
              }}
            />
          </div>
        </div>

        {/* Current day detail */}
        {current && (
          <div className="bg-dojo-carbon/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-heading text-xl text-white tracking-wider">{current.title}</div>
                <div className="text-[10px] font-mono text-gray-500">Day {selectedDay} of 30</div>
              </div>
              <span
                className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold"
                style={{
                  background: selectedDay >= 14 ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.15)',
                  color: selectedDay >= 14 ? '#22c55e' : '#dc2626',
                  border: `1px solid ${selectedDay >= 14 ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
                }}
              >
                {current.status}
              </span>
            </div>

            <div className="space-y-2">
              {current.events.map((event, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-dojo-dark/50 border border-white/5"
                >
                  <div className="w-5 h-5 rounded-full bg-dojo-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">{event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
