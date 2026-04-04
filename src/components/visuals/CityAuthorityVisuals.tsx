import { useEffect, useRef, useState } from 'react';

/* ─── CHART: San Diego Competitive Analysis ─── */
export function CityChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const schools = [
    { name: 'School A — automated', students: 210, growth: '+38%', automated: true },
    { name: 'School B — automated', students: 185, growth: '+29%', automated: true },
    { name: 'School C — manual', students: 118, growth: '+2%', automated: false },
    { name: 'School D — manual', students: 112, growth: '-4%', automated: false },
    { name: 'School E — manual', students: 95, growth: '-8%', automated: false },
    { name: 'School F — manual', students: 87, growth: '-12%', automated: false },
  ];
  const maxStudents = 250;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Chart — San Diego School Performance: Automated vs Manual
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-6 md:p-8">
        <div className="space-y-4">
          {schools.map((s, i) => (
            <div
              key={i}
              className="transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-30px)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.automated ? 'bg-green-500' : 'bg-dojo-red'}`} />
                  <span className={`text-xs ${s.automated ? 'text-green-400' : 'text-gray-400'}`}>{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold ${
                    s.growth.startsWith('+') ? 'text-green-400' : 'text-dojo-red'
                  }`}>{s.growth}</span>
                  <span className="text-xs font-mono text-white">{s.students} students</span>
                </div>
              </div>
              <div className="h-6 rounded-lg bg-dojo-carbon overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-1200 ease-out"
                  style={{
                    width: visible ? `${(s.students / maxStudents) * 100}%` : '0%',
                    transitionDelay: `${i * 100 + 200}ms`,
                    background: s.automated
                      ? 'linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.2))'
                      : 'linear-gradient(90deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))',
                    borderLeft: `3px solid ${s.automated ? '#22c55e' : '#dc2626'}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* The 120 plateau line */}
        <div className="relative mt-6 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px border-t-2 border-dashed border-dojo-gold/40" />
            <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest whitespace-nowrap">
              120 Student Plateau Line
            </span>
            <div className="flex-1 h-px border-t-2 border-dashed border-dojo-gold/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Automated Schools</div>
            <div className="font-heading text-2xl text-green-400">197 avg</div>
            <div className="text-[9px] text-green-500/60">students — above the plateau</div>
          </div>
          <div className="p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Manual Schools</div>
            <div className="font-heading text-2xl text-dojo-red">103 avg</div>
            <div className="text-[9px] text-dojo-red/60">students — stuck below the plateau</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: San Diego Market Penetration Heatmap ─── */
export function CityDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const neighborhoods = [
    { name: 'Pacific Beach', schools: 8, automated: 1, potential: '$72K' },
    { name: 'Mission Valley', schools: 6, automated: 0, potential: '$54K' },
    { name: 'Chula Vista', schools: 12, automated: 2, potential: '$108K' },
    { name: 'La Jolla', schools: 5, automated: 1, potential: '$45K' },
    { name: 'North Park', schools: 7, automated: 0, potential: '$63K' },
    { name: 'Kearny Mesa', schools: 9, automated: 0, potential: '$81K' },
    { name: 'El Cajon', schools: 11, automated: 1, potential: '$99K' },
    { name: 'Oceanside', schools: 10, automated: 0, potential: '$90K' },
    { name: 'Encinitas', schools: 6, automated: 0, potential: '$54K' },
    { name: 'Downtown SD', schools: 4, automated: 1, potential: '$36K' },
    { name: 'Escondido', schools: 8, automated: 0, potential: '$72K' },
    { name: 'Santee', schools: 5, automated: 0, potential: '$45K' },
  ];

  const totalSchools = neighborhoods.reduce((s, n) => s + n.schools, 0);
  const totalAutomated = neighborhoods.reduce((s, n) => s + n.automated, 0);

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Diagram — San Diego Market Opportunity Heatmap
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        {/* Grid of neighborhoods */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {neighborhoods.map((n, i) => {
            const saturation = n.automated / n.schools;
            const heatColor = saturation > 0.1
              ? 'rgba(34,197,94,0.15)'
              : 'rgba(220,38,38,0.1)';

            return (
              <div
                key={i}
                className="p-3 rounded-xl border transition-all duration-500 hover:scale-105 cursor-default"
                style={{
                  borderColor: saturation > 0.1 ? 'rgba(34,197,94,0.2)' : 'rgba(220,38,38,0.15)',
                  background: heatColor,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div className="text-xs font-semibold text-white mb-1">{n.name}</div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: n.schools }).map((_, j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: j < n.automated ? '#22c55e' : 'rgba(220,38,38,0.4)',
                        boxShadow: j < n.automated ? '0 0 4px rgba(34,197,94,0.5)' : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-500">{n.schools} dojos</span>
                  <span className="text-[9px] font-mono text-dojo-gold">{n.potential}/yr recoverable</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Total SD Dojos</div>
            <div className="font-heading text-3xl text-white">{totalSchools}</div>
          </div>
          <div className="p-3 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Without Automation</div>
            <div className="font-heading text-3xl text-dojo-red">{totalSchools - totalAutomated}</div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">MatBoss Deployed</div>
            <div className="font-heading text-3xl text-green-400">{totalAutomated}</div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Each dot = one martial arts school. <span className="text-green-400">Green</span> = automated.{' '}
          <span className="text-dojo-red">Red</span> = bleeding students.
        </p>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Growth Projection Simulator ─── */
export function CityInteractive() {
  const [currentStudents, setCurrentStudents] = useState(100);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Project 12 months: without MatBoss (flat/slight decline) vs with MatBoss (growth)
  const months = Array.from({ length: 13 }, (_, i) => i);
  const withoutMB = months.map((m) => Math.max(currentStudents + Math.round(m * -0.8 + Math.random() * 2 - 1), currentStudents - 15));
  const withMB = months.map((m) => currentStudents + Math.round(m * 4.2));

  const maxStudents = Math.max(...withMB) + 20;
  const chartHeight = 200;

  // Path for SVG
  const toPath = (data: number[]) => {
    const points = data.map((v, i) => {
      const x = (i / 12) * 680 + 10;
      const y = chartHeight - ((v / maxStudents) * (chartHeight - 20)) - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const withoutPath = toPath(withoutMB);
  const withPath = toPath(withMB);

  // Area fill path
  const toAreaPath = (data: number[]) => {
    const points = data.map((v, i) => {
      const x = (i / 12) * 680 + 10;
      const y = chartHeight - ((v / maxStudents) * (chartHeight - 20)) - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')} L 690,${chartHeight} L 10,${chartHeight} Z`;
  };

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — 12-Month Growth Projection
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Slider */}
        <div className="mb-6">
          <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Your current active students
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range" min={40} max={200} value={currentStudents}
              onChange={(e) => setCurrentStudents(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-dojo-gold [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,160,23,0.6)]
                         [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="font-heading text-3xl text-white w-16 text-center">{currentStudents}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative bg-dojo-carbon/50 rounded-xl p-4 border border-white/5">
          <svg viewBox={`0 0 700 ${chartHeight}`} className="w-full" style={{ height: '200px' }}>
            <defs>
              <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="declineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="10" y1={chartHeight * (i / 4)} x2="690" y2={chartHeight * (i / 4)}
                stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}

            {/* Month labels */}
            {months.filter((m) => m % 3 === 0).map((m) => (
              <text key={m} x={(m / 12) * 680 + 10} y={chartHeight - 2}
                className="text-[8px] fill-gray-600 font-mono" textAnchor="middle">
                M{m}
              </text>
            ))}

            {/* Area fills */}
            <path d={toAreaPath(withMB)} fill="url(#growthFill)"
              opacity={visible ? 1 : 0} style={{ transition: 'opacity 1s ease-out 0.5s' }} />
            <path d={toAreaPath(withoutMB)} fill="url(#declineFill)"
              opacity={visible ? 1 : 0} style={{ transition: 'opacity 1s ease-out 0.5s' }} />

            {/* Lines */}
            <path d={withoutPath} fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 4"
              opacity={visible ? 0.7 : 0} style={{ transition: 'opacity 1s ease-out' }} />
            <path d={withPath} fill="none" stroke="#22c55e" strokeWidth="3"
              strokeDasharray="1200" strokeDashoffset={visible ? '0' : '1200'}
              style={{ transition: 'stroke-dashoffset 2s ease-out', filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.4))' }} />

            {/* End points */}
            <circle cx="690" cy={chartHeight - ((withMB[12] / maxStudents) * (chartHeight - 20)) - 10}
              r="5" fill="#22c55e" opacity={visible ? 1 : 0}
              style={{ transition: 'opacity 0.5s ease-out 2s', filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }} />
            <circle cx="690" cy={chartHeight - ((withoutMB[12] / maxStudents) * (chartHeight - 20)) - 10}
              r="4" fill="#dc2626" opacity={visible ? 0.7 : 0}
              style={{ transition: 'opacity 0.5s ease-out 1.5s' }} />
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500 rounded-full" />
              <span className="text-[10px] text-gray-400">With MatBoss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-dojo-red rounded-full" style={{ borderTop: '1px dashed #dc2626' }} />
              <span className="text-[10px] text-gray-400">Without MatBoss</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-3 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Today</div>
            <div className="font-heading text-2xl text-white">{currentStudents}</div>
            <div className="text-[8px] text-gray-600">students</div>
          </div>
          <div className="p-3 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">12 Mo (Manual)</div>
            <div className="font-heading text-2xl text-dojo-red">{withoutMB[12]}</div>
            <div className="text-[8px] text-gray-600">stagnant or declining</div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">12 Mo (MatBoss)</div>
            <div className="font-heading text-2xl text-green-400">{withMB[12]}</div>
            <div className="text-[8px] text-green-500/60">+{withMB[12] - currentStudents} students gained</div>
          </div>
        </div>
      </div>
    </div>
  );
}
