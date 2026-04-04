import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Price Gouging Radar — Cost Per Enrollment Conversion ─── */
export function DirtySecretChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const vendors = [
    { name: 'Marketing Agency', annual: 24000, enrollments: 8, costPer: 3000, color: '#dc2626' },
    { name: 'Custom Build', annual: 10000, enrollments: 5, costPer: 2000, color: '#b91c1c' },
    { name: 'Generic CRM', annual: 7200, enrollments: 6, costPer: 1200, color: '#f59e0b' },
    { name: 'Enterprise SaaS', annual: 5400, enrollments: 7, costPer: 771, color: '#d4a017' },
    { name: 'MatBoss', annual: 2364, enrollments: 36, costPer: 66, color: '#22c55e' },
  ];
  const maxCostPer = 3200;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Chart — Cost Per Recovered Enrollment
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8">
        <div className="space-y-4">
          {vendors.map((v, i) => (
            <div
              key={i}
              className="transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-30px)',
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                  <span className={`text-xs ${v.name === 'MatBoss' ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
                    {v.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-gray-500">${v.annual.toLocaleString()}/yr</span>
                  <span className="text-xs font-mono font-bold" style={{ color: v.color }}>
                    ${v.costPer}/enrollment
                  </span>
                </div>
              </div>
              <div className="h-7 rounded-lg bg-dojo-carbon overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-3"
                  style={{
                    width: visible ? `${Math.max((v.costPer / maxCostPer) * 100, 3)}%` : '0%',
                    transitionDelay: `${i * 120 + 200}ms`,
                    background: `linear-gradient(90deg, ${v.color}50, ${v.color}20)`,
                    borderLeft: `3px solid ${v.color}`,
                  }}
                >
                  {v.name === 'MatBoss' && (
                    <span className="text-[9px] font-mono text-green-400 whitespace-nowrap">45x cheaper</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-sm text-gray-300">
            MatBoss costs <strong className="text-green-400">$66 per recovered enrollment</strong>.
            The industry average is <strong className="text-dojo-red">$1,743</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: What You Actually Get — Feature vs Cost Grid ─── */
export function DirtySecretDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const features = [
    'Trial confirmation SMS',
    'Smart reminder sequence',
    'No-show recovery engine',
    'Post-trial follow-up',
    'Works with existing software',
    'San Diego-specific tuning',
    'Ongoing support & optimization',
  ];

  const vendors = [
    { name: 'Agency\n$1,500+/mo', checks: [true, true, false, true, false, false, true], color: '#dc2626' },
    { name: 'Generic CRM\n$500+/mo', checks: [true, true, false, false, false, false, false], color: '#f59e0b' },
    { name: 'Custom Build\n$5K–$15K', checks: [true, true, true, true, false, false, false], color: '#d4a017' },
    { name: 'MatBoss\n$197/mo', checks: [true, true, true, true, true, true, true], color: '#22c55e' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Diagram — Feature-for-Dollar Comparison
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-4 md:p-6 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-mono text-gray-500 uppercase tracking-widest pb-3 pr-4">
                Feature
              </th>
              {vendors.map((v, i) => (
                <th
                  key={i}
                  className="text-center pb-3 px-2 transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  <span
                    className="text-[9px] font-mono whitespace-pre-line leading-tight"
                    style={{ color: v.color }}
                  >
                    {v.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, fi) => (
              <tr key={fi} className="border-t border-white/5">
                <td className="text-xs text-gray-400 py-2.5 pr-4">{f}</td>
                {vendors.map((v, vi) => (
                  <td
                    key={vi}
                    className="text-center py-2.5 px-2 transition-all duration-500"
                    style={{
                      opacity: visible ? 1 : 0,
                      transitionDelay: `${(fi * vendors.length + vi) * 40}ms`,
                    }}
                  >
                    {v.checks[fi] ? (
                      <svg className="w-4 h-4 mx-auto" style={{ color: v.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Score row */}
            <tr className="border-t-2 border-white/10">
              <td className="text-xs text-white font-semibold py-3 pr-4">Score</td>
              {vendors.map((v, vi) => {
                const score = v.checks.filter(Boolean).length;
                return (
                  <td key={vi} className="text-center py-3 px-2">
                    <span className="font-heading text-lg" style={{ color: v.color }}>
                      {score}/7
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Annual Spend Comparison Calculator ─── */
export function DirtySecretInteractive() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const options = [
    { name: 'Marketing Agency', monthly: 2000, setup: 2000, contract: 6, annual: 26000 },
    { name: 'Generic CRM Retainer', monthly: 650, setup: 2000, contract: 12, annual: 9800 },
    { name: 'Custom Automation Build', monthly: 0, setup: 10000, contract: 0, annual: 10000 },
    { name: 'Enterprise SaaS', monthly: 450, setup: 500, contract: 12, annual: 5900 },
  ];
  const matBossAnnual = 197 * 12 + 119; // $2,483

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Click Any Competitor to Compare Year-1 Cost
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Clickable competitor cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {options.map((o, i) => (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                selected === i
                  ? 'bg-dojo-red/10 border-dojo-red/40'
                  : 'bg-dojo-carbon/50 border-white/5 hover:border-dojo-red/20'
              }`}
            >
              <div className="text-xs text-gray-400 mb-1">{o.name}</div>
              <div className="font-heading text-xl text-dojo-red">${o.annual.toLocaleString()}</div>
              <div className="text-[9px] text-gray-600">year 1 total</div>
            </button>
          ))}
        </div>

        {/* Comparison display */}
        {selected !== null && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-dojo-red/5 border border-dojo-red/20">
              <div className="text-xs font-mono text-dojo-red uppercase tracking-widest mb-3">
                {options[selected].name}
              </div>
              <div className="space-y-2 text-sm">
                {options[selected].monthly > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly fee</span>
                    <span className="font-mono text-white">${options[selected].monthly}/mo</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Setup fee</span>
                  <span className="font-mono text-white">${options[selected].setup.toLocaleString()}</span>
                </div>
                {options[selected].contract > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract lock</span>
                    <span className="font-mono text-dojo-red">{options[selected].contract} months</span>
                  </div>
                )}
                <div className="border-t border-dojo-red/20 pt-2 flex justify-between">
                  <span className="text-white font-semibold">Year-1 cost</span>
                  <span className="font-heading text-xl text-dojo-red">
                    ${options[selected].annual.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="text-xs font-mono text-green-500 uppercase tracking-widest mb-3">
                MatBoss Enrollment Engine
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly fee</span>
                  <span className="font-mono text-white">$197/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Setup fee</span>
                  <span className="font-mono text-white">$119</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract lock</span>
                  <span className="font-mono text-green-400">None — cancel any time</span>
                </div>
                <div className="border-t border-green-500/20 pt-2 flex justify-between">
                  <span className="text-white font-semibold">Year-1 cost</span>
                  <span className="font-heading text-xl text-green-400">
                    ${matBossAnnual.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selected !== null && (
          <div className="p-4 rounded-xl bg-dojo-gold/10 border border-dojo-gold/20 text-center">
            <span className="text-sm text-gray-300">You save </span>
            <span className="font-heading text-2xl text-dojo-gold">
              ${(options[selected].annual - matBossAnnual).toLocaleString()}
            </span>
            <span className="text-sm text-gray-300"> in year one alone — </span>
            <span className="text-sm text-dojo-gold font-bold">
              {((options[selected].annual / matBossAnnual)).toFixed(1)}x less with MatBoss
            </span>
          </div>
        )}

        {selected === null && (
          <div className="text-center text-xs text-gray-500">
            Click any competitor above to see the side-by-side breakdown.
          </div>
        )}
      </div>
    </div>
  );
}
