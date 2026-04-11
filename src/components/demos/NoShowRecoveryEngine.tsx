import { useEffect, useRef, useState } from 'react';
import { formatSDTimestamp, useSanDiegoClock, minutesToHuman } from './sdTime';

type Channel = 'SMS' | 'EMAIL' | 'SYSTEM';
type StepStatus = 'queued' | 'sending' | 'delivered' | 'read' | 'triggered' | 'failed';

interface Step {
  id: number;
  realOffsetMs: number;      // real-time offset in sim
  labelTime: string;         // simulated clock label ("+1h", "T-1:00")
  channel: Channel;
  title: string;
  body: string;
  status: StepStatus;
  branch?: 'recovery' | 'main';
}

const MARTIAL_ARTS = [
  'Brazilian Jiu-Jitsu',
  'Muay Thai',
  'MMA',
  'Karate',
  'Judo',
  'Wrestling',
  'Kids Program',
];

const SD_LOCATIONS = [
  'North Park',
  'Pacific Beach',
  'La Jolla',
  'Chula Vista',
  'Mission Valley',
  'Carlsbad',
  'Oceanside',
  'Hillcrest',
];

function tsNow() {
  return formatSDTimestamp();
}

export default function NoShowRecoveryEngine() {
  const sd = useSanDiegoClock(30000);
  const [studentName, setStudentName] = useState('Marcus Chen');
  const [martialArt, setMartialArt] = useState('Brazilian Jiu-Jitsu');
  const [location, setLocation] = useState('North Park');
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [clock, setClock] = useState(0); // elapsed ms in sim
  const [steps, setSteps] = useState<Step[]>([]);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ sent: 0, delivered: 0, recovered: 0 });
  const timeoutsRef = useRef<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Simulation plays over ~28 seconds (compressed 48h sequence)
  const buildSequence = (): Step[] => [
    {
      id: 1,
      realOffsetMs: 1200,
      labelTime: 'T + 0s',
      channel: 'SYSTEM',
      title: 'Trial booking received',
      body: `New lead: ${studentName} — ${martialArt} trial booked at ${location} dojo. Lead score: 94/100`,
      status: 'queued',
      branch: 'main',
    },
    {
      id: 2,
      realOffsetMs: 3000,
      labelTime: 'T + 6s',
      channel: 'SMS',
      title: 'Confirmation SMS fired',
      body: `${studentName.split(' ')[0]}, welcome to the mat. Your ${martialArt} trial is confirmed at our ${location} dojo. What to wear: comfortable athletic clothes. We'll text you again 24h before — Sensei Carlos`,
      status: 'queued',
      branch: 'main',
    },
    {
      id: 3,
      realOffsetMs: 4200,
      labelTime: 'T + 8s',
      channel: 'EMAIL',
      title: 'Welcome email dispatched',
      body: `Subject: You're locked in for ${martialArt} 🥋 — Opens with instructor bio, parking map for ${location}, what to expect on the mat, and house rules. Branded template. Opens automatically in Gmail preview.`,
      status: 'queued',
      branch: 'main',
    },
    {
      id: 4,
      realOffsetMs: 7200,
      labelTime: 'T + 24h (compressed)',
      channel: 'SMS',
      title: '24-hour reminder',
      body: `Tomorrow's the day, ${studentName.split(' ')[0]}. Your ${martialArt} trial is at 6:30 PM. Address: 2847 University Ave, ${location}. Free parking in the lot behind the building. Reply C to confirm.`,
      status: 'queued',
      branch: 'main',
    },
    {
      id: 5,
      realOffsetMs: 10200,
      labelTime: 'T-1:00',
      channel: 'SMS',
      title: '1-hour pre-class nudge',
      body: `We're expecting you in 60 min. Sensei Carlos is warming up the mat. Pro tip: show up 10 min early to meet the class and get your rental gi. — MatBoss × ${location}`,
      status: 'queued',
      branch: 'main',
    },
    {
      id: 6,
      realOffsetMs: 13500,
      labelTime: 'T + 15 min (no check-in)',
      channel: 'SYSTEM',
      title: '⚠️ NO-SHOW DETECTED',
      body: `Check-in threshold breached. ${studentName} did not scan in at ${location}. Escalating to recovery engine. Status: lead flagged, recovery sequence INITIATED.`,
      status: 'queued',
      branch: 'recovery',
    },
    {
      id: 7,
      realOffsetMs: 16500,
      labelTime: 'T + 20 min',
      channel: 'SMS',
      title: '🆘 Recovery outreach #1',
      body: `${studentName.split(' ')[0]}, we missed you on the mat tonight. No pressure — life happens. Want to reschedule? Tap here: matboss.online/r/${Math.random().toString(36).slice(2, 7)}. Next ${martialArt} class: Thursday 6:30 PM.`,
      status: 'queued',
      branch: 'recovery',
    },
    {
      id: 8,
      realOffsetMs: 19500,
      labelTime: 'T + 20 min',
      channel: 'EMAIL',
      title: 'Recovery email (parallel channel)',
      body: `Subject: Your spot is still here, ${studentName.split(' ')[0]} — Softer copy, instructor-signed, one-click reschedule button. Includes a 30-sec class highlight video. Opens at 34% rate industry-wide.`,
      status: 'queued',
      branch: 'recovery',
    },
    {
      id: 9,
      realOffsetMs: 22500,
      labelTime: 'T + 48h (no reply)',
      channel: 'SMS',
      title: 'Final follow-up',
      body: `Hey ${studentName.split(' ')[0]} — last message from us. The mat's still open this weekend. If now isn't the right time, no worries. Just tap STOP and we'll pause. Otherwise, here's your reschedule link.`,
      status: 'queued',
      branch: 'recovery',
    },
    {
      id: 10,
      realOffsetMs: 25500,
      labelTime: 'T + 48h 04min',
      channel: 'SYSTEM',
      title: '✅ RECOVERY SUCCESSFUL',
      body: `${studentName} clicked reschedule link. New trial booked: Saturday 11:00 AM, ${martialArt}. Lead returned to main sequence. Recovery win logged. This would have been LOST without MatBoss.`,
      status: 'queued',
      branch: 'recovery',
    },
  ];

  const appendLog = (msg: string) => {
    setLogEntries((prev) => [`[${tsNow()}] ${msg}`, ...prev].slice(0, 60));
  };

  const cancelTimers = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const startSimulation = () => {
    if (running) return;
    cancelTimers();
    const seq = buildSequence();
    setSteps(seq);
    setLogEntries([]);
    setMetrics({ sent: 0, delivered: 0, recovered: 0 });
    setClock(0);
    setComplete(false);
    setRunning(true);

    appendLog(`SIMULATION INIT — target: ${studentName}, program: ${martialArt}, location: ${location}`);
    appendLog('Compressing 48-hour sequence into ~28 seconds of real time...');

    const clockInt = window.setInterval(() => setClock((c) => c + 100), 100);
    timeoutsRef.current.push(clockInt as unknown as number);

    seq.forEach((step) => {
      const sendT = window.setTimeout(() => {
        setSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: 'sending' } : s))
        );
        appendLog(`[${step.channel}] Dispatching: ${step.title}`);
        setMetrics((m) => ({ ...m, sent: m.sent + 1 }));
      }, step.realOffsetMs);

      const deliverT = window.setTimeout(() => {
        setSteps((prev) =>
          prev.map((s) =>
            s.id === step.id
              ? { ...s, status: step.channel === 'SYSTEM' ? 'triggered' : 'delivered' }
              : s
          )
        );
        appendLog(`[${step.channel}] Delivered: ${step.title}`);
        setMetrics((m) => ({ ...m, delivered: m.delivered + 1 }));
      }, step.realOffsetMs + 900);

      if (step.channel === 'SMS' || step.channel === 'EMAIL') {
        const readT = window.setTimeout(() => {
          setSteps((prev) =>
            prev.map((s) => (s.id === step.id ? { ...s, status: 'read' } : s))
          );
        }, step.realOffsetMs + 1900);
        timeoutsRef.current.push(readT as unknown as number);
      }

      timeoutsRef.current.push(sendT as unknown as number, deliverT as unknown as number);
    });

    const endT = window.setTimeout(() => {
      setRunning(false);
      setComplete(true);
      setMetrics((m) => ({ ...m, recovered: 1 }));
      appendLog('✅ SIMULATION COMPLETE — Lead recovered. $2,100 in lifetime value saved.');
      clearInterval(clockInt);
    }, 28000);
    timeoutsRef.current.push(endT as unknown as number);
  };

  const resetSimulation = () => {
    cancelTimers();
    setRunning(false);
    setComplete(false);
    setSteps([]);
    setLogEntries([]);
    setMetrics({ sent: 0, delivered: 0, recovered: 0 });
    setClock(0);
  };

  useEffect(() => () => cancelTimers(), []);

  const progress = Math.min(100, (clock / 28000) * 100);

  return (
    <section
      ref={sectionRef}
      className="relative my-24 scroll-mt-32"
      id="demo-no-show-recovery"
    >
      {/* Section header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dojo-red/40 to-dojo-red/60" />
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest whitespace-nowrap">
          Live Demo · 01 / 06
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dojo-red/40 to-dojo-red/60" />
      </div>

      <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide leading-tight">
        THE NO-SHOW RECOVERY ENGINE
      </h2>
      <p className="mt-3 text-dojo-red font-mono text-xs uppercase tracking-[0.25em]">
        Watch 48 hours of automation compressed into 28 seconds.
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        This is what happens the instant a trial booking hits your system — and what you <em className="text-white not-italic">currently do manually, forget, or ignore entirely</em>. Every message below fires automatically. Every failure is caught. No lead slips through.
      </p>

      {/* Control panel */}
      <div className="mt-8 rounded-2xl border border-dojo-red/20 bg-dojo-dark/80 backdrop-blur-sm overflow-hidden">
        <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${running ? 'bg-green-500 animate-pulse' : complete ? 'bg-dojo-gold' : 'bg-gray-600'}`} />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
              Recovery Engine — {running ? 'RUNNING' : complete ? 'COMPLETE' : 'IDLE'}
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500 flex items-center gap-3 flex-wrap">
            <span>
              SIM TIME <span className="text-white">{(clock / 1000).toFixed(1)}s</span> / 28.0s
            </span>
            <span className="text-gray-700">·</span>
            <span>
              SD <span className="text-dojo-gold">{sd.clock12.replace(/:\d\d (AM|PM)$/, ' $1')}</span> {sd.tzLabel}
            </span>
            {!sd.frontDeskOpen && (
              <span className="text-dojo-red">· front desk CLOSED · {minutesToHuman(sd.minutesUntilFrontDeskOpen)} until reopen</span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-dojo-carbon">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-dojo-crimson via-dojo-red to-dojo-gold transition-all duration-100"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(220,38,38,0.6)' }}
          />
        </div>

        {/* Inputs */}
        <div className="p-6 grid md:grid-cols-3 gap-4 border-b border-white/5">
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              Simulated Student
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              disabled={running}
              className="w-full rounded bg-dojo-carbon border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-dojo-red disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              Program
            </label>
            <select
              value={martialArt}
              onChange={(e) => setMartialArt(e.target.value)}
              disabled={running}
              className="w-full rounded bg-dojo-carbon border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-dojo-red disabled:opacity-50"
            >
              {MARTIAL_ARTS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              San Diego Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={running}
              className="w-full rounded bg-dojo-carbon border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-dojo-red disabled:opacity-50"
            >
              {SD_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-4 bg-black/20 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={startSimulation}
              disabled={running}
              className="px-6 py-3 rounded bg-dojo-red text-white text-xs font-semibold uppercase tracking-widest disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ boxShadow: running ? 'none' : '0 0 20px rgba(220,38,38,0.35)' }}
            >
              {running ? '● SIMULATION RUNNING' : complete ? '▶ RUN AGAIN' : '▶ START LIVE SIMULATION'}
            </button>
            {(running || complete) && (
              <button
                onClick={resetSimulation}
                className="px-4 py-3 rounded border border-white/10 text-white text-xs font-semibold uppercase tracking-widest hover:border-dojo-red/50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            <div>Sent <span className="text-white ml-1">{metrics.sent}</span></div>
            <div>Delivered <span className="text-green-400 ml-1">{metrics.delivered}</span></div>
            <div>Recovered <span className="text-dojo-gold ml-1">{metrics.recovered}</span></div>
          </div>
        </div>

        {/* Main area: Timeline + Log */}
        <div className="grid lg:grid-cols-5 gap-0 border-t border-white/5">
          {/* Timeline */}
          <div className="lg:col-span-3 p-6 border-r border-white/5 max-h-[540px] overflow-y-auto">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
              Sequence Timeline
            </div>
            {steps.length === 0 ? (
              <div className="py-16 text-center text-gray-600 text-sm">
                Press <span className="text-dojo-red font-mono">START</span> to fire the live sequence.
                <div className="mt-2 text-xs text-gray-700">10 events will dispatch across SMS, email, and system channels.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((s, idx) => (
                  <StepCard key={s.id} step={s} idx={idx} />
                ))}
              </div>
            )}
          </div>

          {/* Live log */}
          <div className="lg:col-span-2 bg-black/60 p-6 max-h-[540px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
                ● Event Log
              </div>
              <div className="text-[9px] font-mono text-gray-600">
                {logEntries.length} entries
              </div>
            </div>
            <div className="font-mono text-[10px] leading-relaxed space-y-1">
              {logEntries.length === 0 ? (
                <div className="text-gray-700">$ awaiting input_</div>
              ) : (
                logEntries.map((entry, i) => (
                  <div key={i} className={i === 0 ? 'text-green-400' : 'text-gray-500'}>
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Success banner */}
        {complete && (
          <div className="p-6 border-t border-dojo-gold/20 bg-gradient-to-r from-dojo-gold/5 via-dojo-red/5 to-dojo-gold/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-1">
                  ✦ Recovery Complete
                </div>
                <div className="text-white font-heading text-xl">
                  Lead returned. $2,100 lifetime value secured.
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Without MatBoss, {studentName} would have ghosted 92% of the time.
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-4xl text-dojo-gold">+1</div>
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  Student Saved
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StepCard({ step, idx }: { step: Step; idx: number }) {
  const isActive = step.status !== 'queued';
  const isRecovery = step.branch === 'recovery';

  const channelColor =
    step.channel === 'SMS' ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' :
    step.channel === 'EMAIL' ? 'text-purple-400 border-purple-500/30 bg-purple-500/5' :
    'text-dojo-red border-dojo-red/30 bg-dojo-red/5';

  const statusMeta: Record<StepStatus, { label: string; color: string }> = {
    queued: { label: 'QUEUED', color: 'text-gray-600 bg-gray-800' },
    sending: { label: '→ SENDING', color: 'text-dojo-gold bg-dojo-gold/10 animate-pulse' },
    delivered: { label: '✓ DELIVERED', color: 'text-green-400 bg-green-500/10' },
    read: { label: '✓✓ READ', color: 'text-green-300 bg-green-500/15' },
    triggered: { label: '⚡ TRIGGERED', color: 'text-dojo-red bg-dojo-red/15' },
    failed: { label: '✕ FAILED', color: 'text-red-500 bg-red-900/20' },
  };

  const meta = statusMeta[step.status];

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-500 ${
        isActive
          ? isRecovery
            ? 'border-dojo-red/30 bg-dojo-red/5 shadow-[0_0_20px_rgba(220,38,38,0.08)]'
            : 'border-white/10 bg-dojo-carbon/50'
          : 'border-white/5 bg-black/20 opacity-40'
      }`}
      style={{
        transform: isActive ? 'translateX(0)' : 'translateX(-4px)',
      }}
    >
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-dojo-carbon border border-white/10 flex items-center justify-center font-mono text-[10px] text-gray-500">
            {idx + 1}
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest border ${channelColor}`}>
            {step.channel}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 uppercase">{step.labelTime}</span>
        <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest ${meta.color}`}>
          {meta.label}
        </span>
      </div>
      <div className="text-sm text-white font-semibold mb-1">{step.title}</div>
      {(step.status !== 'queued') && (
        <div className={`text-xs leading-relaxed mt-2 px-3 py-2 rounded ${
          step.channel === 'SMS' ? 'bg-blue-500/5 border-l-2 border-blue-500/40 text-blue-100' :
          step.channel === 'EMAIL' ? 'bg-purple-500/5 border-l-2 border-purple-500/40 text-purple-100' :
          'bg-dojo-red/5 border-l-2 border-dojo-red/40 text-red-100'
        }`}>
          {step.body}
        </div>
      )}
    </div>
  );
}
