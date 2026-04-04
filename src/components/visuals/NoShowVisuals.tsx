import { useEffect, useRef, useState } from 'react';

/* ─── CHART: No-Show Destruction Gauge ─── */
export function NoShowChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setPct(37); },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Semi-circle gauge: 180 degrees mapped to arc
  const radius = 90;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (pct / 100) * circumference;

  // Danger zones
  const zones = [
    { label: 'Safe', range: '0-10%', color: '#22c55e' },
    { label: 'Warning', range: '10-20%', color: '#f59e0b' },
    { label: 'Critical', range: '20-30%', color: '#dc2626' },
    { label: 'HEMORRHAGE', range: '30%+', color: '#7f1d1d' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Chart — No-Show Destruction Gauge
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col items-center">
          {/* SVG Gauge */}
          <div className="relative w-64 h-36">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Danger zone colors */}
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="16" strokeLinecap="round"
                strokeDasharray={`${circumference * 0.1} ${circumference * 0.9}`} />
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="16"
                strokeDasharray={`${circumference * 0.2} ${circumference * 0.8}`} strokeDashoffset={`${-circumference * 0.1}`} />
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="16"
                strokeDasharray={`${circumference * 0.1} ${circumference * 0.9}`} strokeDashoffset={`${-circumference * 0.2}`} />
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(127,29,29,0.2)" strokeWidth="16"
                strokeDasharray={`${circumference * 0.7} ${circumference * 0.3}`} strokeDashoffset={`${-circumference * 0.3}`} />
              {/* Active arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="#dc2626"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={offset}
                style={{
                  transition: 'stroke-dashoffset 2s ease-out',
                  filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.6))',
                }}
              />
              {/* Needle */}
              <line
                x1="100" y1="100"
                x2={100 + 70 * Math.cos(Math.PI - (pct / 100) * Math.PI)}
                y2={100 - 70 * Math.sin(Math.PI - (pct / 100) * Math.PI)}
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transition: 'all 2s ease-out' }}
              />
              <circle cx="100" cy="100" r="4" fill="#dc2626" />
            </svg>

            {/* Center value */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <div className="font-heading text-5xl text-dojo-red" style={{ textShadow: '0 0 20px rgba(220,38,38,0.5)' }}>
                {pct}%
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400 mt-4 mb-6 text-center">
            San Diego Average No-Show Rate — <strong className="text-dojo-red">HEMORRHAGE ZONE</strong>
          </div>

          {/* Zone legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            {zones.map((z, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border text-center"
                style={{
                  borderColor: `${z.color}30`,
                  background: i === 3 ? `${z.color}15` : 'transparent',
                }}
              >
                <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: z.color }}>
                  {z.label}
                </div>
                <div className="text-[10px] text-gray-500">{z.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: The 72-Hour Decay Timeline ─── */
export function NoShowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const timeline = [
    { time: '0 min', event: 'Lead books trial', interest: 100, status: 'peak', color: '#22c55e' },
    { time: '23 min', event: 'No confirmation sent', interest: 72, status: 'dropping', color: '#f59e0b' },
    { time: '2 hrs', event: 'Doubt creeps in', interest: 45, status: 'warning', color: '#f59e0b' },
    { time: '12 hrs', event: 'Forgot about it', interest: 25, status: 'critical', color: '#dc2626' },
    { time: '24 hrs', event: 'Trial day — no reminder', interest: 15, status: 'danger', color: '#dc2626' },
    { time: '48 hrs', event: 'Lead is cold', interest: 5, status: 'dead', color: '#991b1b' },
    { time: '72 hrs', event: 'GONE FOREVER', interest: 0, status: 'lost', color: '#7f1d1d' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Diagram — The 72-Hour Interest Decay
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        {/* Decay curve visualization */}
        <div className="relative mb-8">
          <svg viewBox="0 0 700 120" className="w-full h-24 md:h-32">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={110 - y * 1.1} x2="700" y2={110 - y * 1.1}
                stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}
            {/* The decay curve */}
            <path
              d={`M 0,${110 - 100 * 1.1} C 100,${110 - 80 * 1.1} 150,${110 - 45 * 1.1} 233,${110 - 45 * 1.1} S 350,${110 - 15 * 1.1} 466,${110 - 15 * 1.1} S 583,${110 - 5 * 1.1} 700,${110 - 0}`}
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
              strokeDasharray="1200"
              strokeDashoffset={visible ? '0' : '1200'}
              style={{ transition: 'stroke-dashoffset 2.5s ease-out', filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.4))' }}
            />
            {/* Area fill */}
            <path
              d={`M 0,${110 - 100 * 1.1} C 100,${110 - 80 * 1.1} 150,${110 - 45 * 1.1} 233,${110 - 45 * 1.1} S 350,${110 - 15 * 1.1} 466,${110 - 15 * 1.1} S 583,${110 - 5 * 1.1} 700,${110 - 0} L 700,110 L 0,110 Z`}
              fill="url(#decayGrad)"
              opacity={visible ? 0.3 : 0}
              style={{ transition: 'opacity 1.5s ease-out 0.5s' }}
            />
            <defs>
              <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Y-axis label */}
          <div className="absolute top-0 -left-1 text-[8px] font-mono text-gray-600 -rotate-90 origin-bottom-left">
            INTEREST %
          </div>
        </div>

        {/* Timeline steps */}
        <div className="grid grid-cols-7 gap-1">
          {timeline.map((t, i) => (
            <div
              key={i}
              className="text-center transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}40` }} />
              <div className="text-[9px] font-mono text-gray-500">{t.time}</div>
              <div className="text-[8px] text-gray-600 mt-0.5 leading-tight hidden md:block">{t.event}</div>
              <div className="font-heading text-sm mt-1" style={{ color: t.color }}>{t.interest}%</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
          <p className="text-xs text-gray-300">
            Without automated reminders, lead interest <strong className="text-dojo-red">decays to zero in 72 hours</strong>.
            Most San Diego dojos respond in 4-6 hours — already too late.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: No-Show Cost Calculator ─── */
export function NoShowInteractive() {
  const [trials, setTrials] = useState(15);
  const [avgMembership, setAvgMembership] = useState(150);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const noShows = Math.round(trials * 0.37);
  const lostForever = Math.round(noShows * 0.92);
  const monthlyRevenueLost = lostForever * avgMembership;
  const annualRevenueLost = lostForever * avgMembership * 14; // 14 month avg lifetime
  const withMatBoss = Math.round(lostForever * 0.65); // recover 65%
  const recovered = lostForever - withMatBoss;
  const annualRecovered = recovered * avgMembership * 14;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Your No-Show Cost Calculator
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
              Trials booked per month
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={5} max={50} value={trials}
                onChange={(e) => setTrials(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-dojo-red [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(220,38,38,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="font-heading text-2xl text-white w-12 text-center">{trials}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
              Avg monthly membership ($)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={80} max={250} step={10} value={avgMembership}
                onChange={(e) => setAvgMembership(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-dojo-gold [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,160,23,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="font-heading text-2xl text-dojo-gold w-16 text-center">${avgMembership}</span>
            </div>
          </div>
        </div>

        {/* Results: Before vs After */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Without MatBoss */}
          <div className="p-5 rounded-xl bg-dojo-red/5 border border-dojo-red/20">
            <div className="text-xs font-mono text-dojo-red uppercase tracking-widest mb-3">Without MatBoss</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">No-shows per month</span>
                <span className="font-mono text-dojo-red font-bold">{noShows}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Lost forever (92%)</span>
                <span className="font-mono text-dojo-red font-bold">{lostForever}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly revenue lost</span>
                <span className="font-mono text-dojo-red font-bold">${monthlyRevenueLost.toLocaleString()}</span>
              </div>
              <div className="border-t border-dojo-red/20 pt-2 mt-2 flex justify-between">
                <span className="text-white font-semibold text-sm">Annual lifetime value destroyed</span>
                <span className="font-heading text-xl text-dojo-red" style={{ textShadow: '0 0 15px rgba(220,38,38,0.4)' }}>
                  ${annualRevenueLost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* With MatBoss */}
          <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="text-xs font-mono text-green-500 uppercase tracking-widest mb-3">With MatBoss</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">No-shows recovered</span>
                <span className="font-mono text-green-500 font-bold">{recovered}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Still lost</span>
                <span className="font-mono text-gray-500 font-bold">{withMatBoss}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Recovery rate</span>
                <span className="font-mono text-green-500 font-bold">65%</span>
              </div>
              <div className="border-t border-green-500/20 pt-2 mt-2 flex justify-between">
                <span className="text-white font-semibold text-sm">Annual revenue recovered</span>
                <span className="font-heading text-xl text-green-400" style={{ textShadow: '0 0 15px rgba(34,197,94,0.4)' }}>
                  +${annualRecovered.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
