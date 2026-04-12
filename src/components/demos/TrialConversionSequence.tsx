import { useMemo, useState } from 'react';
import { useSanDiegoClock } from './sdTime';

type MartialArt = 'BJJ' | 'Muay Thai' | 'Karate' | 'MMA' | 'Judo' | 'Kids';
type Branch = 'showed-up' | 'no-show' | 'positive' | 'silent';

const ARTS: { id: MartialArt; label: string; emoji: string; wear: string; expect: string }[] = [
  { id: 'BJJ', label: 'Brazilian Jiu-Jitsu', emoji: '🥋', wear: 'a gi (we have rentals) or rashguard + grappling shorts', expect: 'drilling takedowns and basic guard control — no live rolling on day one' },
  { id: 'Muay Thai', label: 'Muay Thai', emoji: '🥊', wear: 'athletic shorts, comfortable shirt. Handwraps provided', expect: 'technique drilling on pads — no sparring until week three' },
  { id: 'Karate', label: 'Karate', emoji: '🥋', wear: 'loose-fitting clothes or a gi if you have one', expect: 'basic stances, kihon, and white-belt forms — respect the dojo' },
  { id: 'MMA', label: 'Mixed Martial Arts', emoji: '🥊', wear: 'compression shorts, rashguard, mouthguard if you have one', expect: 'standup fundamentals and positional work — no contact sparring' },
  { id: 'Judo', label: 'Judo', emoji: '🥋', wear: 'a gi (we have rentals), no shoes on the mat', expect: 'ukemi (breakfalls) and grip fighting basics — bow in, bow out' },
  { id: 'Kids', label: 'Kids Program', emoji: '🥋', wear: 'any athletic clothes, water bottle, and a good attitude', expect: 'games, discipline drills, and basic movement — parents welcome to watch' },
];

interface Step {
  id: number;
  stepLabel: string;
  time: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  title: string;
  preview: string;
  fullBody: (name: string, school: string, art: typeof ARTS[number]) => string;
  branches: Record<Branch, { nextId: number | null; note: string }>;
}

const STEPS: Step[] = [
  {
    id: 1,
    stepLabel: 'STEP 1',
    time: 'T + 0 min',
    channel: 'SMS',
    title: 'Instant booking confirmation',
    preview: 'Welcome to the mat. Your trial is locked in.',
    fullBody: (name, school, art) =>
      `Hey ${name} — welcome to ${school}. Your ${art.label} trial is confirmed. Instructor: Sensei Carlos Mendez. Address: 2847 University Ave, San Diego. What to wear: ${art.wear}. What to bring: water bottle, a clean towel. Reply STOP to opt out.`,
    branches: {
      'showed-up': { nextId: 2, note: 'Main sequence → continues to 24h reminder' },
      'no-show': { nextId: 2, note: 'Main sequence → continues to 24h reminder' },
      'positive': { nextId: 2, note: 'Main sequence → continues to 24h reminder' },
      'silent': { nextId: 2, note: 'Main sequence → continues to 24h reminder' },
    },
  },
  {
    id: 2,
    stepLabel: 'STEP 2',
    time: 'T + 24h before class',
    channel: 'SMS',
    title: '24-hour pre-class reminder',
    preview: "Tomorrow's the day. Here's what to expect on the mat.",
    fullBody: (name, school, art) =>
      `Tomorrow at 6:30 PM, ${name}. Your first ${art.label} class at ${school}. What to expect: ${art.expect}. Arrive 15 min early so Sensei Carlos can get you warmed up and meet the crew. Nervous is normal — everyone on the mat started exactly where you are.`,
    branches: {
      'showed-up': { nextId: 3, note: 'Main sequence → continues to day-of nudge' },
      'no-show': { nextId: 3, note: 'Main sequence → continues to day-of nudge' },
      'positive': { nextId: 3, note: 'Main sequence → continues to day-of nudge' },
      'silent': { nextId: 3, note: 'Main sequence → continues to day-of nudge' },
    },
  },
  {
    id: 3,
    stepLabel: 'STEP 3',
    time: 'T - 1:00 (day of)',
    channel: 'SMS',
    title: 'Day-of reminder with map pin',
    preview: 'Parking + address + last-mile nudge.',
    fullBody: (name, school, _art) =>
      `${name}, we're expecting you in 60 min at ${school}. Google Maps link: maps.google.com/?q=2847+University+Ave+SanDiego. Parking note: FREE lot behind the building, entry on Florida St. Your first class is on the house — just show up. — Coach Carlos`,
    branches: {
      'showed-up': { nextId: 4, note: 'Student checked in → continues to post-class' },
      'no-show': { nextId: 7, note: '⚠️ BRANCH → No-show recovery sequence fires' },
      'positive': { nextId: 4, note: 'Student checked in → continues to post-class' },
      'silent': { nextId: 4, note: 'Student checked in → continues to post-class' },
    },
  },
  {
    id: 4,
    stepLabel: 'STEP 4',
    time: 'T + 2h after class',
    channel: 'SMS',
    title: 'Post-class follow-up',
    preview: 'How was your first class? Simple reply prompt.',
    fullBody: (name, _school, art) =>
      `Hey ${name} — how did your first ${art.label} class feel? Reply with a number: 1 (loved it), 2 (good but tough), 3 (not for me). No wrong answer. We read every reply personally. — Sensei Carlos`,
    branches: {
      'showed-up': { nextId: 5, note: 'Neutral path → 24h enrollment nudge' },
      'no-show': { nextId: null, note: 'Skipped (no class attended)' },
      'positive': { nextId: 5, note: '✨ BRANCH → Positive path: softer enrollment ask' },
      'silent': { nextId: 6, note: '⚠️ BRANCH → Silent path: 72h soft re-engage' },
    },
  },
  {
    id: 5,
    stepLabel: 'STEP 5',
    time: 'T + 24h after class',
    channel: 'EMAIL',
    title: 'Enrollment nudge',
    preview: 'Membership options, next class, direct sign-up link.',
    fullBody: (name, school, art) =>
      `Subject: Ready to make it official, ${name}? — Rich HTML email showing: 3 membership tiers (Foundation, Warrior, Lifer), ${art.label} class schedule for the week, testimonial video from a student who walked the same path, one-click sign-up link. Branded header. Signed by owner. ${school} crest in footer.`,
    branches: {
      'showed-up': { nextId: 6, note: 'If no click within 48h → final follow-up' },
      'no-show': { nextId: null, note: 'Skipped' },
      'positive': { nextId: 6, note: 'If still no sign-up → 72h soft touch' },
      'silent': { nextId: 6, note: 'Moves to final follow-up' },
    },
  },
  {
    id: 6,
    stepLabel: 'STEP 6',
    time: 'T + 72h after class',
    channel: 'SMS',
    title: 'Final follow-up (soft)',
    preview: "Still thinking? Here's a second class on us.",
    fullBody: (name, school, _art) =>
      `${name}, no pressure — just checking in. A lot of folks take a beat before committing. If you're still deciding, come back for one more class on the house this weekend. No sales pitch, just more mat time. Reply YES and I'll put you on the list. — Sensei Carlos, ${school}`,
    branches: {
      'showed-up': { nextId: null, note: 'Sequence complete. Lead moved to long-nurture.' },
      'no-show': { nextId: null, note: 'Sequence complete' },
      'positive': { nextId: null, note: 'Sequence complete. Lead tagged "hot prospect".' },
      'silent': { nextId: null, note: 'Sequence complete. Lead moved to monthly nurture.' },
    },
  },
  // Branch: no-show recovery
  {
    id: 7,
    stepLabel: '⚠ RECOVERY',
    time: 'T + 15 min after missed class',
    channel: 'SMS',
    title: 'No-show recovery sequence',
    preview: 'We missed you. Want to reschedule?',
    fullBody: (name, school, art) =>
      `${name}, we noticed you didn't make it to ${art.label} tonight. Life happens — zero judgment. Want to grab another slot? Tap: matboss.online/rbk/${Math.random().toString(36).slice(2, 7)}. Next class is Thursday 6:30 PM. — ${school}`,
    branches: {
      'showed-up': { nextId: null, note: 'n/a' },
      'no-show': { nextId: null, note: 'Lead recovered or moved to 48h follow-up' },
      'positive': { nextId: null, note: 'n/a' },
      'silent': { nextId: null, note: 'n/a' },
    },
  },
];

const BRANCH_META: { id: Branch; label: string; color: string; description: string }[] = [
  { id: 'showed-up', label: 'Showed Up', color: '#22c55e', description: 'Student checked in — main sequence continues.' },
  { id: 'no-show', label: 'Didn\'t Show', color: '#dc2626', description: 'Triggers recovery branch with reschedule link.' },
  { id: 'positive', label: 'Responded Positively', color: '#d4a017', description: 'Tagged hot. Softer enrollment ask.' },
  { id: 'silent', label: 'Went Silent', color: '#6b7280', description: 'Extra breathing room, softer re-engage copy.' },
];

export default function TrialConversionSequence() {
  const clock = useSanDiegoClock(30000);
  const [studentName, setStudentName] = useState('Alex Rivera');
  const [schoolName, setSchoolName] = useState('Pacific Coast BJJ');
  const [artId, setArtId] = useState<MartialArt>('BJJ');
  const [branch, setBranch] = useState<Branch>('showed-up');
  const [activeId, setActiveId] = useState(1);

  const art = useMemo(() => ARTS.find((a) => a.id === artId) ?? ARTS[0], [artId]);
  const activeStep = useMemo(() => STEPS.find((s) => s.id === activeId) ?? STEPS[0], [activeId]);
  const activeBranch = useMemo(
    () => BRANCH_META.find((b) => b.id === branch) ?? BRANCH_META[0],
    [branch]
  );

  // Determine which steps are visible for the current branch
  const visibleSteps = useMemo(() => {
    const main = STEPS.filter((s) => s.id <= 6);
    if (branch === 'no-show') {
      return [...main.slice(0, 3), STEPS.find((s) => s.id === 7)!];
    }
    return main;
  }, [branch]);

  return (
    <section className="my-24 scroll-mt-32" id="demo-trial-sequence">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dojo-red/40 to-dojo-red/60" />
        <span className="text-[10px] font-mono text-dojo-red uppercase tracking-widest whitespace-nowrap">
          Clickable Walkthrough · 03 / 06
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dojo-red/40 to-dojo-red/60" />
      </div>

      <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide leading-tight">
        THE 72-HOUR CONVERSION SEQUENCE
      </h2>
      <p className="mt-3 text-dojo-red font-mono text-xs uppercase tracking-[0.25em]">
        Every touchpoint. Every branch. Zero left to chance.
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        Click any step to see the full message. Switch branches to watch the logic adapt. This is the full 72-hour journey <em className="text-white not-italic">every prospective student</em> currently leaves to luck — or to a front desk that forgets.
      </p>

      <div className="mt-8 rounded-2xl border border-dojo-red/20 bg-dojo-dark/80 backdrop-blur-sm overflow-hidden">
        {/* Top control bar */}
        <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-dojo-red animate-pulse" />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
              Sequence Prototype · {activeBranch.label} Path
            </span>
          </div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-3 flex-wrap">
            <span>{visibleSteps.length} steps · branching logic active</span>
            <span className="text-gray-700">·</span>
            <span>
              SD <span className="text-dojo-gold">{clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')}</span> {clock.tzLabel}
            </span>
          </div>
        </div>

        {/* Customization */}
        <div className="p-6 grid md:grid-cols-3 gap-4 border-b border-white/5">
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded bg-dojo-carbon border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-dojo-red"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              School Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full rounded bg-dojo-carbon border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-dojo-red"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
              Martial Art
            </label>
            <select
              value={artId}
              onChange={(e) => setArtId(e.target.value as MartialArt)}
              className="w-full rounded bg-dojo-carbon border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-dojo-red"
            >
              {ARTS.map((a) => (
                <option key={a.id} value={a.id}>{a.emoji} {a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Branch selector */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/20">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">
            Branch Logic — Choose What Happens Next
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BRANCH_META.map((b) => (
              <button
                key={b.id}
                onClick={() => { setBranch(b.id); setActiveId(1); }}
                className={`text-left p-3 rounded-lg border transition-all ${
                  branch === b.id
                    ? 'bg-white/5'
                    : 'bg-transparent border-white/5 hover:border-white/10'
                }`}
                style={{
                  borderColor: branch === b.id ? b.color : undefined,
                  boxShadow: branch === b.id ? `0 0 15px ${b.color}30` : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                  <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: b.color }}>
                    {b.label}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 leading-tight">{b.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main area: Step rail + Preview */}
        <div className="grid lg:grid-cols-5 gap-0">
          {/* Step rail */}
          <div className="lg:col-span-2 p-6 border-r border-white/5">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
              Timeline
            </div>
            <div className="space-y-2 relative">
              {/* Vertical connector line */}
              <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-dojo-red/30 via-dojo-red/50 to-dojo-red/30" />

              {visibleSteps.map((step, idx) => {
                const isActive = step.id === activeId;
                const isRecovery = step.id === 7;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveId(step.id)}
                    className={`relative w-full text-left pl-10 pr-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-dojo-red/10 border border-dojo-red/40'
                        : 'border border-transparent hover:bg-white/5'
                    }`}
                  >
                    {/* Timeline node */}
                    <div
                      className={`absolute left-[6px] top-4 w-4 h-4 rounded-full border-2 transition-all ${
                        isActive
                          ? 'bg-dojo-red border-dojo-red'
                          : isRecovery
                            ? 'bg-dojo-blood border-dojo-red'
                            : 'bg-dojo-dark border-white/20'
                      }`}
                      style={{
                        boxShadow: isActive ? '0 0 12px rgba(220,38,38,0.6)' : undefined,
                      }}
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest ${
                          isRecovery ? 'text-dojo-red' : 'text-gray-500'
                        }`}
                      >
                        {step.stepLabel}
                      </span>
                      <span className="text-[9px] font-mono text-gray-600">
                        · {step.time}
                      </span>
                    </div>
                    <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {step.title}
                    </div>
                    <div className="mt-1 text-[10px] text-gray-500 leading-tight">
                      {step.preview}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest ${
                          step.channel === 'SMS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          step.channel === 'EMAIL' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-dojo-gold/10 text-dojo-gold border border-dojo-gold/20'
                        }`}
                      >
                        {step.channel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-3 p-6 bg-black/20">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
              Message Preview — {activeStep.channel}
            </div>

            {/* Phone mockup */}
            <div className="max-w-sm mx-auto">
              {activeStep.channel === 'SMS' && (
                <div className="rounded-[2rem] border-2 border-white/10 bg-dojo-dark p-4">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                    <div className="text-[9px] font-mono text-gray-500">9:41</div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-gray-500" />
                      <div className="w-1 h-1 rounded-full bg-gray-500" />
                      <div className="w-1 h-1 rounded-full bg-gray-500" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] text-gray-500 text-center">{schoolName}</div>
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-dojo-carbon border border-white/5 text-xs text-white leading-relaxed">
                      {activeStep.fullBody(studentName, schoolName, art)}
                    </div>
                    <div className="text-[9px] text-gray-600 text-right">
                      Delivered · {activeStep.time}
                    </div>
                  </div>
                </div>
              )}

              {activeStep.channel === 'EMAIL' && (
                <div className="rounded-xl border border-white/10 bg-dojo-dark overflow-hidden">
                  <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-dojo-red" />
                    <div className="w-2 h-2 rounded-full bg-dojo-gold" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="ml-2 text-[9px] font-mono text-gray-500">Gmail — {schoolName}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-mono text-gray-500 mb-1">FROM: carlos@{schoolName.toLowerCase().replace(/\s+/g, '')}.com</div>
                    <div className="text-[10px] font-mono text-gray-500 mb-3">TO: {studentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com</div>
                    <div className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                      {activeStep.fullBody(studentName, schoolName, art)}
                    </div>
                  </div>
                </div>
              )}

              {activeStep.channel === 'PUSH' && (
                <div className="rounded-xl border border-dojo-gold/30 bg-dojo-gold/5 p-4">
                  <div className="text-[10px] font-mono text-dojo-gold mb-2">◉ PUSH NOTIFICATION</div>
                  <div className="text-sm text-white">{activeStep.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {activeStep.fullBody(studentName, schoolName, art)}
                  </div>
                </div>
              )}
            </div>

            {/* Branch info */}
            <div className="mt-6 p-4 rounded-lg bg-black/40 border border-white/5">
              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">
                Branching Logic → Current: {activeBranch.label}
              </div>
              <div className="text-xs text-gray-300">
                {activeStep.branches[branch].note}
              </div>
              {activeStep.branches[branch].nextId && (
                <button
                  onClick={() => setActiveId(activeStep.branches[branch].nextId!)}
                  className="mt-3 text-[10px] font-mono text-dojo-red hover:text-white uppercase tracking-widest transition-colors"
                >
                  → Next step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
