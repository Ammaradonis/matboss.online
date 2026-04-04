import { useEffect, useRef, useState } from 'react';
import { NoShowChart, NoShowDiagram, NoShowInteractive } from './visuals/NoShowVisuals';

export default function SectionNoShow() {
  const [count, setCount] = useState(0);
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
          const target = 37;
          const interval = setInterval(() => {
            current += 1;
            setCount(current);
            if (current >= target) clearInterval(interval);
          }, 40);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dojo-red/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-dojo-red/10 border border-dojo-red/20
                             text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-4">
              Problem #1
            </span>

            <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight">
              Your San Diego Dojo Is Bleeding Students
              <span className="text-dojo-red"> Before They Even Walk In.</span>
            </h2>

            <p className="text-gray-400 leading-relaxed mb-6">
              Right now, across San Diego martial arts schools, between 20% and 40% of scheduled
              trial classes result in no-shows. That's not a marketing problem. That's not a
              pricing problem. That's an <strong className="text-white">automation problem</strong>.
            </p>

            <p className="text-gray-400 leading-relaxed mb-6">
              The lead filled out the form. They were interested. They picked a time. And then —
              silence. No reminder. No confirmation. No follow-up. Your San Diego BJJ academy
              lost a potential lifetime student because nobody sent a text at the right moment.
            </p>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-dojo-red/5 border border-dojo-red/15">
              <div className="w-10 h-10 rounded-full bg-dojo-red/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-dojo-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-gray-300">
                <strong className="text-white">92% of trial no-shows</strong> in San Diego never
                rebook on their own. That student is gone — unless you have a recovery system.
              </p>
            </div>
          </div>

          {/* Right: Visual Stat */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="stat-number">{count}%</div>
              <div className="text-sm text-gray-500 text-center mt-2 font-medium">
                Average No-Show Rate
              </div>
              <div className="text-xs text-gray-600 text-center mt-1">
                Across San Diego martial arts schools
              </div>

              {/* Visual ring */}
              <svg className="absolute -inset-8 md:-inset-12 w-[calc(100%+4rem)] md:w-[calc(100%+6rem)] h-[calc(100%+4rem)] md:h-[calc(100%+6rem)]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                <circle
                  cx="100" cy="100" r="90" fill="none"
                  stroke="rgba(220,38,38,0.4)" strokeWidth="3"
                  strokeDasharray={`${(count / 100) * 565} 565`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
              <div className="text-center p-3 rounded-lg bg-dojo-carbon border border-white/5">
                <div className="text-xl font-heading text-dojo-red">3–5</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Lost Students/Mo</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-dojo-carbon border border-white/5">
                <div className="text-xl font-heading text-dojo-gold">$6,000+</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Annual Revenue Lost</div>
              </div>
            </div>
          </div>
        </div>
        <NoShowChart />
        <NoShowDiagram />
        <NoShowInteractive />
      </div>
    </section>
  );
}
