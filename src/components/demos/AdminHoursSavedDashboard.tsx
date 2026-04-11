import { useEffect, useMemo, useRef, useState } from 'react';

type Operator = 'owner' | 'front-desk' | 'matboss';

interface AdminTask {
  id: string;
  name: string;
  description: string;
  // minutes per day for each operator scenario
  manualMinutes: { owner: number; frontDesk: number; matboss: number };
  icon: string;
}

const TASKS: AdminTask[] = [
  { id: 'dms',         name: 'Responding to DMs & messages',     description: 'Instagram, Facebook, website chat',     manualMinutes: { owner: 45, frontDesk: 55, matboss: 3 },  icon: '💬' },
  { id: 'reminders',   name: 'Sending class reminders',          description: 'Copy-paste SMS from a spreadsheet',     manualMinutes: { owner: 20, frontDesk: 25, matboss: 0 },  icon: '📣' },
  { id: 'noshows',     name: 'Following up on no-shows',         description: 'Digging through rosters, ad-hoc texts', manualMinutes: { owner: 30, frontDesk: 20, matboss: 0 },  icon: '🚨' },
  { id: 'enroll',      name: 'Enrollment follow-up calls',       description: 'Chasing trial students to sign up',     manualMinutes: { owner: 25, frontDesk: 18, matboss: 1 },  icon: '📞' },
  { id: 'schedule',    name: 'Class scheduling & reschedules',   description: 'Editing calendar, notifying students',  manualMinutes: { owner: 15, frontDesk: 20, matboss: 0 },  icon: '📅' },
  { id: 'intake',      name: 'New student intake forms',         description: 'Paper waivers, data entry',             manualMinutes: { owner: 20, frontDesk: 30, matboss: 2 },  icon: '📝' },
  { id: 'reviews',     name: 'Asking for Google reviews',        description: 'Texting parents, awkward timing',       manualMinutes: { owner: 10, frontDesk: 12, matboss: 0 },  icon: '⭐' },
  { id: 'retention',   name: 'Lapsed student recovery',          description: 'Winback texts to dropped members',      manualMinutes: { owner: 18, frontDesk: 15, matboss: 0 },  icon: '🔁' },
];

const LIVE_FEED_EVENTS = [
  { channel: 'SMS', text: 'Reminder sent → Marcus C. (6:30 PM BJJ class)', color: '#60a5fa' },
  { channel: 'SMS', text: 'Reminder sent → Sofia R. (Kids Karate 5:00 PM)', color: '#60a5fa' },
  { channel: 'EMAIL', text: 'Welcome email → Jordan T. (Muay Thai trial)', color: '#c084fc' },
  { channel: 'AUTO', text: 'No-show detected → DM Thompson (recovery fired)', color: '#dc2626' },
  { channel: 'SMS', text: 'Follow-up → Alex R. (post-class check-in)', color: '#60a5fa' },
  { channel: 'EMAIL', text: 'Enrollment nudge → Taylor M. (tier 2 membership)', color: '#c084fc' },
  { channel: 'AUTO', text: 'Google review request → Sofia R. (5★)', color: '#facc15' },
  { channel: 'SMS', text: 'Reschedule confirmed → Marcus C. → Saturday 11AM', color: '#22c55e' },
  { channel: 'AUTO', text: 'Lapsed student winback → Priya N. (30-day)', color: '#f97316' },
  { channel: 'SMS', text: 'Day-of nudge → Kai W. (La Jolla 7PM)', color: '#60a5fa' },
  { channel: 'EMAIL', text: 'Instructor intro → new parent (Kids program)', color: '#c084fc' },
  { channel: 'AUTO', text: 'Birthday wish → Carlos M. (member for 18 mo)', color: '#d4a017' },
];

export default function AdminHoursSavedDashboard() {
  const [operator, setOperator] = useState<Operator>('owner');
  const [hourlyRate, setHourlyRate] = useState(75);
  const [feedItems, setFeedItems] = useState<{ id: number; channel: string; text: string; color: string; time: string }[]>([]);
  const feedIdRef = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [animatedHours, setAnimatedHours] = useState(0);

  // Reveal animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !revealed) setRevealed(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealed]);

  // Live feed ticker
  useEffect(() => {
    if (!revealed) return;
    const addEvent = () => {
      const ev = LIVE_FEED_EVENTS[Math.floor(Math.random() * LIVE_FEED_EVENTS.length)];
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setFeedItems((prev) => [
        { id: feedIdRef.current++, ...ev, time: now },
        ...prev,
      ].slice(0, 10));
    };
    addEvent();
    const iv = setInterval(addEvent, 1800);
    return () => clearInterval(iv);
  }, [revealed]);

  const totalManualDay = useMemo(() => {
    const key = operator === 'owner' ? 'owner' : 'frontDesk';
    return TASKS.reduce((sum, t) => sum + t.manualMinutes[key as 'owner' | 'frontDesk'], 0);
  }, [operator]);

  const totalMbDay = useMemo(() => TASKS.reduce((sum, t) => sum + t.manualMinutes.matboss, 0), []);
  const savedMinutesDay = totalManualDay - totalMbDay;
  const savedHoursDay = savedMinutesDay / 60;
  const savedHoursWeek = savedHoursDay * 6; // 6 operating days
  const savedHoursMonth = savedHoursWeek * 4.3;
  const savedHoursYear = savedHoursWeek * 52;
  const savedDollarsYear = Math.round(savedHoursYear * hourlyRate);

  // Animate weekly hours when operator changes
  useEffect(() => {
    if (!revealed) return;
    const start = animatedHours;
    const delta = savedHoursWeek - start;
    const duration = 700;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedHours(start + delta * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedHoursWeek, revealed]);

  return (
    <section ref={ref} className="my-24 scroll-mt-32" id="demo-admin-hours">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dojo-red/40 to-dojo-red/60" />
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest whitespace-nowrap">
          Before / After Dashboard · 05 / 06
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dojo-red/40 to-dojo-red/60" />
      </div>

      <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide leading-tight">
        THE ADMIN HOURS SAVED DASHBOARD
      </h2>
      <p className="mt-3 text-dojo-red font-mono text-xs uppercase tracking-[0.25em]">
        Your week back. Quantified. Priced in dollars.
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        Martial arts school owners are hands-on operators. You feel the weight of admin in your bones. Here's exactly how many hours you bleed every week doing work a machine does better — and what your time is worth.
      </p>

      <div className="mt-8 rounded-2xl border border-dojo-red/20 bg-dojo-dark/80 backdrop-blur-sm overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-dojo-red animate-pulse" />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
              Time Audit · Typical San Diego Dojo
            </span>
          </div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            6-day week · 52 weeks/year
          </div>
        </div>

        {/* Operator toggle */}
        <div className="flex flex-wrap border-b border-white/5">
          <OperatorButton active={operator === 'owner'} onClick={() => setOperator('owner')} label="👤 Owner does everything" />
          <OperatorButton active={operator === 'front-desk'} onClick={() => setOperator('front-desk')} label="🏢 Front desk handles it" />
          <OperatorButton active={operator === 'matboss'} onClick={() => setOperator('matboss')} label="⚡ MatBoss handles it" highlight />
        </div>

        {/* Hourly rate input */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Your hourly value
            </label>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl text-dojo-gold">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
                className="w-20 rounded bg-dojo-carbon border border-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:border-dojo-gold"
              />
              <span className="text-xs text-gray-500">/hour</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Current scenario: <span className="text-white">
              {operator === 'owner' ? 'You handle admin' :
               operator === 'front-desk' ? 'Front desk paid $22/h' :
               'MatBoss runs on autopilot'}
            </span>
          </div>
        </div>

        {/* Two-column compare */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* LEFT: Manual column */}
          <div className="p-6 border-r border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono text-dojo-red uppercase tracking-widest">
                ✕ Manual Process
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                {operator === 'owner' ? 'Owner time' : operator === 'front-desk' ? 'Front desk time' : 'Still required'}
              </div>
            </div>
            <div className="space-y-2">
              {TASKS.map((task) => {
                const minutes = operator === 'matboss' ? task.manualMinutes.owner : task.manualMinutes[operator === 'owner' ? 'owner' : 'frontDesk'];
                return (
                  <TaskRow key={task.id} task={task} minutes={minutes} isManual />
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-dojo-red/20 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
                Total per day
              </span>
              <span className="font-heading text-2xl text-dojo-red"
                    style={{ textShadow: '0 0 15px rgba(220,38,38,0.5)' }}>
                {Math.floor(totalManualDay / 60)}h {totalManualDay % 60}m
              </span>
            </div>
          </div>

          {/* RIGHT: With MatBoss */}
          <div className="p-6 bg-gradient-to-br from-green-500/5 via-transparent to-dojo-gold/5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
                ✓ With MatBoss
              </div>
              <div className="text-[10px] font-mono text-gray-500">Automated</div>
            </div>
            <div className="space-y-2">
              {TASKS.map((task) => (
                <TaskRow key={task.id} task={task} minutes={task.manualMinutes.matboss} isManual={false} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-green-500/20 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
                Total per day
              </span>
              <span className="font-heading text-2xl text-green-400"
                    style={{ textShadow: '0 0 15px rgba(34,197,94,0.5)' }}>
                {Math.floor(totalMbDay / 60)}h {totalMbDay % 60}m
              </span>
            </div>
          </div>
        </div>

        {/* Big savings banner */}
        <div className="px-6 py-8 bg-gradient-to-r from-dojo-red/5 via-dojo-gold/5 to-dojo-red/5 border-t border-white/5">
          <div className="grid md:grid-cols-4 gap-6">
            <BigStat label="Hours/day saved" value={savedHoursDay.toFixed(1)} suffix="h" color="#d4a017" />
            <BigStat label="Hours/week saved" value={animatedHours.toFixed(1)} suffix="h" color="#d4a017" big />
            <BigStat label="Hours/year saved" value={Math.round(savedHoursYear).toLocaleString()} suffix="h" color="#d4a017" />
            <BigStat label="Dollar value/year" value={`$${savedDollarsYear.toLocaleString()}`} suffix="" color="#22c55e" big />
          </div>
          <div className="mt-6 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-black/40 border border-dojo-gold/20">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                That's{' '}
                <span className="text-dojo-gold">
                  {Math.round(savedHoursMonth / 4.3 / 5)} full working days/month
                </span>
                {' '}handed back to you.
              </span>
            </div>
          </div>
        </div>

        {/* Live task feed */}
        <div className="border-t border-white/5 bg-black/40">
          <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
                Live Automation Feed — Happening Right Now
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-600">{feedItems.length} events</span>
          </div>
          <div className="p-4 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
            {feedItems.length === 0 ? (
              <div className="text-gray-700">$ waiting for automation events...</div>
            ) : (
              feedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-1 animate-[slideUp_0.5s_ease-out]"
                >
                  <span className="text-gray-600">[{item.time}]</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest border"
                    style={{ color: item.color, borderColor: `${item.color}40` }}
                  >
                    {item.channel}
                  </span>
                  <span className="text-gray-300">{item.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OperatorButton({ active, onClick, label, highlight = false }: {
  active: boolean; onClick: () => void; label: string; highlight?: boolean;
}) {
  const activeColor = highlight ? 'border-dojo-gold text-dojo-gold bg-dojo-gold/10' : 'border-dojo-red text-dojo-red bg-dojo-red/10';
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[180px] py-4 px-6 text-[11px] font-mono uppercase tracking-widest transition-all border-b-2 ${
        active ? activeColor : 'text-gray-600 hover:text-gray-400 border-transparent'
      }`}
    >
      {label}
    </button>
  );
}

function TaskRow({ task, minutes, isManual }: { task: AdminTask; minutes: number; isManual: boolean }) {
  const color = isManual ? '#dc2626' : '#22c55e';
  const maxWidth = 60;
  const pct = Math.min(100, (minutes / maxWidth) * 100);

  return (
    <div className="rounded-lg bg-black/30 border border-white/5 p-3 group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base">{task.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-white font-semibold truncate">{task.name}</div>
            <div className="text-[9px] text-gray-600 truncate">{task.description}</div>
          </div>
        </div>
        <div className="font-mono text-xs ml-2" style={{ color }}>
          {minutes === 0 ? '0m ⚡' : `${minutes}m`}
        </div>
      </div>
      <div className="h-0.5 bg-dojo-carbon rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, minutes > 0 ? 4 : 0)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function BigStat({ label, value, suffix, color, big = false }: {
  label: string; value: string; suffix: string; color: string; big?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">{label}</div>
      <div
        className={`font-heading ${big ? 'text-4xl md:text-5xl' : 'text-3xl'}`}
        style={{ color, textShadow: `0 0 18px ${color}50` }}
      >
        {value}{suffix && <span className="text-2xl ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
