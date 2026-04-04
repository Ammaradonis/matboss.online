import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Payback Velocity Clock ─── */
export function BombshellChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [dayCount, setDayCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !visible) {
          setVisible(true);
          let d = 0;
          const target = 6;
          const iv = setInterval(() => {
            d++;
            setDayCount(d);
            if (d >= target) clearInterval(iv);
          }, 300);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  const milestones = [
    { day: 1, event: 'First automated reminder sent', revenue: '$0' },
    { day: 3, event: 'First no-show recovery triggered', revenue: '$0' },
    { day: 6, event: '1 student recovered — MatBoss paid for itself', revenue: '$197+' },
    { day: 14, event: '2-3 students recovered', revenue: '$450+' },
    { day: 21, event: 'Follow-up pipeline at capacity', revenue: '$750+' },
    { day: 30, event: 'Full month of automated enrollment', revenue: '$1,200+' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Chart — Payback Velocity: Days Until MatBoss Pays For Itself
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-6 md:p-8">
        {/* Big day counter */}
        <div className="text-center mb-8">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Time to Full Payback
          </div>
          <div className="relative inline-block">
            <div
              className="font-heading text-8xl md:text-9xl text-dojo-red transition-all duration-300"
              style={{ textShadow: `0 0 ${30 + dayCount * 5}px rgba(220,38,38,0.5)` }}
            >
              {dayCount}
            </div>
            <div className="text-lg font-heading text-gray-400 -mt-2">DAYS</div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            One recovered student at $150+/mo pays back the entire $197 monthly fee.
          </p>
        </div>

        {/* Milestone timeline */}
        <div className="space-y-2">
          {milestones.map((m, i) => {
            const isReached = dayCount >= m.day || (visible && i <= 2);
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg transition-all duration-500"
                style={{
                  background: isReached ? 'rgba(220,38,38,0.05)' : 'transparent',
                  borderLeft: isReached ? '3px solid #dc2626' : '3px solid rgba(255,255,255,0.05)',
                  opacity: visible ? 1 : 0.3,
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="w-12 text-center flex-shrink-0">
                  <span className={`font-heading text-lg ${isReached ? 'text-dojo-red' : 'text-gray-600'}`}>
                    D{m.day}
                  </span>
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${isReached ? 'text-white' : 'text-gray-600'}`}>
                    {m.event}
                  </span>
                </div>
                <div className="w-20 text-right">
                  <span className={`text-xs font-mono font-bold ${
                    m.revenue === '$0' ? 'text-gray-600' : 'text-green-400'
                  }`}>{m.revenue}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: Dollar-for-Dollar Value Map ─── */
export function BombshellDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const allocations = [
    { label: 'Trial Confirmation Engine', dollars: 28, pct: '14%', returns: 'Converts 15% more bookings to show-ups', color: '#d4a017' },
    { label: 'Smart Reminder Sequence', dollars: 42, pct: '21%', returns: 'Eliminates 65% of no-shows', color: '#f59e0b' },
    { label: 'No-Show Recovery System', dollars: 52, pct: '27%', returns: 'Recovers 3-5 students/month', color: '#dc2626' },
    { label: 'Post-Trial Enrollment Drip', dollars: 45, pct: '23%', returns: 'Doubles trial-to-member rate', color: '#22c55e' },
    { label: 'Ongoing Optimization + Support', dollars: 30, pct: '15%', returns: 'Continuous pipeline improvement', color: '#9333ea' },
  ];

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Diagram — Where Every Dollar of Your $197 Goes
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        {/* Stacked bar showing allocation */}
        <div className="h-8 rounded-full overflow-hidden flex mb-6">
          {allocations.map((a, i) => (
            <div
              key={i}
              className="h-full transition-all duration-1000 ease-out relative group"
              style={{
                width: visible ? a.pct : '0%',
                background: a.color,
                transitionDelay: `${i * 150}ms`,
                opacity: 0.7,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-mono text-white font-bold hidden md:block">${a.dollars}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail cards */}
        <div className="space-y-3">
          {allocations.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg bg-dojo-carbon/40 border border-white/5 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center gap-2 w-40 flex-shrink-0">
                <div className="w-3 h-3 rounded-full" style={{ background: a.color }} />
                <span className="text-xs text-gray-400">{a.label}</span>
              </div>
              <div className="w-16 text-center flex-shrink-0">
                <span className="font-heading text-lg" style={{ color: a.color }}>${a.dollars}</span>
              </div>
              <div className="flex-1 hidden md:block">
                <span className="text-[10px] text-gray-500">{a.returns}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-dojo-gold/10 border border-dojo-gold/20 text-center">
          <p className="text-sm text-gray-300">
            $197 buys a <strong className="text-dojo-gold">5-system enrollment engine</strong>.
            Not a single feature. Not a chatbot. The full pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Break-Even Countdown ─── */
export function BombshellInteractive() {
  const [membershipPrice, setMembershipPrice] = useState(150);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const matBossCost = 197;
  const studentsToBreakEven = Math.ceil(matBossCost / membershipPrice);
  // Average 3 students recovered per month = ~1 per 10 days
  const daysToBreakEven = Math.ceil(studentsToBreakEven * 10);
  const monthlyROI = (3 * membershipPrice) - matBossCost;
  const annualROI = monthlyROI * 12;
  const roiPct = Math.round((annualROI / (matBossCost * 12)) * 100);

  return (
    <div ref={ref} className="mt-12">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Your Personal Break-Even Countdown
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Input */}
        <div className="mb-8">
          <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Your average monthly membership price
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range" min={80} max={300} step={5} value={membershipPrice}
              onChange={(e) => setMembershipPrice(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-dojo-gold [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,160,23,0.6)]
                         [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="font-heading text-3xl text-dojo-gold w-20 text-center">${membershipPrice}</span>
          </div>
        </div>

        {/* Big break-even display */}
        <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-br from-dojo-red/10 to-dojo-gold/5 border border-dojo-red/20">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Students to Break Even</div>
              <div className="font-heading text-6xl text-dojo-red" style={{ textShadow: '0 0 20px rgba(220,38,38,0.4)' }}>
                {studentsToBreakEven}
              </div>
              <div className="text-xs text-gray-500 mt-1">recovered student{studentsToBreakEven > 1 ? 's' : ''}</div>
            </div>
            <div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Days to Payback</div>
              <div className="font-heading text-6xl text-dojo-gold" style={{ textShadow: '0 0 20px rgba(212,160,23,0.4)' }}>
                {daysToBreakEven}
              </div>
              <div className="text-xs text-gray-500 mt-1">calendar days</div>
            </div>
          </div>
        </div>

        {/* Monthly & annual projection */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">MatBoss Cost</div>
            <div className="font-heading text-xl text-white">$197</div>
            <div className="text-[8px] text-gray-600">/month</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Monthly Net Gain</div>
            <div className="font-heading text-xl text-green-400">+${monthlyROI}</div>
            <div className="text-[8px] text-gray-600">after 3 recoveries</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-[9px] font-mono text-green-500 uppercase tracking-widest mb-1">Annual ROI</div>
            <div className="font-heading text-xl text-green-400">{roiPct}%</div>
            <div className="text-[8px] text-gray-600">+${annualROI.toLocaleString()}/yr</div>
          </div>
        </div>
      </div>
    </div>
  );
}
