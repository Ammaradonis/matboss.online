import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Before vs After Conversion Funnel ─── */
export function AutomationChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const stages = [
    { label: 'Leads', before: 100, after: 100 },
    { label: 'Booked', before: 68, after: 89 },
    { label: 'Showed Up', before: 42, after: 78 },
    { label: 'Follow-Up', before: 18, after: 72 },
    { label: 'Enrolled', before: 12, after: 52 },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Chart — Conversion Funnel: Before vs After
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Before funnel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-dojo-red" />
              <span className="text-xs font-mono text-dojo-red uppercase tracking-widest">Without MatBoss</span>
            </div>
            <div className="space-y-2">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 text-right">
                    <span className="text-xs font-mono text-gray-500">{s.label}</span>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div
                      className="h-10 rounded-lg transition-all duration-1000 ease-out flex items-center justify-center"
                      style={{
                        width: visible ? `${s.before}%` : '0%',
                        transitionDelay: `${i * 120}ms`,
                        background: `linear-gradient(90deg, rgba(220,38,38,${0.4 - i * 0.06}), rgba(220,38,38,${0.15 - i * 0.02}))`,
                        borderLeft: '3px solid rgba(220,38,38,0.5)',
                      }}
                    >
                      <span className="text-xs font-mono text-white font-bold">{s.before}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="font-heading text-2xl text-dojo-red">12% Conversion</span>
            </div>
          </div>

          {/* After funnel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs font-mono text-green-500 uppercase tracking-widest">With MatBoss</span>
            </div>
            <div className="space-y-2">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 text-right">
                    <span className="text-xs font-mono text-gray-500">{s.label}</span>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div
                      className="h-10 rounded-lg transition-all duration-1000 ease-out flex items-center justify-center"
                      style={{
                        width: visible ? `${s.after}%` : '0%',
                        transitionDelay: `${i * 120 + 600}ms`,
                        background: `linear-gradient(90deg, rgba(34,197,94,${0.4 - i * 0.04}), rgba(34,197,94,${0.15 - i * 0.01}))`,
                        borderLeft: '3px solid rgba(34,197,94,0.5)',
                      }}
                    >
                      <span className="text-xs font-mono text-white font-bold">{s.after}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="font-heading text-2xl text-green-400">52% Conversion</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-dojo-gold/10 border border-dojo-gold/20 text-center">
          <span className="font-heading text-3xl text-dojo-gold">4.3x</span>
          <span className="text-gray-400 text-sm ml-2">more students enrolled from the same leads</span>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: Enrollment Engine Blueprint ─── */
export function AutomationDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-cycle through nodes when visible
  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const iv = setInterval(() => {
      setActiveNode(i % 6);
      i++;
    }, 2000);
    return () => clearInterval(iv);
  }, [visible]);

  const nodes = [
    { label: 'LEAD CAPTURED', sub: 'Form, DM, walk-in', icon: 'L', color: '#d4a017' },
    { label: 'INSTANT CONFIRM', sub: 'SMS + email in <30s', icon: 'C', color: '#f59e0b' },
    { label: 'SMART REMINDERS', sub: '24h → 2h → 30min', icon: 'R', color: '#22c55e' },
    { label: 'NO-SHOW DETECT', sub: 'Auto-flagged at T+15min', icon: 'D', color: '#dc2626' },
    { label: 'RECOVERY FIRE', sub: 'New time options sent', icon: 'F', color: '#dc2626' },
    { label: 'ENROLL SEQUENCE', sub: '7-day nurture drip', icon: 'E', color: '#22c55e' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Diagram — Enrollment Engine Blueprint
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        {/* Node grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nodes.map((n, i) => {
            const isActive = activeNode === i;
            return (
              <div
                key={i}
                className="relative p-4 rounded-xl border transition-all duration-500 cursor-pointer group"
                style={{
                  borderColor: isActive ? `${n.color}60` : 'rgba(255,255,255,0.05)',
                  background: isActive ? `${n.color}10` : 'transparent',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.8)',
                  transitionDelay: `${i * 100}ms`,
                  boxShadow: isActive ? `0 0 20px ${n.color}20` : 'none',
                }}
                onMouseEnter={() => setActiveNode(i)}
              >
                {/* Step badge */}
                <div
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-bold text-white"
                  style={{ background: n.color }}
                >
                  {i + 1}
                </div>

                {/* Pulse ring when active */}
                {isActive && (
                  <div
                    className="absolute -inset-1 rounded-xl animate-pulse pointer-events-none"
                    style={{ border: `1px solid ${n.color}30` }}
                  />
                )}

                <div className="flex items-center gap-3 ml-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: `${n.color}20`,
                      boxShadow: isActive ? `0 0 12px ${n.color}40` : 'none',
                    }}
                  >
                    <span className="font-mono text-sm font-bold" style={{ color: n.color }}>{n.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white uppercase tracking-wider">{n.label}</div>
                    <div className="text-[10px] text-gray-500">{n.sub}</div>
                  </div>
                </div>

                {/* Connection arrow */}
                {i < nodes.length - 1 && i !== 2 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block">
                    <div
                      className="w-2 h-2 border-r-2 border-t-2 rotate-45 transition-colors duration-300"
                      style={{ borderColor: isActive ? n.color : 'rgba(255,255,255,0.1)' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Signal flow indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {nodes.map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: activeNode === i ? n.color : 'rgba(255,255,255,0.1)',
                  boxShadow: activeNode === i ? `0 0 8px ${n.color}60` : 'none',
                }}
              />
              {i < nodes.length - 1 && (
                <div
                  className="w-6 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: activeNode !== null && i < activeNode
                      ? `linear-gradient(90deg, ${nodes[i].color}60, ${nodes[i + 1].color}60)`
                      : 'rgba(255,255,255,0.05)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Live Automation Simulation ─── */
export function AutomationInteractive() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const simulation = [
    { time: 'T+0s', event: 'Sarah fills out trial form on your website', type: 'lead' as const },
    { time: 'T+12s', event: 'MatBoss sends SMS: "Confirmed! Your BJJ trial is Thursday at 6pm"', type: 'auto' as const },
    { time: 'T+24h', event: 'Reminder SMS: "Sarah, your trial at SD BJJ Academy is tomorrow!"', type: 'auto' as const },
    { time: 'T+46h', event: 'Reminder SMS: "See you in 2 hours, Sarah. Bring water & a towel."', type: 'auto' as const },
    { time: 'T+47.5h', event: 'Final nudge: "30 minutes! Coach Mike is excited to meet you."', type: 'auto' as const },
    { time: 'T+48h', event: 'Sarah shows up for trial class', type: 'success' as const },
    { time: 'T+49h', event: 'Post-trial SMS: "Great job today, Sarah! Here\'s how to continue..."', type: 'auto' as const },
    { time: 'T+72h', event: 'Follow-up: enrollment link + limited founding rate offer', type: 'auto' as const },
    { time: 'T+96h', event: 'Sarah enrolls — $150/mo recurring membership locked in', type: 'success' as const },
  ];

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setStep(-1);
    let i = 0;
    const iv = setInterval(() => {
      setStep(i);
      i++;
      if (i >= simulation.length) {
        clearInterval(iv);
        setTimeout(() => setRunning(false), 2000);
      }
    }, 1200);
  };

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Watch The Enrollment Engine In Action
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Launch button */}
        <div className="text-center mb-6">
          <button
            onClick={runSimulation}
            disabled={running}
            className="px-8 py-3 rounded-xl bg-dojo-gold text-dojo-black font-heading text-lg tracking-wider
                       hover:bg-dojo-amber transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: running ? 'none' : '0 0 20px rgba(212,160,23,0.3)' }}
          >
            {running ? 'Simulation Running...' : step >= 0 ? 'Run Again' : 'Launch Simulation'}
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {simulation.map((s, i) => {
            const isReached = i <= step;
            const isCurrent = i === step;
            const typeColors = {
              lead: { bg: 'rgba(212,160,23,0.1)', border: 'rgba(212,160,23,0.3)', dot: '#d4a017' },
              auto: { bg: 'rgba(34,197,94,0.05)', border: 'rgba(34,197,94,0.2)', dot: '#22c55e' },
              success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.4)', dot: '#22c55e' },
            };
            const c = typeColors[s.type];

            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border transition-all duration-500"
                style={{
                  opacity: isReached ? 1 : 0.2,
                  background: isReached ? c.bg : 'transparent',
                  borderColor: isReached ? c.border : 'rgba(255,255,255,0.03)',
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 0 15px ${c.dot}20` : 'none',
                }}
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background: isReached ? c.dot : 'rgba(255,255,255,0.1)',
                      boxShadow: isCurrent ? `0 0 8px ${c.dot}80` : 'none',
                    }}
                  />
                  {i < simulation.length - 1 && (
                    <div className="w-0.5 h-4 rounded-full" style={{ background: isReached ? `${c.dot}40` : 'rgba(255,255,255,0.05)' }} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono text-gray-500">{s.time}</span>
                    {s.type === 'auto' && isReached && (
                      <span className="text-[8px] font-mono text-green-500/60 uppercase">automated</span>
                    )}
                  </div>
                  <p className={`text-sm transition-colors duration-300 ${isReached ? 'text-white' : 'text-gray-600'}`}>
                    {s.event}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {step >= simulation.length - 1 && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in">
            <div className="font-heading text-xl text-green-400 mb-1">Student Enrolled. Zero Manual Work.</div>
            <p className="text-xs text-gray-400">
              Every step was automated. The owner never picked up the phone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
