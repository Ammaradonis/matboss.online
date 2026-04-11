import { useEffect, useMemo, useRef, useState } from 'react';

const SD_DEFAULTS = {
  monthlyTrials: 22,
  noShowPct: 37,
  membershipPrice: 175,
  lifetimeMonths: 14,
};

type Mode = 'manual' | 'matboss';

export default function EnrollmentLeakCalculator() {
  const [monthlyTrials, setMonthlyTrials] = useState(SD_DEFAULTS.monthlyTrials);
  const [noShowPct, setNoShowPct] = useState(SD_DEFAULTS.noShowPct);
  const [membershipPrice, setMembershipPrice] = useState(SD_DEFAULTS.membershipPrice);
  const [lifetimeMonths, setLifetimeMonths] = useState(SD_DEFAULTS.lifetimeMonths);
  const [mode, setMode] = useState<Mode>('manual');
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Animated counters
  const [displayMonthly, setDisplayMonthly] = useState(0);
  const [displayAnnual, setDisplayAnnual] = useState(0);
  const [displayLTV, setDisplayLTV] = useState(0);

  // Intersection observer to trigger animation once
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !revealed) setRevealed(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealed]);

  const calc = useMemo(() => {
    const noShows = Math.round(monthlyTrials * (noShowPct / 100));
    const lostForever = Math.round(noShows * 0.92); // 92% never rebook
    const monthlyLost = lostForever * membershipPrice;
    const annualLost = monthlyLost * 12;
    const ltvLost = lostForever * membershipPrice * lifetimeMonths;
    const ltvPerMissed = membershipPrice * lifetimeMonths;

    // With MatBoss: recover 65% of no-shows, reduce future no-shows to ~8%
    const mbNoShows = Math.round(monthlyTrials * 0.08);
    const mbLostForever = Math.round(mbNoShows * 0.5);
    const mbMonthlyLost = mbLostForever * membershipPrice;
    const mbAnnualLost = mbMonthlyLost * 12;
    const mbLtvLost = mbLostForever * membershipPrice * lifetimeMonths;

    const savedAnnual = annualLost - mbAnnualLost;
    const savedLTV = ltvLost - mbLtvLost;
    const savedMonthly = monthlyLost - mbMonthlyLost;

    return {
      noShows, lostForever, monthlyLost, annualLost, ltvLost, ltvPerMissed,
      mbNoShows, mbLostForever, mbMonthlyLost, mbAnnualLost, mbLtvLost,
      savedAnnual, savedLTV, savedMonthly,
    };
  }, [monthlyTrials, noShowPct, membershipPrice, lifetimeMonths]);

  // Animate numbers when they change
  useEffect(() => {
    if (!revealed) return;
    const target = mode === 'manual' ? calc.monthlyLost : calc.mbMonthlyLost;
    const start = displayMonthly;
    const delta = target - start;
    const duration = 600;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayMonthly(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc.monthlyLost, calc.mbMonthlyLost, mode, revealed]);

  useEffect(() => {
    if (!revealed) return;
    const target = mode === 'manual' ? calc.annualLost : calc.mbAnnualLost;
    const start = displayAnnual;
    const delta = target - start;
    const duration = 700;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayAnnual(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc.annualLost, calc.mbAnnualLost, mode, revealed]);

  useEffect(() => {
    if (!revealed) return;
    const target = mode === 'manual' ? calc.ltvLost : calc.mbLtvLost;
    const start = displayLTV;
    const delta = target - start;
    const duration = 800;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayLTV(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc.ltvLost, calc.mbLtvLost, mode, revealed]);

  const maxBar = Math.max(calc.annualLost, 1);
  const mbBarPct = (calc.mbAnnualLost / maxBar) * 100;

  return (
    <section ref={ref} className="my-24 scroll-mt-32" id="demo-leak-calculator">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dojo-gold/40 to-dojo-gold/60" />
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest whitespace-nowrap">
          Interactive Tool · 02 / 06
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dojo-gold/40 to-dojo-gold/60" />
      </div>

      <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide leading-tight">
        THE ENROLLMENT LEAK CALCULATOR
      </h2>
      <p className="mt-3 text-dojo-gold font-mono text-xs uppercase tracking-[0.25em]">
        Punch in your numbers. Watch the bleed in real time.
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        Most San Diego dojo owners have <em className="text-white not-italic">never</em> run this math. Once you see the number, you can't un-see it. Defaults are loaded with the San Diego average — tap the sliders to make it yours.
      </p>

      <div className="mt-8 rounded-2xl border border-dojo-gold/20 bg-dojo-dark/80 backdrop-blur-sm overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-dojo-gold animate-pulse" />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
              Leak Calculator · San Diego Benchmarks Loaded
            </span>
          </div>
          <button
            onClick={() => {
              setMonthlyTrials(SD_DEFAULTS.monthlyTrials);
              setNoShowPct(SD_DEFAULTS.noShowPct);
              setMembershipPrice(SD_DEFAULTS.membershipPrice);
              setLifetimeMonths(SD_DEFAULTS.lifetimeMonths);
            }}
            className="text-[9px] font-mono text-gray-500 uppercase tracking-widest hover:text-dojo-gold transition-colors"
          >
            ↻ Reset to SD Averages
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-4 px-6 text-[11px] font-mono uppercase tracking-widest transition-all ${
              mode === 'manual'
                ? 'bg-dojo-red/10 text-dojo-red border-b-2 border-dojo-red'
                : 'text-gray-600 hover:text-gray-400 border-b-2 border-transparent'
            }`}
          >
            ✕ Manual Follow-Up (How You Work Now)
          </button>
          <button
            onClick={() => setMode('matboss')}
            className={`flex-1 py-4 px-6 text-[11px] font-mono uppercase tracking-widest transition-all ${
              mode === 'matboss'
                ? 'bg-green-500/10 text-green-400 border-b-2 border-green-400'
                : 'text-gray-600 hover:text-gray-400 border-b-2 border-transparent'
            }`}
          >
            ✓ With MatBoss Automation
          </button>
        </div>

        {/* Inputs */}
        <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-white/5">
          <SliderInput
            label="Monthly Trial Bookings"
            suffix=""
            value={monthlyTrials}
            min={5}
            max={100}
            step={1}
            onChange={setMonthlyTrials}
            color="#dc2626"
          />
          <SliderInput
            label="No-Show Rate"
            suffix="%"
            value={noShowPct}
            min={10}
            max={60}
            step={1}
            onChange={setNoShowPct}
            color="#dc2626"
          />
          <SliderInput
            label="Avg Monthly Membership"
            prefix="$"
            value={membershipPrice}
            min={80}
            max={300}
            step={5}
            onChange={setMembershipPrice}
            color="#d4a017"
          />
          <SliderInput
            label="Avg Student Lifetime (months)"
            suffix=" mo"
            value={lifetimeMonths}
            min={4}
            max={36}
            step={1}
            onChange={setLifetimeMonths}
            color="#d4a017"
          />
        </div>

        {/* Main results */}
        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <ResultCard
              label={mode === 'manual' ? 'Monthly Revenue Lost' : 'Monthly Still Lost'}
              value={`$${displayMonthly.toLocaleString()}`}
              sub={`${mode === 'manual' ? calc.lostForever : calc.mbLostForever} leads vaporized`}
              tone={mode === 'manual' ? 'red' : 'green'}
            />
            <ResultCard
              label={mode === 'manual' ? 'Annual Revenue Lost' : 'Annual Still Lost'}
              value={`$${displayAnnual.toLocaleString()}`}
              sub="Every single year"
              tone={mode === 'manual' ? 'red' : 'green'}
              big
            />
            <ResultCard
              label={mode === 'manual' ? 'Lifetime Value Destroyed' : 'LTV Preserved'}
              value={`$${displayLTV.toLocaleString()}`}
              sub={`${lifetimeMonths} months × $${membershipPrice}`}
              tone={mode === 'manual' ? 'red' : 'green'}
            />
          </div>

          {/* Bar chart comparison */}
          <div className="mt-6 rounded-xl bg-black/40 border border-white/5 p-6">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-5">
              ◈ Manual Follow-Up vs. MatBoss — Annual Revenue Destroyed
            </div>
            <div className="space-y-5">
              {/* Manual bar */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Manual</span>
                  <span className="font-heading text-xl text-dojo-red"
                        style={{ textShadow: '0 0 12px rgba(220,38,38,0.5)' }}>
                    ${calc.annualLost.toLocaleString()}
                  </span>
                </div>
                <div className="h-5 rounded-full bg-dojo-carbon overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-dojo-blood via-dojo-red to-dojo-crimson rounded-full transition-all duration-1000"
                    style={{
                      width: revealed ? '100%' : '0%',
                      boxShadow: '0 0 15px rgba(220,38,38,0.5)',
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
                  </div>
                </div>
              </div>

              {/* MatBoss bar */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">With MatBoss</span>
                  <span className="font-heading text-xl text-green-400"
                        style={{ textShadow: '0 0 12px rgba(34,197,94,0.5)' }}>
                    ${calc.mbAnnualLost.toLocaleString()}
                  </span>
                </div>
                <div className="h-5 rounded-full bg-dojo-carbon overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-900 via-green-700 to-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: revealed ? `${Math.max(mbBarPct, 2)}%` : '0%',
                      boxShadow: '0 0 10px rgba(34,197,94,0.4)',
                      transitionDelay: '300ms',
                    }}
                  />
                </div>
              </div>

              {/* Gap highlight */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-1">
                    The Gap You're Leaving on the Mat
                  </div>
                  <div className="font-heading text-3xl md:text-4xl text-dojo-gold"
                       style={{ textShadow: '0 0 20px rgba(212,160,23,0.5)' }}>
                    ${calc.savedAnnual.toLocaleString()}/year
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    +${calc.savedLTV.toLocaleString()} in preserved lifetime value
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-5xl md:text-6xl text-white">
                    {Math.round(((calc.savedAnnual) / Math.max(calc.annualLost, 1)) * 100)}%
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Recovery
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 rounded-xl border border-dojo-red/20 bg-gradient-to-br from-dojo-red/5 via-transparent to-dojo-gold/5 p-6 text-center">
            <div className="text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-2">
              Ready to See Your Real Numbers?
            </div>
            <div className="text-white font-heading text-xl md:text-2xl mb-3">
              Want us to map your specific leaks?
            </div>
            <div className="text-gray-400 text-sm">
              DM <span className="font-mono text-dojo-gold">ENROLL</span> on Instagram or use the form above. We'll mystery-shop your school and run this calculation against your actual funnel — free.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderInput({
  label, value, min, max, step, onChange, color, prefix = '', suffix = '',
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; color: string; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          {label}
        </label>
        <span className="font-heading text-2xl text-white">
          {prefix}{value.toLocaleString()}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-dojo-carbon
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:border-0"
        style={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--thumb' as any]: color,
          background: `linear-gradient(to right, ${color}80 0%, ${color} ${((value - min) / (max - min)) * 100}%, #1a1a1a ${((value - min) / (max - min)) * 100}%, #1a1a1a 100%)`,
        }}
      />
      <style>{`input[type=range]::-webkit-slider-thumb { background: ${color}; box-shadow: 0 0 12px ${color}90; }
               input[type=range]::-moz-range-thumb { background: ${color}; box-shadow: 0 0 12px ${color}90; }`}</style>
    </div>
  );
}

function ResultCard({
  label, value, sub, tone, big = false,
}: {
  label: string; value: string; sub: string; tone: 'red' | 'green'; big?: boolean;
}) {
  const color = tone === 'red' ? '#dc2626' : '#22c55e';
  const bgColor = tone === 'red' ? 'rgba(220,38,38,0.05)' : 'rgba(34,197,94,0.05)';
  const borderColor = tone === 'red' ? 'rgba(220,38,38,0.2)' : 'rgba(34,197,94,0.2)';
  return (
    <div
      className="rounded-xl p-5 border transition-all duration-500"
      style={{
        background: bgColor,
        borderColor,
        transform: big ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color }}>
        {label}
      </div>
      <div
        className={`font-heading ${big ? 'text-4xl md:text-5xl' : 'text-3xl'}`}
        style={{ color, textShadow: `0 0 20px ${color}50` }}
      >
        {value}
      </div>
      <div className="text-[10px] text-gray-500 mt-2">{sub}</div>
    </div>
  );
}
