import { useEffect, useRef, useState } from 'react';

/* ─── CHART: The Declassification Index ─── */
export function ClassifiedChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const redactions = [
    { label: 'What CRM agencies charge SD dojos', originalHidden: '$800 – $3,000/mo', severity: 95 },
    { label: 'True no-show rate across academies', originalHidden: '37% average', severity: 88 },
    { label: 'Annual revenue lost to bad follow-up', originalHidden: '$47,000+', severity: 92 },
    { label: 'What it actually costs to automate', originalHidden: '$197/mo — MatBoss', severity: 100 },
    { label: 'How many SD dojos have zero automation', originalHidden: '87% of all schools', severity: 78 },
  ];

  return (
    <div ref={ref} className="mt-14 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Chart — Declassification Index
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-dojo-red/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-dojo-red animate-pulse" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Classified Intelligence — Redaction Status
          </span>
        </div>

        <div className="space-y-4">
          {redactions.map((r, i) => {
            const isRevealed = visible;
            return (
              <div
                key={i}
                className="transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(15px)',
                  transitionDelay: `${i * 200}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{r.label}</span>
                  <span className="text-[9px] font-mono text-dojo-red uppercase">
                    Threat Level: {r.severity}%
                  </span>
                </div>
                <div className="relative h-10 rounded-lg bg-dojo-carbon overflow-hidden">
                  {/* Severity bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1200 ease-out"
                    style={{
                      width: visible ? `${r.severity}%` : '0%',
                      transitionDelay: `${i * 200 + 300}ms`,
                      background: r.severity >= 90
                        ? 'linear-gradient(90deg, rgba(220,38,38,0.4), rgba(127,29,29,0.2))'
                        : 'linear-gradient(90deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))',
                    }}
                  />
                  {/* Redacted / revealed text */}
                  <div className="absolute inset-0 flex items-center px-4">
                    <span
                      className="text-sm font-mono transition-all duration-700"
                      style={{
                        color: isRevealed ? '#ffffff' : 'transparent',
                        textShadow: isRevealed ? 'none' : '0 0 8px rgba(255,255,255,0.5)',
                        background: isRevealed ? 'none' : '#dc2626',
                        padding: isRevealed ? '0' : '0 4px',
                        transitionDelay: `${i * 200 + 600}ms`,
                      }}
                    >
                      {r.originalHidden}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-dojo-red/10 border border-dojo-red/20 text-center">
          <p className="text-xs text-gray-300">
            <strong className="text-dojo-red">5 of 5</strong> redactions lifted.
            The enrollment automation industry does not want you reading this page.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── DIAGRAM: Intelligence Briefing Grid ─── */
export function ClassifiedDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const intel = [
    { code: 'SIGINT-01', finding: 'Your no-show rate', truth: '37% — not the 15% you assumed', classification: 'TOP SECRET' },
    { code: 'SIGINT-02', finding: 'Revenue leak per month', truth: '$4,700 vanishing silently', classification: 'SECRET' },
    { code: 'SIGINT-03', finding: 'Competitor automation cost', truth: '3x–15x what you should pay', classification: 'CLASSIFIED' },
    { code: 'SIGINT-04', finding: 'Days to full deployment', truth: '7 days — not 90', classification: 'RESTRICTED' },
    { code: 'SIGINT-05', finding: 'Follow-up response window', truth: '23 minutes, not 6 hours', classification: 'TOP SECRET' },
    { code: 'SIGINT-06', finding: 'Break-even timeline', truth: '1 student recovers full cost', classification: 'SECRET' },
  ];

  const classColors: Record<string, string> = {
    'TOP SECRET': '#dc2626',
    SECRET: '#b91c1c',
    CLASSIFIED: '#d4a017',
    RESTRICTED: '#f59e0b',
  };

  return (
    <div ref={ref} className="mt-12 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
          Diagram — Intelligence Briefing: What You Don't Know
        </span>
      </div>
      <div className="bg-dojo-dark/80 border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {intel.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-dojo-carbon/50 border border-white/5 transition-all duration-500 hover:border-dojo-red/20"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0.9)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-gray-600">{item.code}</span>
                <span
                  className="text-[8px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    color: classColors[item.classification],
                    background: `${classColors[item.classification]}15`,
                    border: `1px solid ${classColors[item.classification]}30`,
                  }}
                >
                  {item.classification}
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-1">{item.finding}</div>
              <div className="text-sm text-white font-semibold">{item.truth}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <span className="text-[10px] font-mono text-gray-600">
            CLASSIFICATION: ALL INTEL NOW DECLASSIFIED FOR SAN DIEGO ACADEMY OWNERS
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── INTERACTIVE: Security Clearance Terminal ─── */
export function ClassifiedInteractive() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [accessLevel, setAccessLevel] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const terminalSequence = [
    '> Authenticating San Diego academy owner...',
    '> Clearance level: FOUNDING MEMBER',
    '> Accessing enrollment intelligence database...',
    '> ALERT: 87% of local dojos have zero automation',
    '> ALERT: Average annual revenue leak — $47,000',
    '> ALERT: Industry vendors charging 3x-15x fair rate',
    '> Loading competitor pricing matrix...',
    '> DECLASSIFIED: MatBoss founding rate = $197/mo',
    '> ACCESS GRANTED — Full briefing available below',
  ];

  const runTerminal = () => {
    if (accessLevel > 0) return;
    setLines([]);
    setAccessLevel(1);
    let i = 0;
    const iv = setInterval(() => {
      if (i < terminalSequence.length) {
        setLines((prev) => [...prev, terminalSequence[i]]);
        i++;
      } else {
        setAccessLevel(2);
        clearInterval(iv);
      }
    }, 600);
  };

  return (
    <div ref={ref} className="mt-12 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest">
          Interactive — Access Terminal
        </span>
      </div>
      <div
        className="bg-dojo-dark/90 border border-dojo-red/20 rounded-2xl overflow-hidden transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        {/* Terminal header */}
        <div className="px-4 py-2 border-b border-white/5 bg-dojo-carbon/80 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-dojo-red" />
          <div className="w-2.5 h-2.5 rounded-full bg-dojo-gold" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-2 text-[10px] font-mono text-gray-600">matboss://intelligence/pricing-declassified</span>
        </div>

        {/* Terminal body */}
        <div className="p-5 min-h-[280px] font-mono text-sm">
          {accessLevel === 0 && (
            <div className="text-center py-10">
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-4">
                Restricted Access — Authorization Required
              </div>
              <button
                onClick={runTerminal}
                className="px-6 py-3 rounded-xl bg-dojo-red/20 border border-dojo-red/40 text-dojo-red font-mono text-sm
                           hover:bg-dojo-red/30 transition-all cursor-pointer"
                style={{ boxShadow: '0 0 15px rgba(220,38,38,0.2)' }}
              >
                INITIATE DECLASSIFICATION
              </button>
            </div>
          )}

          {accessLevel > 0 && (
            <div className="space-y-1">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`transition-all duration-300 ${
                    line.includes('ALERT') ? 'text-dojo-red' :
                    line.includes('DECLASSIFIED') ? 'text-dojo-gold' :
                    line.includes('GRANTED') ? 'text-green-400' :
                    'text-gray-400'
                  }`}
                >
                  {line}
                </div>
              ))}
              {accessLevel === 1 && (
                <span className="inline-block w-2 h-4 bg-dojo-red animate-pulse" />
              )}
            </div>
          )}

          {accessLevel === 2 && (
            <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-xs font-mono text-green-500 uppercase tracking-widest mb-1">
                Access Level: Maximum
              </div>
              <p className="text-sm text-gray-300">
                Full pricing intelligence unlocked. Scroll to review the complete dossier.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
