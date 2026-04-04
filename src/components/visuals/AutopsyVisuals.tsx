import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Organ Failure Severity Map ─── */
export function AutopsyChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const organs = [
    { system: 'Trial Confirmation', status: 'DEAD', severity: 0, bleed: '$960/mo', desc: 'No automated confirmation — leads doubt the booking' },
    { system: 'Reminder Engine', status: 'DEAD', severity: 5, bleed: '$1,440/mo', desc: 'Owner texts manually, misses 60% of bookings' },
    { system: 'No-Show Recovery', status: 'ABSENT', severity: 0, bleed: '$1,800/mo', desc: 'Zero recovery system — ghosted leads vanish' },
    { system: 'Follow-Up Pipeline', status: 'FAILING', severity: 18, bleed: '$2,250/mo', desc: 'Sporadic follow-ups, no sequence, no tracking' },
    { system: 'Data & Tracking', status: 'CRITICAL', severity: 12, bleed: '$390/mo', desc: 'Spreadsheets, sticky notes, memory-based ops' },
  ];

  const totalBleed = 6840;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Chart — Enrollment System Organ Failure Map
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-6 md:p-8">
        <div className="space-y-3">
          {organs.map((o, i) => (
            <div
              key={i}
              className="transition-all duration-600"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-30px)',
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dojo-carbon/50 border border-white/5">
                {/* Status indicator */}
                <div className="flex flex-col items-center w-16 flex-shrink-0">
                  <div
                    className="w-4 h-4 rounded-full mb-1"
                    style={{
                      background: o.severity === 0 ? '#7f1d1d' : o.severity < 15 ? '#dc2626' : '#f59e0b',
                      boxShadow: `0 0 8px ${o.severity === 0 ? 'rgba(127,29,29,0.6)' : 'rgba(220,38,38,0.4)'}`,
                      animation: visible ? 'pulse 2s infinite' : 'none',
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                  <span className="text-[8px] font-mono font-bold" style={{
                    color: o.severity === 0 ? '#7f1d1d' : '#dc2626',
                  }}>{o.status}</span>
                </div>

                {/* System info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-semibold">{o.system}</span>
                    <span className="text-xs font-mono text-dojo-red font-bold">{o.bleed}</span>
                  </div>
                  {/* Health bar */}
                  <div className="h-2 rounded-full bg-dojo-carbon overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: visible ? `${o.severity}%` : '0%',
                        transitionDelay: `${i * 120 + 300}ms`,
                        background: o.severity === 0
                          ? 'linear-gradient(90deg, #7f1d1d, #991b1b)'
                          : o.severity < 15
                            ? 'linear-gradient(90deg, #dc2626, #b91c1c)'
                            : 'linear-gradient(90deg, #f59e0b, #d4a017)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{o.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total damage */}
        <div className="mt-6 p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/30 text-center">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
            Combined Monthly Hemorrhage
          </div>
          <div className="font-heading text-4xl text-dojo-red" style={{ textShadow: '0 0 20px rgba(220,38,38,0.4)' }}>
            ${totalBleed.toLocaleString()}/mo
          </div>
          <div className="text-xs text-gray-500 mt-1">
            All 5 systems critical or dead. Prognosis: <span className="text-dojo-red font-bold">terminal without intervention</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: Forensic Evidence Chain ─── */
export function AutopsyDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const evidence = [
    { id: 'EV-001', time: 'Monday 9:14 AM', event: 'Lead fills trial form', outcome: 'Data captured', tag: 'ORIGIN', color: '#d4a017' },
    { id: 'EV-002', time: 'Monday 3:47 PM', event: 'Owner sees notification (6h later)', outcome: 'Lead interest already at 40%', tag: 'DELAY', color: '#f59e0b' },
    { id: 'EV-003', time: 'Monday 6:00 PM', event: 'Owner texts from personal phone', outcome: 'No tracking, no template', tag: 'MANUAL', color: '#dc2626' },
    { id: 'EV-004', time: 'Wednesday 6:00 PM', event: 'Trial day — no reminder sent', outcome: 'Lead forgot, does not show', tag: 'FAILURE', color: '#dc2626' },
    { id: 'EV-005', time: 'Thursday', event: 'Owner too busy teaching to follow up', outcome: 'No recovery attempt', tag: 'NEGLECT', color: '#b91c1c' },
    { id: 'EV-006', time: 'Never', event: 'Lead joins competitor down the street', outcome: '$2,100 lifetime value — gone', tag: 'DEATH', color: '#7f1d1d' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Diagram — Forensic Evidence Chain: Death of a Student
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="relative">
          {/* Vertical evidence line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-dojo-gold/40 via-dojo-red/40 to-dojo-red/10" />

          <div className="space-y-4">
            {evidence.map((e, i) => (
              <div
                key={i}
                className="relative pl-14 transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                {/* Evidence marker */}
                <div
                  className="absolute left-2 w-7 h-7 rounded-full flex items-center justify-center border-2"
                  style={{
                    borderColor: e.color,
                    background: `${e.color}20`,
                    boxShadow: `0 0 8px ${e.color}30`,
                  }}
                >
                  <span className="text-[8px] font-mono font-bold" style={{ color: e.color }}>{i + 1}</span>
                </div>

                <div className="p-3 rounded-lg bg-dojo-carbon/40 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-gray-600">{e.id}</span>
                      <span className="text-[9px] font-mono text-gray-500">{e.time}</span>
                    </div>
                    <span
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ color: e.color, background: `${e.color}15`, border: `1px solid ${e.color}30` }}
                    >
                      {e.tag}
                    </span>
                  </div>
                  <div className="text-sm text-white mb-0.5">{e.event}</div>
                  <div className="text-[10px] text-gray-500">{e.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-3 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
          <p className="text-xs text-gray-300">
            <strong className="text-dojo-red">Time of death: 72 hours post-inquiry.</strong>{' '}
            Cause: systemic failure at every touchpoint. This story repeats 3-5 times per month at every unautomated San Diego dojo.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Your Academy's Personalized Autopsy Report ─── */
export function AutopsyInteractive() {
  const [students, setStudents] = useState(120);
  const [trialsMonth, setTrialsMonth] = useState(18);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const noShows = Math.round(trialsMonth * 0.37);
  const missedFollowUps = Math.round(trialsMonth * 0.6 * 0.55);
  const coldLeads = Math.round(trialsMonth * 0.42);
  const adminHoursWeek = Math.round(trialsMonth * 0.35 * 10) / 10;
  const monthlyBleed = noShows * 150 + missedFollowUps * 150 + coldLeads * 50;
  const annualBleed = monthlyBleed * 12;
  const severityPct = Math.min(Math.round((monthlyBleed / (students * 150)) * 100), 99);

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Generate Your Academy's Autopsy Report
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
              Current active students
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={40} max={250} value={students}
                onChange={(e) => setStudents(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-dojo-gold [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,160,23,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="font-heading text-2xl text-white w-14 text-center">{students}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
              Trial bookings per month
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={5} max={50} value={trialsMonth}
                onChange={(e) => setTrialsMonth(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-dojo-red [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(220,38,38,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="font-heading text-2xl text-white w-12 text-center">{trialsMonth}</span>
            </div>
          </div>
        </div>

        {/* Autopsy report card */}
        <div className="bg-dojo-carbon/50 border border-dojo-red/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-dojo-red animate-pulse" />
            <span className="text-xs font-mono text-dojo-red uppercase tracking-widest">
              Post-Mortem Report — Your Academy
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-dojo-red/5 border border-dojo-red/10 text-center">
              <div className="text-[9px] font-mono text-gray-500 uppercase mb-1">No-Shows/Mo</div>
              <div className="font-heading text-2xl text-dojo-red">{noShows}</div>
            </div>
            <div className="p-3 rounded-lg bg-dojo-red/5 border border-dojo-red/10 text-center">
              <div className="text-[9px] font-mono text-gray-500 uppercase mb-1">Missed Follow-Ups</div>
              <div className="font-heading text-2xl text-dojo-red">{missedFollowUps}</div>
            </div>
            <div className="p-3 rounded-lg bg-dojo-red/5 border border-dojo-red/10 text-center">
              <div className="text-[9px] font-mono text-gray-500 uppercase mb-1">Cold Leads</div>
              <div className="font-heading text-2xl text-dojo-red">{coldLeads}</div>
            </div>
            <div className="p-3 rounded-lg bg-dojo-gold/5 border border-dojo-gold/10 text-center">
              <div className="text-[9px] font-mono text-gray-500 uppercase mb-1">Admin Hrs/Wk</div>
              <div className="font-heading text-2xl text-dojo-gold">{adminHoursWeek}</div>
            </div>
          </div>

          {/* Severity gauge */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-mono text-gray-500">Revenue Bleed Severity</span>
              <span className="text-[9px] font-mono text-dojo-red">{severityPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-dojo-carbon overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${severityPct}%`,
                  background: severityPct > 50
                    ? 'linear-gradient(90deg, #dc2626, #7f1d1d)'
                    : 'linear-gradient(90deg, #f59e0b, #dc2626)',
                  boxShadow: '0 0 8px rgba(220,38,38,0.4)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-dojo-red/10 border border-dojo-red/20 text-center">
              <div className="text-[9px] font-mono text-gray-500 uppercase mb-1">Monthly Bleed</div>
              <div className="font-heading text-2xl text-dojo-red">${monthlyBleed.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-dojo-red/10 border border-dojo-red/30 text-center">
              <div className="text-[9px] font-mono text-gray-500 uppercase mb-1">Annual Damage</div>
              <div className="font-heading text-2xl text-dojo-red" style={{ textShadow: '0 0 12px rgba(220,38,38,0.4)' }}>
                ${annualBleed.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] font-mono text-gray-500">
              Prognosis: <span className="text-dojo-red font-bold">PREVENTABLE</span> — deploy MatBoss to stop the bleeding.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
