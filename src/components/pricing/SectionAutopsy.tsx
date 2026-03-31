import { useEffect, useRef, useState } from 'react';

export default function SectionAutopsy() {
  const [totalCount, setTotalCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          let current = 0;
          const target = 47;
          const interval = setInterval(() => {
            current += 1;
            setTotalCount(current);
            if (current >= target) clearInterval(interval);
          }, 50);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const findings = [
    { label: 'Missed trial follow-ups per month', count: '12', lost: '$1,800/mo' },
    { label: 'No-shows without recovery attempt', count: '8', lost: '$1,200/mo' },
    { label: 'Leads gone cold after 48 hours', count: '15', lost: '$2,250/mo' },
    { label: 'Manual admin hours wasted weekly', count: '6 hrs', lost: '$390/mo' },
  ];

  return (
    <section ref={ref} className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-dojo-red/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full bg-dojo-red/10 border border-dojo-red/20
                       text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-4"
          >
            Forensic Report
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            The Autopsy of a San Diego Academy
            <span className="text-dojo-red"> That Never Automated.</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We dissected the enrollment pipeline of a 130-student San Diego academy.
            The owner thought business was fine. The numbers told a different story entirely.
          </p>
        </div>

        {/* Findings table */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-dojo-dark/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-dojo-carbon/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dojo-red animate-pulse" />
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                Post-Mortem: Monthly Revenue Hemorrhage
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {findings.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="flex-1">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="ml-2 text-xs font-mono text-dojo-gold">x{item.count}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-dojo-red">{item.lost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="text-center">
          <div className="inline-block p-6 rounded-xl bg-dojo-dark/80 border border-dojo-red/30">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
              Cause of Death
            </div>
            <div className="stat-number">${totalCount},000</div>
            <div className="text-sm text-gray-400 mt-2">
              in unrealized annual revenue — from a single San Diego school
            </div>
            <div className="mt-4 text-xs text-gray-500 font-mono border-t border-white/5 pt-3">
              Status: <span className="text-dojo-red font-bold">Entirely preventable.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
