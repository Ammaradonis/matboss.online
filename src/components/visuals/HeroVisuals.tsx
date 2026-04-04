import { useEffect, useRef, useState } from 'react';

/* ─── CHART: Real-Time Student Hemorrhage Counter ─── */
export function HeroChart() {
  const [lost, setLost] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          // Simulate students being lost every ~3s across SD dojos
          const iv = setInterval(() => setLost((p) => p + 1), 2800);
          return () => clearInterval(iv);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-14 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Live Simulation — San Diego Dojos
        </span>
      </div>
      <div className="relative bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-8 overflow-hidden">
        {/* Pulsing glow behind the number */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-64 h-64 rounded-full blur-[80px]"
            style={{
              background: `radial-gradient(circle, rgba(220,38,38,${Math.min(0.15 + lost * 0.005, 0.4)}) 0%, transparent 70%)`,
              transition: 'background 0.5s',
            }}
          />
        </div>

        <div className="relative grid md:grid-cols-3 gap-6 items-center">
          {/* Left stat */}
          <div className="text-center">
            <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">Dojos Leaking Students</div>
            <div className="font-heading text-4xl text-dojo-gold">87%</div>
            <div className="text-[10px] text-gray-500 mt-1">of San Diego martial arts schools</div>
          </div>

          {/* Center: the counter */}
          <div className="text-center">
            <div className="text-xs font-mono text-dojo-red uppercase tracking-widest mb-2 animate-pulse">
              Students Lost Since You Opened This Page
            </div>
            <div
              className="font-heading text-7xl md:text-8xl text-dojo-red transition-all duration-500"
              style={{ textShadow: `0 0 ${20 + lost * 3}px rgba(220,38,38,0.5)` }}
            >
              {lost}
            </div>
            <div className="text-sm text-gray-400 mt-2">across San Diego dojos right now</div>
          </div>

          {/* Right stat */}
          <div className="text-center">
            <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-1">Revenue Evaporating</div>
            <div className="font-heading text-4xl text-dojo-red">
              ${(lost * 2100).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">in lifetime student value</div>
          </div>
        </div>

        {/* Bottom bar visualizing accumulated loss */}
        <div className="mt-6 h-2 rounded-full bg-dojo-carbon overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(lost * 4, 100)}%`,
              background: 'linear-gradient(90deg, #dc2626, #991b1b)',
              boxShadow: '0 0 12px rgba(220,38,38,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-600">
          <span>0 students</span>
          <span>Critical mass</span>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: The Enrollment Death Spiral ─── */
export function HeroDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const stages = [
    { label: 'LEADS GENERATED', count: '100%', color: '#d4a017', desc: 'Ad spend, referrals, walk-ins' },
    { label: 'TRIAL BOOKED', count: '68%', color: '#f59e0b', desc: '32% never even book' },
    { label: 'REMINDER SENT', count: '31%', color: '#dc2626', desc: 'Most dojos skip this entirely' },
    { label: 'ACTUALLY SHOWS UP', count: '42%', color: '#b91c1c', desc: '26% no-show, no recovery' },
    { label: 'FOLLOW-UP SENT', count: '18%', color: '#991b1b', desc: 'Owner forgets or is too busy' },
    { label: 'ENROLLED & PAYING', count: '12%', color: '#7f1d1d', desc: '88% of leads wasted' },
  ];

  return (
    <div ref={ref} className="mt-14 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Diagram — The Enrollment Death Spiral
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="space-y-3">
          {stages.map((s, i) => (
            <div
              key={i}
              className="relative transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-40px)',
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 text-right">
                  <span className="font-heading text-lg" style={{ color: s.color }}>{s.count}</span>
                </div>
                <div className="flex-1">
                  <div className="h-10 rounded-lg overflow-hidden bg-dojo-carbon relative">
                    <div
                      className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-3"
                      style={{
                        width: visible ? `${parseInt(s.count)}%` : '0%',
                        background: `linear-gradient(90deg, ${s.color}40, ${s.color}20)`,
                        borderLeft: `3px solid ${s.color}`,
                        transitionDelay: `${i * 150 + 200}ms`,
                      }}
                    >
                      <span className="text-[10px] font-mono text-white uppercase tracking-widest whitespace-nowrap">
                        {s.label}
                      </span>
                    </div>
                    {/* Drip particles */}
                    {i < stages.length - 1 && (
                      <div className="absolute -bottom-3 right-[10%] flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <div
                            key={d}
                            className="w-1 h-3 rounded-full animate-pulse"
                            style={{
                              background: s.color,
                              opacity: 0.4,
                              animationDelay: `${d * 300}ms`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block w-48">
                  <span className="text-[10px] text-gray-500">{s.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
          <p className="text-sm text-gray-300">
            <strong className="text-dojo-red font-heading text-2xl">88%</strong>{' '}
            <span className="text-gray-400">of your leads are dying in this spiral.</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">MatBoss plugs every leak in this funnel.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Live Bleeding Revenue Ticker ─── */
export function HeroInteractive() {
  const [trialsPerMonth, setTrialsPerMonth] = useState(20);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const noShowRate = 0.37;
  const noShows = Math.round(trialsPerMonth * noShowRate);
  const neverReturn = Math.round(noShows * 0.92);
  const ltv = 2100;
  const monthlyLoss = neverReturn * 150;
  const annualLoss = neverReturn * ltv;

  return (
    <div ref={ref} className="mt-14 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Calculate Your Dojo's Bleeding
        </span>
      </div>
      <div
        className="bg-dojo-dark/80 border border-dojo-gold/20 rounded-2xl p-6 md:p-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Slider */}
        <div className="mb-8">
          <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
            How many trial classes does your dojo book per month?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={60}
              value={trialsPerMonth}
              onChange={(e) => setTrialsPerMonth(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer
                         bg-dojo-carbon [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dojo-red
                         [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(220,38,38,0.6)]
                         [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="w-16 text-center">
              <span className="font-heading text-3xl text-white">{trialsPerMonth}</span>
            </div>
          </div>
        </div>

        {/* Results cascade */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">No-Shows/Mo</div>
            <div className="font-heading text-3xl text-dojo-red">{noShows}</div>
            <div className="text-[9px] text-gray-600">at 37% no-show rate</div>
          </div>
          <div className="p-4 rounded-xl bg-dojo-carbon border border-white/5 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Gone Forever</div>
            <div className="font-heading text-3xl text-dojo-red">{neverReturn}</div>
            <div className="text-[9px] text-gray-600">92% never rebook</div>
          </div>
          <div className="p-4 rounded-xl bg-dojo-carbon border border-dojo-red/20 text-center">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Monthly Loss</div>
            <div className="font-heading text-3xl text-dojo-red">${monthlyLoss.toLocaleString()}</div>
            <div className="text-[9px] text-gray-600">in membership revenue</div>
          </div>
          <div className="p-4 rounded-xl bg-dojo-red/10 border border-dojo-red/30 text-center">
            <div className="text-xs font-mono text-dojo-red uppercase tracking-widest mb-1">Annual Carnage</div>
            <div
              className="font-heading text-3xl text-dojo-red"
              style={{ textShadow: '0 0 20px rgba(220,38,38,0.5)' }}
            >
              ${annualLoss.toLocaleString()}
            </div>
            <div className="text-[9px] text-gray-400">in lifetime value destroyed</div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Drag the slider to match your dojo. These numbers are based on San Diego averages.
        </p>
      </div>
    </div>
  );
}
