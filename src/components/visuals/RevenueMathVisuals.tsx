import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Revenue Waterfall — Where The Money Bleeds Out ─── */
export function RevenueChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Waterfall: starts at potential, subtracts at each leak
  const bars = [
    { label: 'Monthly Lead Value', value: 30000, running: 30000, type: 'total' as const },
    { label: 'Never Book a Trial', value: -9600, running: 20400, type: 'loss' as const },
    { label: 'No-Show (No Recovery)', value: -7560, running: 12840, type: 'loss' as const },
    { label: 'No Follow-Up After Trial', value: -5400, running: 7440, type: 'loss' as const },
    { label: 'Enrollment Fumble', value: -3840, running: 3600, type: 'loss' as const },
    { label: 'Actually Collected', value: 3600, running: 3600, type: 'result' as const },
  ];

  const maxVal = 30000;

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Chart — Revenue Waterfall: Where Your Money Bleeds Out
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-6 md:p-8">
        <div className="space-y-4">
          {bars.map((b, i) => {
            const barWidth = (Math.abs(b.type === 'loss' ? b.value : b.running) / maxVal) * 100;
            const offset = b.type === 'loss' ? (b.running / maxVal) * 100 : 0;
            const isLoss = b.type === 'loss';
            const isResult = b.type === 'result';

            return (
              <div
                key={i}
                className="transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${isResult ? 'text-green-400' : isLoss ? 'text-gray-400' : 'text-white'}`}>
                    {b.label}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    isResult ? 'text-green-400' : isLoss ? 'text-dojo-red' : 'text-dojo-gold'
                  }`}>
                    {isLoss ? '-' : ''}${Math.abs(b.value).toLocaleString()}
                  </span>
                </div>
                <div className="h-8 rounded-lg bg-dojo-carbon relative overflow-hidden">
                  {/* Running total background */}
                  {isLoss && (
                    <div
                      className="absolute top-0 left-0 h-full rounded-lg bg-white/[0.02]"
                      style={{ width: `${((b.running + Math.abs(b.value)) / maxVal) * 100}%` }}
                    />
                  )}
                  {/* Bar */}
                  <div
                    className="absolute top-0 h-full rounded-lg transition-all duration-1000 ease-out"
                    style={{
                      left: `${offset}%`,
                      width: visible ? `${barWidth}%` : '0%',
                      transitionDelay: `${i * 150 + 200}ms`,
                      background: isResult
                        ? 'linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.2))'
                        : isLoss
                          ? 'linear-gradient(90deg, rgba(220,38,38,0.5), rgba(220,38,38,0.2))'
                          : 'linear-gradient(90deg, rgba(212,160,23,0.5), rgba(212,160,23,0.2))',
                      borderLeft: `3px solid ${isResult ? '#22c55e' : isLoss ? '#dc2626' : '#d4a017'}`,
                    }}
                  />
                  {/* Drip effect for losses */}
                  {isLoss && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {[0, 1].map((d) => (
                        <div key={d} className="w-1 h-4 rounded-full bg-dojo-red/30 animate-pulse" style={{ animationDelay: `${d * 400}ms` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom verdict */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Total Revenue Lost</div>
            <div className="font-heading text-3xl text-dojo-red" style={{ textShadow: '0 0 15px rgba(220,38,38,0.4)' }}>
              $26,400
            </div>
            <div className="text-[9px] text-gray-600">per month in potential value</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Actually Collected</div>
            <div className="font-heading text-3xl text-green-400">$3,600</div>
            <div className="text-[9px] text-gray-600">12% of what walked in</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: The Leaky Pipeline ─── */
export function RevenueDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const pipes = [
    { label: 'LEADS IN', width: 100, leak: 32, leakLabel: '32% never book', amount: '$30,000' },
    { label: 'TRIALS BOOKED', width: 68, leak: 37, leakLabel: '37% no-show', amount: '$20,400' },
    { label: 'SHOWED UP', width: 43, leak: 42, leakLabel: '42% no follow-up', amount: '$12,840' },
    { label: 'FOLLOW-UP SENT', width: 25, leak: 52, leakLabel: '52% drop off', amount: '$7,440' },
    { label: 'ENROLLED', width: 12, leak: 0, leakLabel: '', amount: '$3,600' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Diagram — The Leaky Revenue Pipeline
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-1">
          {pipes.map((p, i) => (
            <div key={i} className="relative">
              {/* Pipe segment */}
              <div className="flex items-center gap-3">
                <div className="w-20 text-right">
                  <span className="text-[9px] font-mono text-gray-500">{p.amount}</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <div
                    className="h-12 rounded-lg relative overflow-hidden transition-all duration-1000 ease-out"
                    style={{
                      width: visible ? `${p.width}%` : '0%',
                      transitionDelay: `${i * 200}ms`,
                      background: `linear-gradient(180deg, rgba(${i === pipes.length - 1 ? '34,197,94' : '212,160,23'},0.2) 0%, rgba(${i === pipes.length - 1 ? '34,197,94' : '212,160,23'},0.05) 100%)`,
                      borderLeft: `2px solid rgba(${i === pipes.length - 1 ? '34,197,94' : '212,160,23'},0.4)`,
                      borderRight: `2px solid rgba(${i === pipes.length - 1 ? '34,197,94' : '212,160,23'},0.4)`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-white uppercase tracking-widest">{p.label}</span>
                    </div>
                    {/* Animated flow inside pipe */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)',
                        animation: visible ? 'pipeFlow 1.5s linear infinite' : 'none',
                      }}
                    />
                  </div>
                </div>
                <div className="w-28">
                  {p.leak > 0 && (
                    <span
                      className="text-[9px] font-mono text-dojo-red transition-all duration-500"
                      style={{
                        opacity: visible ? 1 : 0,
                        transitionDelay: `${i * 200 + 400}ms`,
                      }}
                    >
                      {p.leakLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Leak drips between pipes */}
              {p.leak > 0 && (
                <div
                  className="flex justify-end pr-[15%] gap-2 h-4 items-center transition-all duration-500"
                  style={{ opacity: visible ? 1 : 0, transitionDelay: `${i * 200 + 300}ms` }}
                >
                  {Array.from({ length: Math.min(Math.floor(p.leak / 10), 4) }).map((_, d) => (
                    <div
                      key={d}
                      className="w-0.5 h-3 rounded-full bg-dojo-red/40 animate-pulse"
                      style={{ animationDelay: `${d * 200}ms` }}
                    />
                  ))}
                  <span className="text-[8px] font-mono text-dojo-red/50 ml-1">-{p.leak}%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
          <p className="text-sm text-gray-300">
            Your pipeline has <strong className="text-dojo-red font-heading">4 active leaks</strong>.
            MatBoss seals every one.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Revenue Recovery Calculator ─── */
export function RevenueInteractive() {
  const [membershipPrice, setMembershipPrice] = useState(150);
  const [trialsPerMonth, setTrialsPerMonth] = useState(20);
  const [animatedRecovery, setAnimatedRecovery] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const lifetimeMonths = 14;
  const ltv = membershipPrice * lifetimeMonths;
  const noShows = Math.round(trialsPerMonth * 0.37);
  const lostForever = Math.round(noShows * 0.92);
  const currentAnnualLoss = lostForever * ltv;
  const recoveredStudents = Math.round(lostForever * 0.65);
  const annualRecovery = recoveredStudents * ltv;
  const matBossCost = 197 * 12;
  const netROI = annualRecovery - matBossCost;
  const roiMultiple = Math.round(annualRecovery / matBossCost);

  // Animate the recovery number
  useEffect(() => {
    if (!visible) return;
    const target = annualRecovery;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const iv = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedRecovery(target);
        clearInterval(iv);
      } else {
        setAnimatedRecovery(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(iv);
  }, [visible, annualRecovery]);

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Revenue Recovery Projector
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
              Monthly membership price
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={80} max={300} step={10} value={membershipPrice}
                onChange={(e) => setMembershipPrice(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-dojo-gold [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,160,23,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="font-heading text-2xl text-dojo-gold w-16 text-center">${membershipPrice}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
              Trials booked per month
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={5} max={50} value={trialsPerMonth}
                onChange={(e) => setTrialsPerMonth(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-dojo-red [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(220,38,38,0.6)]
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="font-heading text-2xl text-white w-12 text-center">{trialsPerMonth}</span>
            </div>
          </div>
        </div>

        {/* Big recovery number */}
        <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-dojo-gold/5 border border-green-500/20">
          <div className="text-xs font-mono text-green-500 uppercase tracking-widest mb-2">
            Annual Revenue MatBoss Recovers For Your Dojo
          </div>
          <div
            className="font-heading text-6xl md:text-7xl text-green-400"
            style={{ textShadow: '0 0 30px rgba(34,197,94,0.4)' }}
          >
            ${animatedRecovery.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            from {recoveredStudents} students/month recovered x ${ltv.toLocaleString()} lifetime value
          </div>
        </div>

        {/* ROI breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Currently Losing</div>
            <div className="font-heading text-xl text-dojo-red">${currentAnnualLoss.toLocaleString()}</div>
            <div className="text-[8px] text-gray-600">/year</div>
          </div>
          <div className="p-3 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">MatBoss Cost</div>
            <div className="font-heading text-xl text-dojo-gold">${matBossCost.toLocaleString()}</div>
            <div className="text-[8px] text-gray-600">/year</div>
          </div>
          <div className="p-3 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Net ROI</div>
            <div className="font-heading text-xl text-green-400">+${netROI.toLocaleString()}</div>
            <div className="text-[8px] text-gray-600">/year profit</div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-[9px] font-mono text-green-500 uppercase tracking-widest mb-1">ROI Multiple</div>
            <div className="font-heading text-xl text-green-400">{roiMultiple}x</div>
            <div className="text-[8px] text-gray-600">return</div>
          </div>
        </div>
      </div>
    </div>
  );
}
