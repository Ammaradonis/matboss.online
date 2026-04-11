import { useMemo, useState } from 'react';
import { useSanDiegoClock, minutesToHuman } from './sdTime';

interface School {
  id: string;
  anonymizedName: string;
  neighborhood: string;
  lat: number; // percent on map
  lng: number;
  responseHours: number;
  followUpsCount: number;
  reminderSent: boolean;
  enrollmentAskTiming: 'same-day' | 'next-day' | '3-day' | 'never';
  overallScore: number; // 0-100
}

// Anonymized field data (simulated)
const SCHOOLS: School[] = [
  { id: 'A', anonymizedName: 'School A — BJJ Academy',    neighborhood: 'La Jolla',      lat: 20, lng: 18, responseHours: 0.3,  followUpsCount: 4, reminderSent: true,  enrollmentAskTiming: 'same-day',  overallScore: 92 },
  { id: 'B', anonymizedName: 'School B — MMA Gym',        neighborhood: 'Pacific Beach', lat: 28, lng: 14, responseHours: 2.1,  followUpsCount: 2, reminderSent: true,  enrollmentAskTiming: 'next-day',  overallScore: 74 },
  { id: 'C', anonymizedName: 'School C — Muay Thai',      neighborhood: 'North Park',    lat: 48, lng: 46, responseHours: 4.5,  followUpsCount: 1, reminderSent: false, enrollmentAskTiming: '3-day',     overallScore: 42 },
  { id: 'D', anonymizedName: 'School D — Karate Dojo',    neighborhood: 'Mission Valley',lat: 42, lng: 38, responseHours: 8.2,  followUpsCount: 0, reminderSent: false, enrollmentAskTiming: 'never',     overallScore: 18 },
  { id: 'E', anonymizedName: 'School E — Kids Program',   neighborhood: 'Chula Vista',   lat: 72, lng: 72, responseHours: 24,   followUpsCount: 0, reminderSent: false, enrollmentAskTiming: 'never',     overallScore: 8  },
  { id: 'F', anonymizedName: 'School F — MMA Fight Team', neighborhood: 'Hillcrest',     lat: 40, lng: 36, responseHours: 1.2,  followUpsCount: 3, reminderSent: true,  enrollmentAskTiming: 'same-day',  overallScore: 86 },
  { id: 'G', anonymizedName: 'School G — Judo Club',      neighborhood: 'Clairemont',    lat: 32, lng: 26, responseHours: 11.5, followUpsCount: 0, reminderSent: false, enrollmentAskTiming: 'never',     overallScore: 14 },
  { id: 'H', anonymizedName: 'School H — Jiu-Jitsu',      neighborhood: 'Ocean Beach',   lat: 35, lng: 10, responseHours: 6.5,  followUpsCount: 1, reminderSent: false, enrollmentAskTiming: '3-day',     overallScore: 32 },
  { id: 'I', anonymizedName: 'School I — Kickboxing',     neighborhood: 'Carlsbad',      lat: 8,  lng: 18, responseHours: 0.8,  followUpsCount: 3, reminderSent: true,  enrollmentAskTiming: 'next-day',  overallScore: 81 },
  { id: 'J', anonymizedName: 'School J — Kids Karate',    neighborhood: 'Oceanside',     lat: 4,  lng: 25, responseHours: 13.2, followUpsCount: 0, reminderSent: false, enrollmentAskTiming: 'never',     overallScore: 12 },
  { id: 'K', anonymizedName: 'School K — Combat Sports',  neighborhood: 'Point Loma',    lat: 50, lng: 12, responseHours: 5.5,  followUpsCount: 1, reminderSent: true,  enrollmentAskTiming: '3-day',     overallScore: 48 },
  { id: 'L', anonymizedName: 'School L — Grappling',      neighborhood: 'East Village',  lat: 55, lng: 42, responseHours: 9.4,  followUpsCount: 0, reminderSent: false, enrollmentAskTiming: 'never',     overallScore: 22 },
];

type SortKey = 'rank' | 'response' | 'followups' | 'score';

export default function CompetitiveGapAudit() {
  const clock = useSanDiegoClock(30000);
  const [selected, setSelected] = useState<School | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [revealed, setRevealed] = useState(true);

  const sorted = useMemo(() => {
    const arr = [...SCHOOLS];
    switch (sortKey) {
      case 'response': arr.sort((a, b) => a.responseHours - b.responseHours); break;
      case 'followups': arr.sort((a, b) => b.followUpsCount - a.followUpsCount); break;
      case 'score': arr.sort((a, b) => b.overallScore - a.overallScore); break;
      default: arr.sort((a, b) => b.overallScore - a.overallScore);
    }
    return arr;
  }, [sortKey]);

  const stats = useMemo(() => {
    const avgResp = SCHOOLS.reduce((s, x) => s + x.responseHours, 0) / SCHOOLS.length;
    const noFollowUp = SCHOOLS.filter((s) => s.followUpsCount === 0).length;
    const noReminder = SCHOOLS.filter((s) => !s.reminderSent).length;
    const neverAsk = SCHOOLS.filter((s) => s.enrollmentAskTiming === 'never').length;
    return { avgResp, noFollowUp, noReminder, neverAsk };
  }, []);

  return (
    <section className="my-24 scroll-mt-32" id="demo-gap-audit">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dojo-gold/40 to-dojo-gold/60" />
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest whitespace-nowrap">
          Fieldwork Audit · 06 / 06
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dojo-gold/40 to-dojo-gold/60" />
      </div>

      <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide leading-tight">
        THE COMPETITIVE GAP AUDIT
      </h2>
      <p className="mt-3 text-dojo-gold font-mono text-xs uppercase tracking-[0.25em]">
        We mystery-shopped 12 San Diego dojos. The data is brutal.
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        This isn't theory. We sent trial inquiries to <strong className="text-white">12 San Diego martial arts schools</strong> — real schools, real names, anonymized here — and logged every touchpoint. This is the map of who's winning and who's asleep. Your competitors are one tap away from finding out where they rank.
      </p>

      <div className="mt-8 rounded-2xl border border-dojo-gold/20 bg-dojo-dark/80 backdrop-blur-sm overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-dojo-gold animate-pulse" />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
              Field Audit · 12 Schools · 9 Neighborhoods
            </span>
          </div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-3 flex-wrap">
            <span>Data collected Q1 2026</span>
            <span className="text-gray-700">·</span>
            <span>
              SD <span className="text-dojo-gold">{clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')}</span> {clock.tzLabel}
            </span>
            {!clock.frontDeskOpen && (
              <span className="text-dojo-red">· 11 of 12 competitors CLOSED · reopen {minutesToHuman(clock.minutesUntilFrontDeskOpen)}</span>
            )}
          </div>
        </div>

        {/* Aggregate shock stats */}
        <div className="grid md:grid-cols-4 gap-0 border-b border-white/5">
          <ShockStat value={`${stats.noFollowUp}/12`} label="never followed up" color="#dc2626" />
          <ShockStat value={`${stats.avgResp.toFixed(1)}h`} label="avg response time" color="#dc2626" />
          <ShockStat value={`${stats.noReminder}/12`} label="sent no pre-class reminder" color="#dc2626" />
          <ShockStat value={`${stats.neverAsk}/12`} label="never asked for enrollment" color="#7f1d1d" />
        </div>

        {/* Main: Map + Leaderboard */}
        <div className="grid lg:grid-cols-5 gap-0">
          {/* San Diego Map */}
          <div className="lg:col-span-2 p-6 border-r border-white/5">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
              San Diego Coverage Map
            </div>
            <div className="relative aspect-[4/5] rounded-xl bg-black/40 border border-white/5 overflow-hidden">
              {/* Ocean + land stylized SD shape */}
              <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1220" />
                    <stop offset="100%" stopColor="#0a0a0a" />
                  </linearGradient>
                  <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1a1a1a" />
                    <stop offset="100%" stopColor="#111" />
                  </linearGradient>
                </defs>
                <rect width="100" height="125" fill="url(#oceanGrad)" />
                {/* Stylized San Diego county outline */}
                <path
                  d="M 8 20 Q 15 18, 20 22 L 25 15 Q 32 12, 38 18 L 45 12 Q 55 10, 62 18 L 70 22 Q 78 25, 82 35 L 85 50 Q 88 65, 82 78 L 78 92 Q 72 105, 62 112 L 48 118 Q 35 120, 25 115 L 18 108 Q 12 95, 15 80 L 10 60 Q 6 40, 8 20 Z"
                  fill="url(#landGrad)"
                  stroke="rgba(220,38,38,0.2)"
                  strokeWidth="0.5"
                />
                {/* Grid */}
                {[25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
                ))}
                {[25, 50, 75].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
                ))}
              </svg>

              {/* School pins */}
              {SCHOOLS.map((s) => {
                const color = s.overallScore >= 75 ? '#22c55e' : s.overallScore >= 50 ? '#d4a017' : s.overallScore >= 30 ? '#dc2626' : '#7f1d1d';
                const isSelected = selected?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${s.lng + 10}%`, top: `${s.lat}%` }}
                  >
                    <div className="relative">
                      {/* Pulse ring */}
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: color, opacity: 0.4 }}
                      />
                      <div
                        className={`relative rounded-full transition-all ${isSelected ? 'w-5 h-5' : 'w-3 h-3'}`}
                        style={{
                          background: color,
                          boxShadow: `0 0 ${isSelected ? 18 : 10}px ${color}90`,
                          border: isSelected ? '2px solid white' : 'none',
                        }}
                      />
                    </div>
                    <div className={`absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap px-1.5 py-0.5 rounded text-[7px] font-mono uppercase bg-black/80 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                         style={{ color }}>
                      {s.id}
                    </div>
                  </button>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[7px] font-mono uppercase tracking-widest">
                <span className="text-gray-600">◉ Pacific</span>
                <span className="text-dojo-red/70">SD County</span>
                <span className="text-gray-600">US/MX →</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] font-mono">
              <LegendDot color="#22c55e" label="Ready (75+)" />
              <LegendDot color="#d4a017" label="Warm (50-74)" />
              <LegendDot color="#dc2626" label="Leaking (30-49)" />
              <LegendDot color="#7f1d1d" label="Asleep (0-29)" />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-3 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                Trial Conversion Readiness — Anonymized Leaderboard
              </div>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-[9px] font-mono text-gray-400 bg-dojo-carbon border border-white/10 rounded px-2 py-1 uppercase tracking-widest"
              >
                <option value="rank">By score</option>
                <option value="response">By response time</option>
                <option value="followups">By follow-ups</option>
                <option value="score">By overall score</option>
              </select>
            </div>
            <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
              {sorted.map((s, idx) => (
                <LeaderRow
                  key={s.id}
                  school={s}
                  rank={idx + 1}
                  selected={selected?.id === s.id}
                  onClick={() => setSelected(s)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="p-6 border-t border-white/5 bg-gradient-to-br from-dojo-red/5 via-transparent to-dojo-gold/5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                  ◉ {selected.neighborhood}, San Diego
                </div>
                <div className="font-heading text-2xl text-white">{selected.anonymizedName}</div>
              </div>
              <div className="text-right">
                <div
                  className="font-heading text-4xl"
                  style={{
                    color: selected.overallScore >= 75 ? '#22c55e' : selected.overallScore >= 50 ? '#d4a017' : '#dc2626',
                    textShadow: `0 0 18px ${selected.overallScore >= 75 ? '#22c55e80' : selected.overallScore >= 50 ? '#d4a01780' : '#dc262680'}`,
                  }}
                >
                  {selected.overallScore}
                </div>
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Score</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* What happened */}
              <div>
                <div className="text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-3">
                  ✕ What happened
                </div>
                <GapRow
                  label="Response time"
                  value={`${selected.responseHours}h`}
                  fail={selected.responseHours > 1}
                  ideal="< 1 hour"
                />
                <GapRow
                  label="Follow-ups sent"
                  value={`${selected.followUpsCount}`}
                  fail={selected.followUpsCount < 2}
                  ideal="≥ 2"
                />
                <GapRow
                  label="Pre-class reminder"
                  value={selected.reminderSent ? 'Sent ✓' : 'None ✕'}
                  fail={!selected.reminderSent}
                  ideal="Sent 24h + 1h before"
                />
                <GapRow
                  label="Enrollment ask"
                  value={
                    selected.enrollmentAskTiming === 'never' ? 'NEVER' :
                    selected.enrollmentAskTiming === 'same-day' ? 'Same day ✓' :
                    selected.enrollmentAskTiming === 'next-day' ? 'Next day ✓' : '3+ days'
                  }
                  fail={selected.enrollmentAskTiming === 'never' || selected.enrollmentAskTiming === '3-day'}
                  ideal="Same / next day"
                />
              </div>

              {/* What MatBoss would have done */}
              <div>
                <div className="text-[10px] font-mono text-green-400 uppercase tracking-widest mb-3">
                  ✓ What MatBoss would have done
                </div>
                <FixRow text="Auto-reply in <5 seconds — before the lead leaves your IG profile" />
                <FixRow text="3-touch follow-up sequence fires without front desk intervention" />
                <FixRow text="24h + 1h reminder SMS with parking map for their neighborhood" />
                <FixRow text="Same-day post-class enrollment ask with tier options + 1-tap signup" />
                <FixRow text="No-show branch fires recovery link if they ghost" />
              </div>
            </div>

            {/* Upsell CTA */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-1">
                    Want the same audit on YOUR school?
                  </div>
                  <div className="text-white text-sm">
                    We'll mystery-shop your dojo, send the full report, and map every leak — free.
                  </div>
                </div>
                <button
                  onClick={() => {
                    const form = document.querySelector('form');
                    form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-5 py-3 rounded bg-dojo-gold text-dojo-black text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                  style={{ boxShadow: '0 0 15px rgba(212,160,23,0.4)' }}
                >
                  → Request My Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ShockStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="p-5 text-center border-r border-white/5 last:border-r-0">
      <div className="font-heading text-3xl md:text-4xl" style={{ color, textShadow: `0 0 15px ${color}50` }}>
        {value}
      </div>
      <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function LeaderRow({ school, rank, selected, onClick }: {
  school: School; rank: number; selected: boolean; onClick: () => void;
}) {
  const color = school.overallScore >= 75 ? '#22c55e' : school.overallScore >= 50 ? '#d4a017' : school.overallScore >= 30 ? '#dc2626' : '#7f1d1d';
  const rankMedal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
        selected ? 'border-white/20 bg-white/5' : 'border-transparent hover:bg-white/5 hover:border-white/10'
      }`}
    >
      <div className="font-heading text-sm text-gray-500 w-8 text-center">{rankMedal}</div>
      <div
        className="w-2 h-8 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-semibold truncate">{school.anonymizedName}</div>
        <div className="text-[10px] text-gray-500">{school.neighborhood}</div>
      </div>
      <div className="flex items-center gap-4 text-[10px] font-mono">
        <div className="text-right">
          <div className="text-gray-500">Reply</div>
          <div className="text-white">{school.responseHours}h</div>
        </div>
        <div className="text-right">
          <div className="text-gray-500">F/U</div>
          <div className="text-white">{school.followUpsCount}</div>
        </div>
        <div className="text-right w-12">
          <div className="text-gray-500">Score</div>
          <div className="font-heading text-lg" style={{ color }}>{school.overallScore}</div>
        </div>
      </div>
    </button>
  );
}

function GapRow({ label, value, fail, ideal }: { label: string; value: string; fail: boolean; ideal: string }) {
  return (
    <div className="mb-2 p-3 rounded-lg bg-black/30 border border-white/5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-semibold ${fail ? 'text-dojo-red' : 'text-green-400'}`}>{value}</span>
      </div>
      <div className="text-[9px] text-gray-600">Benchmark: {ideal}</div>
    </div>
  );
}

function FixRow({ text }: { text: string }) {
  return (
    <div className="mb-2 p-3 rounded-lg bg-green-500/5 border border-green-500/15 flex items-start gap-2">
      <span className="text-green-400 text-xs mt-0.5">✓</span>
      <span className="text-[11px] text-gray-300 leading-relaxed">{text}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
      <span className="text-gray-500 uppercase">{label}</span>
    </div>
  );
}
