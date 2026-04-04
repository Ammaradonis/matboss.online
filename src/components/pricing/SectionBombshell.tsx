import { useEffect, useRef, useState } from 'react';
import { BombshellChart, BombshellDiagram, BombshellInteractive } from '../visuals/BombshellVisuals';

export default function SectionBombshell() {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), 600);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const includes = [
    'Full enrollment pipeline mapping',
    'Automated trial reminders (SMS + email)',
    'No-show recovery sequences',
    'Post-trial enrollment follow-up',
    'Works with your existing booking software',
    'San Diego-specific optimization',
    'Ongoing system tuning & support',
  ];

  return (
    <section ref={ref} className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dojo-red/4 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full bg-dojo-red/10 border border-dojo-red/20
                       text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-4"
          >
            The Number
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            The Price That Made a SaaS Founder in La Jolla
            <span className="text-dojo-red"> Spit Out His Coffee.</span>
          </h2>
        </div>

        {/* Price reveal card */}
        <div className="max-w-md mx-auto mb-10">
          <div
            className={`rounded-2xl border overflow-hidden transition-all duration-1000 ${
              revealed
                ? 'bg-dojo-dark/80 border-dojo-red/40 red-glow'
                : 'bg-dojo-dark/40 border-white/5'
            }`}
          >
            {/* Card header */}
            <div className="px-6 py-4 border-b border-white/5 bg-dojo-carbon/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg tracking-wider text-white">
                    MatBoss Enrollment Engine
                  </h3>
                  <p className="text-xs text-gray-500">Complete Enrollment Automation</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-dojo-red/20 text-[10px] font-mono text-dojo-red font-bold">
                  FOUNDING RATE
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="px-6 py-8 text-center">
              <div
                className={`transition-all duration-1000 ${
                  revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
              >
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl text-gray-500 font-heading">$</span>
                  <span
                    className="text-6xl md:text-8xl font-heading text-dojo-red"
                    style={{ textShadow: '0 0 40px rgba(220,38,38,0.4)' }}
                  >
                    197
                  </span>
                  <span className="text-lg text-gray-500 font-heading">/mo</span>
                </div>
                <div className="mt-2 text-xs font-mono text-gray-600">
                  Optional setup: $119 one-time
                </div>
              </div>
            </div>

            {/* What's included */}
            <div className="px-6 pb-6">
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
                Full deployment includes:
              </div>
              <ul className="space-y-2">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg
                      className="w-4 h-4 text-dojo-gold flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <a
                href="#checkout"
                className="block w-full py-3 rounded-xl bg-dojo-red text-white text-center font-heading text-lg tracking-wider
                           hover:bg-dojo-crimson transition-all red-glow-hover"
              >
                Deploy Now
              </a>
            </div>
          </div>
        </div>

        {/* "Read that again" callout */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-2">Read that number again.</p>
          <p className="text-white font-heading text-xl md:text-2xl tracking-wider max-w-lg mx-auto">
            One recovered student per month covers the entire cost.
            <span className="text-dojo-gold"> Every student after that is pure upside.</span>
          </p>
        </div>
        <BombshellChart />
        <BombshellDiagram />
        <BombshellInteractive />
      </div>
    </section>
  );
}
