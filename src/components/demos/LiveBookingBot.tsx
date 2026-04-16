import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSanDiegoClock, formatSDTimestamp, minutesToHuman, sdNow } from './sdTime';

/* ═══════════════════════════════════════════════════════════════════════════
   THE MATBOSS LIVE BOOKING BOT — Behavioral Conversion System v2.0 🔥💎
   Implements 49 hyper-smart enhancements (25 original + 24 rocket boosters):
   ORIGINAL 25:
   1. Confidence-scored multi-intent detection
   2. Semantic similarity fallback (token-overlap scoring)
   3. Entity memory extraction + skip-known-fields
   4. Sentiment-aware tone modulation with empathy beats
   5. Progressive localStorage profile memory
   6. Dynamic context-aware typing delays + reading-time pacing
   7. Lead scoring engine (+points for signal, -points for resistance)
   8. Dynamic rules-based slot matcher (art, age, location, capacity)
   9. Slot scarcity + social proof (spots left, viewers, recent signups)
  10. Dynamic history-aware quick replies (getSmartReplies)
  11. Location-aware slot personalization (SD neighborhood detection)
  12. Objection-cycle detection + auto-escalation
  13. Objection-specific microproof (kid stats, beginner testimonials)
  14. Objection preemption engine (predict next objection)
  15. Best next move recommender (decision layer)
  16. Conversion mode shift (explore → assist → close)
  17. Micro-commitment funnel (tiny yes → big yes)
  18. Silent escalation of hot leads ("pulling in Carlos")
  19. Human Shadow Mode ("Carlos is typing...")
  20. Sunk cost re-engagement (45s idle nudge at schedule step)
  21. Confidence-based auto-escalation
  22. Post-booking micro-commitment nurture loop
  23. Response-time honesty meter (live SD-time aware baseline)
  24. Intent-aware handoff TL;DR summary
  25. Returning visitor rehydration ("Welcome back, still thinking...")
   ROCKET BOOSTERS (26-49):
  26. Utility-score conversation state optimizer (lowest-friction next action)
  27. Objection decay + resurfacing engine (concerns fade over time)
  28. Slot show-up fit predictor (commute friction, commitment-by-hour, dropout risk)
  29. Multi-turn intent arbitration (clarify/answer/preempt/book/parallel)
  30. Churn-risk vs conversion-readiness dual prediction
  31. Personalized post-booking reason-memory nurture
  32. Predictive calendar availability share
  33. Real-time social proof activity feed (live injected events)
  34. Sentiment-adaptive conversational pacing (fast for excited, slow for nervous)
  35. Self-optimizing A/B rebuttal library (3 variants per objection)
  36. Hyper-local 1-mile geo-fence "Local Legend" offer
  37. Three-strike idle re-engagement sequence (45s/3m/5m escalation)
  38. Reinforcement scoring loop (response patterns → outcomes)
  39. Psychological persona modeling (risk-averse, status-driven, logical, emotional)
  40. Dynamic narrative micro-stories engine
  41. Drop-off prediction + preemptive intervention
  42. Parallel multi-intent answering (answer both + advance funnel)
  43. Momentum Lock commitment amplifier
  44. User-pace mirror adaptive delay engine
  45. Objection graph + cycle breaker
  46. Archetype clustering (4 Warrior Personas)
  47. Mental Mat Tour vivid pre-experience trigger
  48. Self-improving intent memory (session replay learning)
  49. Time-to-class decay + predictive nurture checkpoints
   ═══════════════════════════════════════════════════════════════════════════ */

type Sender = 'bot' | 'user' | 'human';
type MessageKind =
  | 'text'
  | 'quick-replies'
  | 'schedule'
  | 'confirmation'
  | 'escalation'
  | 'empathy'
  | 'clarify'
  | 'post-booking'
  | 'human-shadow'
  | 'rehydrate'
  | 'typing'
  | 'microproof'
  | 'preempt'
  | 'mat-tour'
  | 'live-activity'
  | 'neighborhood-offer'
  | 'story'
  | 'cycle-breaker'
  | 'momentum-lock'
  | 'drop-off-save'
  | 'parallel-answer'
  | 'calendar-share'
  | 'nurture-checkpoint';

type Mode = 'explore' | 'assist' | 'close';
type GeoStatus = 'unknown' | 'local' | 'non-local' | 'shared' | 'denied';
type TravelMode = 'local' | 'visitor' | 'virtual';

type ObjectionKey = 'price' | 'safety' | 'wear' | 'time' | 'insurance' | 'kid-safety';

type Archetype = 'NervousNewbie' | 'BusyParent' | 'EagerAthlete' | 'SkepticalShopper';
type Persona = 'risk-averse' | 'thrill-seeker' | 'price-sensitive' | 'status-driven' | 'logical' | 'emotional';
type BookingReason = 'beginner-friendly' | 'kid-safety' | 'schedule-fit' | 'location-convenience' | 'injury-concern' | 'price-value' | 'exploratory' | 'social-energy';
type ArbitrationMove = 'clarify' | 'answer' | 'preempt' | 'book' | 'parallel';
type IdleStrike = 0 | 1 | 2 | 3;

interface ScheduleSlot {
  id: string;
  day: string;       // Tue, Wed, etc.
  time: string;      // 6:30 PM
  label: string;     // Fundamentals
  art: 'BJJ' | 'Muay Thai' | 'MMA' | 'Karate' | 'Judo' | 'Kids';
  location: SDNeighborhood;
  beginnerFriendly: boolean;
  kidFriendly: boolean;
  spotsLeft: number;
  viewers: number;
  recentSignups: number;
  isoDay: number; // 0=Sun..6=Sat
  hour: number;   // 24h
}

type SDNeighborhood = 'North Park' | 'Pacific Beach' | 'La Jolla' | 'Chula Vista' | 'Hillcrest' | 'Carlsbad';

const SD_LOCATION_COORDS: Record<SDNeighborhood, { lat: number; lng: number }> = {
  'North Park': { lat: 32.7411, lng: -117.1297 },
  'Pacific Beach': { lat: 32.7978, lng: -117.2405 },
  'La Jolla': { lat: 32.8328, lng: -117.2713 },
  'Chula Vista': { lat: 32.6401, lng: -117.0842 },
  'Hillcrest': { lat: 32.7489, lng: -117.1647 },
  'Carlsbad': { lat: 33.1581, lng: -117.3506 },
};

const ZIP_TO_NEIGHBORHOOD: Record<string, SDNeighborhood> = {
  '92103': 'Hillcrest',
  '92104': 'North Park',
  '92109': 'Pacific Beach',
  '92037': 'La Jolla',
  '91910': 'Chula Vista',
  '92008': 'Carlsbad',
};

interface ChatMessage {
  id: number;
  sender: Sender;
  kind: MessageKind;
  text: string;
  quickReplies?: string[];
  scheduleSlots?: ScheduleSlot[];
  tldr?: string;
  matTourScenes?: string[];
  liveActivityKind?: 'booking' | 'viewing' | 'arriving';
  neighborhoodOffer?: { dojo: SDNeighborhood; distanceMi: number; discount: number };
  rebuttalVariantId?: string;
  storyTag?: string;
  nurtureTag?: 'day-minus-3' | 'day-minus-1' | 'day-zero-morning';
  meta?: {
    responseMs?: number;
    intent?: string;
    confidence?: number;
    sentiment?: 'neg' | 'neu' | 'pos';
    archetype?: Archetype;
    persona?: Persona;
  };
}

interface Entities {
  name?: string;
  age?: number;
  kidName?: string;
  kidAge?: number;
  art?: ScheduleSlot['art'];
  experience?: 'Beginner' | 'Some' | 'Experienced';
  location?: SDNeighborhood;
  preferredTime?: 'morning' | 'evening' | 'weekend';
  preferredDay?: 'weekday' | 'weekend' | 'either';
  audienceType?: 'adult' | 'parent' | 'teen';
  budgetHint?: 'value' | 'premium';
  zipCode?: string;
  email?: string;
  phone?: string;
  travelMode?: TravelMode;
}

interface ObjectionDecayRecord {
  firstSeenAt: number;
  lastSeenAt: number;
  intensity: number; // 0..1, decays over time
  rebuttalVariantIds: string[]; // which variants were served
}

interface MemoryLayer {
  objections: ObjectionKey[];
  objectionCounts: Partial<Record<ObjectionKey, number>>;
  objectionDecay: Partial<Record<ObjectionKey, ObjectionDecayRecord>>;
  cycleCount: number;
  hesitations: number;
  engagementScore: number;
  messageCount: number;
  sameMessageTwice: boolean;
  lastUserMessage: string;
  confidenceScore: number; // 1.0 → 0
  unclearCount: number;
  userResponseTimesMs: number[]; // pacing mirror (D1)
  persona?: Persona;
  dropOffRisk: number; // 0..1
  conversionReadiness: number; // 0..1
  churnRisk: number; // 0..1
  storiesShown: string[];
  narrativeBeatsSent: number;
}

interface ConversationState {
  step:
    | 'greeting'
    | 'qualify-audience'
    | 'qualify-art'
    | 'qualify-exp'
    | 'micro-day-pref'
    | 'micro-time-pref'
    | 'schedule'
    | 'confirm'
    | 'escalate'
    | 'done'
    | 'post-booking';
  mode: Mode;
  leadScore: number;
  hotLead: boolean;
  bookedSlot?: ScheduleSlot;
  humanShadowActive: boolean;
  preemptedObjections: ObjectionKey[];
  messagesSent: number;
  archetype?: Archetype;
  bookingReason?: BookingReason;
  idleStrikes: IdleStrike;
  neighborhoodOfferShown: boolean;
  matTourShown: boolean;
  cycleBreakShown: boolean;
  momentumLockActive: boolean;
  dropOffSaveShown: boolean;
  calendarShared: boolean;
  liveActivityTicks: number;
  lastNurtureTick?: number;
  learnedIntentsAppliedAt?: number;
}

/* ─── SCHEDULE DATABASE (dynamic, capacity-aware) ─── */
const BASE_SLOTS: ScheduleSlot[] = [
  { id: 's1', day: 'Tue', time: '6:30 PM', label: 'Fundamentals',       art: 'BJJ',       location: 'North Park',    beginnerFriendly: true,  kidFriendly: false, spotsLeft: 3, viewers: 4, recentSignups: 7, isoDay: 2, hour: 18 },
  { id: 's2', day: 'Wed', time: '7:00 PM', label: 'Beginner BJJ',       art: 'BJJ',       location: 'Pacific Beach', beginnerFriendly: true,  kidFriendly: false, spotsLeft: 2, viewers: 6, recentSignups: 11, isoDay: 3, hour: 19 },
  { id: 's3', day: 'Thu', time: '6:00 PM', label: 'Open Mat',           art: 'BJJ',       location: 'La Jolla',      beginnerFriendly: false, kidFriendly: false, spotsLeft: 5, viewers: 2, recentSignups: 4, isoDay: 4, hour: 18 },
  { id: 's4', day: 'Sat', time: '10:00 AM',label: 'No-Gi Basics',       art: 'BJJ',       location: 'Chula Vista',   beginnerFriendly: true,  kidFriendly: false, spotsLeft: 1, viewers: 8, recentSignups: 14, isoDay: 6, hour: 10 },
  { id: 's5', day: 'Mon', time: '5:30 PM', label: 'Muay Thai Technique',art: 'Muay Thai', location: 'North Park',    beginnerFriendly: true,  kidFriendly: false, spotsLeft: 4, viewers: 3, recentSignups: 6, isoDay: 1, hour: 17 },
  { id: 's6', day: 'Wed', time: '6:00 PM', label: 'MMA Foundations',    art: 'MMA',       location: 'Hillcrest',     beginnerFriendly: true,  kidFriendly: false, spotsLeft: 2, viewers: 5, recentSignups: 9, isoDay: 3, hour: 18 },
  { id: 's7', day: 'Tue', time: '5:00 PM', label: 'Kids BJJ (4-8)',     art: 'Kids',      location: 'Pacific Beach', beginnerFriendly: true,  kidFriendly: true,  spotsLeft: 3, viewers: 7, recentSignups: 12, isoDay: 2, hour: 17 },
  { id: 's8', day: 'Thu', time: '4:30 PM', label: 'Kids Martial Arts',  art: 'Kids',      location: 'Carlsbad',      beginnerFriendly: true,  kidFriendly: true,  spotsLeft: 4, viewers: 3, recentSignups: 8, isoDay: 4, hour: 16 },
  { id: 's9', day: 'Sat', time: '11:30 AM',label: 'Karate Kihon',       art: 'Karate',    location: 'La Jolla',      beginnerFriendly: true,  kidFriendly: false, spotsLeft: 6, viewers: 2, recentSignups: 3, isoDay: 6, hour: 11 },
];

const SD_NEIGHBORHOODS: SDNeighborhood[] = ['North Park', 'Pacific Beach', 'La Jolla', 'Chula Vista', 'Hillcrest', 'Carlsbad'];

/* ─── DOJO COORDS (for 1-mile hyper-local Neighborhood Special) ─── */
const DOJO_COORDS: Record<SDNeighborhood, { lat: number; lng: number }> = {
  'North Park': { lat: 32.7411, lng: -117.1297 },
  'Pacific Beach': { lat: 32.7978, lng: -117.2405 },
  'La Jolla': { lat: 32.8328, lng: -117.2713 },
  'Chula Vista': { lat: 32.6401, lng: -117.0842 },
  'Hillcrest': { lat: 32.7489, lng: -117.1647 },
  'Carlsbad': { lat: 33.1581, lng: -117.3506 },
};

/* ─── OBJECTION GRAPH (cycle detection & related-follow-up prediction) ─── */
const OBJECTION_GRAPH: Record<ObjectionKey, ObjectionKey[]> = {
  'price':       ['safety', 'insurance', 'time'],
  'safety':      ['price', 'kid-safety', 'insurance'],
  'wear':        ['price', 'safety'],
  'time':        ['price', 'safety'],
  'insurance':   ['safety', 'price'],
  'kid-safety':  ['safety', 'price', 'insurance'],
};

const OBJECTION_DECAY_HALF_LIFE_MS = 90_000; // intensity halves every 90s

/* ─── ARCHETYPE PROFILES (4 Warrior Personas → tone/proof/emoji density) ─── */
interface ArchetypeProfile {
  label: string;
  emoji: string;
  emojiDensity: 'medium' | 'high' | 'very-high';
  pacingMultiplier: number; // <1 = faster, >1 = slower
  preferredProofStyle: 'empathy-first' | 'stats-first' | 'speed-first' | 'skeptic-data';
  openingHook: string;
  toneWord: string;
}

const ARCHETYPE_PROFILES: Record<Archetype, ArchetypeProfile> = {
  NervousNewbie: {
    label: '🌱 Nervous Newbie',
    emoji: '🫂',
    emojiDensity: 'medium',
    pacingMultiplier: 1.35,
    preferredProofStyle: 'empathy-first',
    openingHook: '🫂💎 I see you, first-timer champion! Zero judgment, all the soft landings!',
    toneWord: 'gentle',
  },
  BusyParent: {
    label: '👨‍👩‍👧 Busy Parent',
    emoji: '👶',
    emojiDensity: 'high',
    pacingMultiplier: 0.85,
    preferredProofStyle: 'stats-first',
    openingHook: "👶🛡️ Parent mode: FULLY understood! I'll keep this quick, clear, and receipts-first!",
    toneWord: 'efficient',
  },
  EagerAthlete: {
    label: '🥊 Eager Athlete',
    emoji: '⚡',
    emojiDensity: 'very-high',
    pacingMultiplier: 0.7,
    preferredProofStyle: 'speed-first',
    openingHook: '⚡🔥 HUNGRY WARRIOR detected — I am locking in NOW, strap in!',
    toneWord: 'explosive',
  },
  SkepticalShopper: {
    label: '🧠 Skeptical Shopper',
    emoji: '📊',
    emojiDensity: 'medium',
    pacingMultiplier: 1.15,
    preferredProofStyle: 'skeptic-data',
    openingHook: '📊💎 Smart shopper in the house — I got your receipts, citations, AND comparisons ready!',
    toneWord: 'receipts',
  },
};

/* ─── REBUTTAL BANK (A/B/C variants per objection → Darwinian conversion engine) ─── */
interface RebuttalVariant {
  id: string;
  title: string;
  body: string;
  citation: string;
  toneFit: ArchetypeProfile['preferredProofStyle'][];
}

const REBUTTAL_BANK: Record<ObjectionKey, RebuttalVariant[]> = {
  'price': [
    {
      id: 'price_v1_stats',
      title: '💸📊 Real-member RECEIPTS (numbers don\'t lie!)',
      body: '73% of our members train 2×/week and their DAILY cost literally comes out to gym + one coffee — absolute STEAL! ☕🥋 Zero contract lock-in, 100% month-to-month freedom! 🆓✨',
      citation: '📊 Internal 2025 member survey, n=412',
      toneFit: ['stats-first', 'skeptic-data'],
    },
    {
      id: 'price_v2_value',
      title: '💎🔥 The VALUE comparison that ends the debate!',
      body: 'One private BJJ lesson in San Diego = $120. 🤯 Our UNLIMITED monthly membership = less than FOUR of those! 💥 That\'s 16+ classes with elite coaching, community, AND a FREE trial to test-drive it ALL first! 🎁',
      citation: '💰 SD martial arts market pricing 2025',
      toneFit: ['empathy-first', 'speed-first'],
    },
    {
      id: 'price_v3_testimonial',
      title: '🗣️💎 What real members tell us (no scripts!)',
      body: '"I was worried about the cost — then I realized I was spending more on DoorDash in a week." — Tanya M., Pacific Beach parent 👶✨ We hear this EXACT thing 3-4x a month! 🙌🔥',
      citation: '💬 Member testimonials log 2024-2025',
      toneFit: ['empathy-first'],
    },
  ],
  'safety': [
    {
      id: 'safety_v1_stats',
      title: '🛡️📊 The SAFETY RECEIPTS speak for themselves!',
      body: '18 straight months: ZERO concussions. 🙌 Only 2 minor sprains across ~9,400 training sessions — that is STATISTICALLY safer than recreational basketball! 🏀📉 Let that SINK IN! 🔥',
      citation: '📋 Pacific Coast Martial Arts incident log 2024–2025',
      toneFit: ['stats-first', 'skeptic-data'],
    },
    {
      id: 'safety_v2_process',
      title: '🛡️🧠 Our SAFETY SYSTEM (how we engineered this!)',
      body: '3 full weeks of pure TECHNIQUE drilling before ANY live sparring ✅ Tap-first culture (ego stays off the mats! 💯) ✅ Certified instructors with child-safety credentials ✅ Injury protocol reviewed QUARTERLY! 🛡️💎',
      citation: '📝 PCMA safety handbook v2025',
      toneFit: ['stats-first', 'skeptic-data'],
    },
    {
      id: 'safety_v3_empathy',
      title: '🫂💎 Real talk — I get the fear!',
      body: 'Every single parent AND adult beginner has this exact worry on day one! 🙏 Our 3-week no-spar onboarding + tap-first culture means you leave feeling STRONGER, not broken. 💪✨ This is the softest landing in San Diego — promise! 🤝',
      citation: '💬 First-class exit survey 2024',
      toneFit: ['empathy-first'],
    },
  ],
  'kid-safety': [
    {
      id: 'kid_v1_ratio',
      title: '👶🛡️ Kid-safety MICROPROOF (parents read this TWICE!)',
      body: 'Kids program = 6:1 coach ratio (basically elite private tutoring! 🎯), fully background-checked certified instructors 🧑‍🏫, trained 400+ San Diego kids over 3 years with ZERO serious injuries! 🙏✨ Parents watch EVERY class — full transparency always! 👀💯',
      citation: '📊 California martial arts parent survey 2024',
      toneFit: ['stats-first'],
    },
    {
      id: 'kid_v2_stories',
      title: '👶✨ The story parents tell us in month 2!',
      body: '"My 7yo was hiding behind me on day 1 — three weeks later he WALKED IN first, shouted OSU at the coach, and started warming up on his own. You didn\'t just teach him BJJ, you gave him CONFIDENCE." 🥲💎 That\'s our every-week receipt! 🏆',
      citation: '💬 Parent testimonials 2024-2025',
      toneFit: ['empathy-first'],
    },
    {
      id: 'kid_v3_structure',
      title: '👶🧠 The KIDS STRUCTURE that makes it work!',
      body: '✅ Max 6 kids per coach ✅ Class = 10min games + 20min technique + 10min cooldown ✅ Parents seated on transparent-glass benches (see EVERYTHING!) ✅ Monthly belt-stripe checkpoints keep motivation high! 🎯🏆',
      citation: '📝 PCMA kids curriculum 2025',
      toneFit: ['stats-first', 'skeptic-data'],
    },
  ],
  'wear': [
    {
      id: 'wear_v1_simple',
      title: '👕🙌 The first-class dress code (relax, you\'re fine!)',
      body: '80% of first-timers roll up in regular GYM clothes — literally zero judgment! 💯 FREE loaner gis in every size at the front desk! 🎁 Just bring water + a towel + your warrior spirit! 💧🔥',
      citation: '✅ First-class onboarding checklist',
      toneFit: ['empathy-first', 'speed-first'],
    },
    {
      id: 'wear_v2_detail',
      title: '👕📋 Art-by-art outfit breakdown!',
      body: '🥋 BJJ: Gi (FREE loaner) OR rashguard + grappling shorts\n🥊 Muay Thai: athletic shorts + tee\n🥋 Karate: loose comfortable clothes\nAlways: water bottle 💧 + small towel! That\'s literally it! 💎',
      citation: '📝 Gear guide 2025',
      toneFit: ['stats-first'],
    },
    {
      id: 'wear_v3_testimonial',
      title: '👕💬 What real first-timers say!',
      body: '"I showed up in basketball shorts and a faded college tee. Nobody blinked. Coach tossed me a gi from the loaner rack and I was on the mat in 90 seconds." — Marcus T. 🏀➡️🥋 That\'s the VIBE! ✨',
      citation: '💬 First-class testimonial 2024',
      toneFit: ['empathy-first'],
    },
  ],
  'time': [
    {
      id: 'time_v1_efficient',
      title: '⏱️🏆 The typical champion schedule!',
      body: 'MOST adult members train just 2×/week and feel HUGE improvements in 6–8 weeks flat! 📈💥 You do NOT need to live at the dojo to see life-changing results — efficiency is EVERYTHING! ⚡🎯',
      citation: '📊 Member progression study 2024',
      toneFit: ['stats-first', 'speed-first'],
    },
    {
      id: 'time_v2_flexibility',
      title: '📅✨ The SCHEDULE FLEXIBILITY that kills the "no time" excuse!',
      body: 'Morning 6-8AM 🌅, Lunch 12PM 🌮, Evening 5-8PM 🌙, Saturdays 🏖️ — 47 class slots/week across locations! If you can\'t find 2 slots that fit your life, I\'ll eat my keyboard! ⌨️😤',
      citation: '📅 PCMA weekly schedule',
      toneFit: ['speed-first', 'skeptic-data'],
    },
    {
      id: 'time_v3_busy',
      title: '⏰💎 Built for BUSY humans (we see you!)',
      body: 'Our members include ER nurses, startup founders, parents of 3, AND shift workers! 🏥💼👶 If they\'re finding 2hrs/week to train, so can you — we\'ll help you CUSTOM-CRAFT it! 🛠️🙌',
      citation: '💬 Member occupation survey 2024',
      toneFit: ['empathy-first'],
    },
  ],
  'insurance': [
    {
      id: 'insurance_v1_basic',
      title: '📋🛡️ Full legal coverage — zero vibe-killers!',
      body: 'Every member signs a standard waiver. We carry COMMERCIAL liability insurance for every single mat session. 🏛️✨ Contracts are month-to-month, cancel ANYTIME — absolute freedom! 🆓💯',
      citation: '📝 Standard enrollment agreement',
      toneFit: ['stats-first', 'skeptic-data'],
    },
    {
      id: 'insurance_v2_transparent',
      title: '📋💎 Our full LEGAL stack (transparent AF!)',
      body: '✅ Commercial general liability: $2M/$4M\n✅ Accident coverage for every drill\n✅ Month-to-month, cancel any day of the month\n✅ Full medical referral network if anything ever needs it! 🏥🤝',
      citation: '📝 Business license + insurance cert 2025',
      toneFit: ['skeptic-data'],
    },
    {
      id: 'insurance_v3_human',
      title: '🫂💎 The real-talk answer!',
      body: 'We\'ve run this dojo 8 years, zero lawsuits, zero insurance claims that weren\'t minor. 🙏 Carlos will literally text you a photo of the full insurance cert if you want to verify! 📸✨ Trust is EARNED, not spoken! 🤝',
      citation: '📋 Track record 2017-2025',
      toneFit: ['empathy-first'],
    },
  ],
};

/* ─── NARRATIVE STORIES (micro-stories for identity alignment) ─── */
interface NarrativeStory {
  tag: string;
  archetypeFit: Archetype[];
  objectionFit: (ObjectionKey | 'general')[];
  text: string;
}

const STORIES: NarrativeStory[] = [
  {
    tag: 'nervous-newbie-bjj',
    archetypeFit: ['NervousNewbie'],
    objectionFit: ['safety', 'general'],
    text: '🥲💎 Last month, a guy named Derek walked in shaking — hadn\'t done anything physical in 5 years. Week 3, he tapped a blue belt in open mat. Walked out of here CRYING happy tears. 🙌✨ That\'s not a sales story, that\'s a Tuesday. 🔥',
  },
  {
    tag: 'parent-transformation',
    archetypeFit: ['BusyParent'],
    objectionFit: ['kid-safety', 'general'],
    text: '👶✨ "My 7yo Sophia was HIDING behind me on day 1. Four weeks later she walked in FIRST, shouted OSU, and helped teach a new kid the warmup. You didn\'t just teach her BJJ — you gave her an ENTIRE personality upgrade!" — Real text from Tanya last month. 💎🏆',
  },
  {
    tag: 'busy-parent-schedule',
    archetypeFit: ['BusyParent'],
    objectionFit: ['time'],
    text: '📅💎 Jenn — mom of 3, ER nurse, 50hr weeks — trains 2x/week on her off days, 6AM slot. "If I can do it, literally anyone can." Her words, not mine! 🙌🏥',
  },
  {
    tag: 'eager-athlete-fire',
    archetypeFit: ['EagerAthlete'],
    objectionFit: ['general'],
    text: '🔥⚡ Marco came in saying "I want to compete in 6 months." We laughed, gave him a plan. 8 months later he won his division at Pans Masters. 🏆💪 Point is: when you bring the HUNGER, we match the FIRE. 🥊',
  },
  {
    tag: 'skeptic-conversion',
    archetypeFit: ['SkepticalShopper'],
    objectionFit: ['price', 'general'],
    text: '📊💎 Brandon toured 4 gyms before us. Spreadsheet, literally. 😂 Compared curriculum, pricing, instructor lineage. Came back, signed up, wrote us a Google review titled "The math checks out." 📋🏆 That\'s our vibe — we RESPECT the diligence! 🫡',
  },
  {
    tag: 'injury-comeback',
    archetypeFit: ['NervousNewbie', 'SkepticalShopper'],
    objectionFit: ['safety', 'general'],
    text: '🛡️💎 Sarah came back after a 2-year knee rehab. Coach modified every drill, week-by-week. She\'s now in intermediate class — her orthopedist literally wrote a note saying "keep doing whatever you\'re doing." 📝🙌',
  },
  {
    tag: 'price-transformation',
    archetypeFit: ['SkepticalShopper', 'BusyParent'],
    objectionFit: ['price'],
    text: '💰✨ Mike did the math: "I was spending $200/mo on DoorDash. Switched to meal prep, signed up here instead. Same wallet, completely different life." 🍱🥋 We hear this one constantly. 💎',
  },
  {
    tag: 'kid-shy-to-leader',
    archetypeFit: ['BusyParent'],
    objectionFit: ['kid-safety'],
    text: '👶🌟 Jaden started as the shyest 6yo in the class. Month 4 he was LEADING the warmup line. Mom texted us: "I don\'t know what you did but he\'s a different kid." 🫶 That\'s the magic we\'re ALL about! 💎',
  },
];

/* ─── LIVE ACTIVITY FEED (fake-but-believable injected "Just booked" events) ─── */
const LIVE_ACTIVITY_TEMPLATES = {
  booking: [
    '⚡🔥 Someone from {nbhd} just booked the {day} {time} spot — this place is MOVING!',
    '💥 Just in: a {adjective} beginner from {nbhd} locked in {day} {time}! Momentum is REAL!',
    '🎯 Fresh booking alert — {nbhd} warrior claimed the {art} slot! The energy is ELECTRIC!',
  ],
  viewing: [
    '👀 {count} people are eyeing this exact slot right now — it\'s moving FAST!',
    '🔥 {count} warriors watching this schedule — decision-time vibes in the building!',
    '⚡ Live count: {count} humans on this page actively considering — you\'re in good company!',
  ],
  arriving: [
    '🥋 A {archetype} from {nbhd} just arrived at the dojo — energy is CRANKED!',
    '💪 Fresh arrival: {nbhd} regular just walked in for the evening class!',
    '🎯 {nbhd} warrior checking in at the front desk — these mats stay ALIVE!',
  ],
};

const NBHD_ADJECTIVES = ['nervous', 'hyped', 'focused', 'determined', 'fired-up', 'curious'];

/* ─── INTENT LABELS ─── */
const INTENT_PATTERNS: Record<string, { keywords: RegExp[]; weight: number }> = {
  'art:BJJ':            { keywords: [/\bbjj\b/i, /jiu[\s-]?jitsu/i, /\bgrapple/i, /grappling/i, /\bgi\b/i], weight: 1 },
  'art:Muay Thai':      { keywords: [/muay/i, /thai/i, /kickbox/i, /striking/i, /\bknees?\b/i], weight: 1 },
  'art:MMA':            { keywords: [/\bmma\b/i, /mixed martial/i, /cage/i, /ufc/i], weight: 1 },
  'art:Karate':         { keywords: [/karate/i, /kihon/i, /\bkata/i, /\bdojo\b/i], weight: 1 },
  'art:Judo':           { keywords: [/judo/i, /\bthrow/i, /ukemi/i], weight: 1 },
  'age:Kid':            { keywords: [/\bkid/i, /child/i, /\bson\b/i, /daughter/i, /my (4|5|6|7|8|9|10|11|12) year/i, /age (4|5|6|7|8|9|10|11|12)/i, /toddler/i], weight: 1.3 },
  'age:Teen':           { keywords: [/teen/i, /\b1[3-7] year/i, /\bhighschool/i, /high school/i], weight: 1.2 },
  'age:Adult':          { keywords: [/adult/i, /myself/i, /i'?m interested/i, /for me/i], weight: 1 },
  'objection:price':    { keywords: [/cost/i, /price/i, /fee/i, /how much/i, /expensive/i, /cheap/i, /\bafford/i, /budget/i], weight: 1.4 },
  'objection:wear':     { keywords: [/wear/i, /clothes/i, /\bgi\b.*have/i, /outfit/i, /dress code/i], weight: 1 },
  'objection:safety':   { keywords: [/\bsafe/i, /safety/i, /\bhurt/i, /injury/i, /injured/i, /concuss/i, /dangerous/i], weight: 1.5 },
  'objection:time':     { keywords: [/\btime/i, /\bbusy/i, /schedule/i, /commit/i, /\bhours\b/i], weight: 1.1 },
  'objection:insurance':{ keywords: [/insurance/i, /waiver/i, /liability/i, /lawsuit/i, /refund/i, /contract/i], weight: 1.2 },
  'exp:Beginner':       { keywords: [/beginner/i, /never done/i, /first time/i, /new to/i, /fish out/i, /clueless/i, /no experience/i, /total noob/i], weight: 1 },
  'exp:Some':           { keywords: [/some experience/i, /\bdabbled/i, /tried.*before/i, /watched.*ufc/i, /bit of/i], weight: 1 },
  'exp:Experienced':    { keywords: [/purple belt/i, /brown belt/i, /black belt/i, /\b\d+ years/i, /been training/i, /competed/i], weight: 1 },
  'action:book':        { keywords: [/book/i, /trial/i, /reserve/i, /lock it in/i, /sign me up/i, /let's do it/i, /yes.*book/i, /try a class/i], weight: 1.5 },
  'time:evening':       { keywords: [/evening/i, /after work/i, /\b6\s*pm/i, /\b7\s*pm/i, /after 5/i], weight: 1 },
  'time:morning':       { keywords: [/morning/i, /early/i, /before work/i, /\b8\s*am/i, /\b9\s*am/i], weight: 1 },
  'time:weekend':       { keywords: [/weekend/i, /saturday/i, /sunday/i, /sat\b/i], weight: 1 },
  'location:hint':      { keywords: [/north park/i, /pacific beach/i, /\bpb\b/i, /la jolla/i, /chula vista/i, /hillcrest/i, /carlsbad/i, /downtown/i], weight: 1.2 },
  'greeting':           { keywords: [/\bhi\b/i, /\bhey\b/i, /hello/i, /\byo\b/i, /\bsup\b/i], weight: 0.6 },
  'escalate:human':     { keywords: [/human/i, /real person/i, /talk to someone/i, /not a bot/i], weight: 2 },
};

const INTENT_EXAMPLES: Record<string, string[]> = {
  'art:BJJ': ['i want to learn jiu jitsu', 'looking for a grappling class', 'want to try bjj'],
  'art:Muay Thai': ['i want to learn striking', 'looking for kickboxing', 'want muay thai'],
  'art:MMA': ['i want mma classes', 'want mixed martial arts', 'i watch ufc and want to train'],
  'age:Kid': ['this is for my 8 year old', 'looking for classes for my son', 'need something for my daughter'],
  'objection:price': ['how much does it cost', 'is it expensive', 'what are your prices'],
  'objection:safety': ['is it safe', 'i am worried about injury', 'will my kid get hurt'],
  'objection:wear': ['what should i wear', 'do i need a gi', 'what clothes do i bring'],
  'objection:time': ['i am busy after work', 'do you have weekend classes', 'how much time do i need'],
  'exp:Beginner': ['i have never done this before', 'i am totally new', 'first class ever'],
  'exp:Some': ['i have trained a little', 'i dabbled before', 'some experience'],
  'exp:Experienced': ['i have been training for years', 'i compete already', 'advanced student'],
  'action:book': ['book me in', 'sign me up for a trial', 'reserve me a spot'],
  'escalate:human': ['can i talk to a real person', 'i need a human', 'not a bot please'],
};

const NEGATIVE_WORDS = /(worried|scared|not sure|hate|expensive|nervous|anxious|confused|frustrated|overwhelmed|skeptical|afraid|unsure|hesitant)/i;
const POSITIVE_WORDS = /(excited|ready|love|awesome|perfect|great|let's|can'?t wait|hyped|stoked|pumped)/i;

/* ─── HELPERS ─── */

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s']/g, ' ').split(/\s+/).filter(Boolean);
}

/** Score all intents with token-overlap + regex weight. Returns ranked list. */
function scoreIntents(text: string): { intent: string; confidence: number }[] {
  const scores: Record<string, number> = {};
  const tokens = tokenize(text);
  const tokenCount = Math.max(tokens.length, 1);

  for (const [intent, cfg] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    for (const rx of cfg.keywords) {
      if (rx.test(text)) score += cfg.weight;
    }
    // Semantic boost via token overlap with intent name
    const intentTokens = intent.toLowerCase().split(/[:\s]/);
    for (const t of intentTokens) {
      if (t.length > 2 && tokens.includes(t)) score += 0.4;
    }
    const examples = INTENT_EXAMPLES[intent] ?? [];
    const exampleBoost = examples.reduce((best, sample) => {
      const sampleTokens = tokenize(sample);
      const overlap = sampleTokens.filter(token => tokens.includes(token)).length;
      return Math.max(best, sampleTokens.length ? overlap / sampleTokens.length : 0);
    }, 0);
    score += exampleBoost * 1.2;
    if (score > 0) {
      scores[intent] = score / (1 + Math.log10(tokenCount));
    }
  }

  const ranked = Object.entries(scores)
    .map(([intent, raw]) => ({ intent, confidence: Math.min(1, raw / 2) }))
    .sort((a, b) => b.confidence - a.confidence);

  return ranked;
}

function detectSentiment(text: string): 'neg' | 'neu' | 'pos' {
  if (NEGATIVE_WORDS.test(text)) return 'neg';
  if (POSITIVE_WORDS.test(text)) return 'pos';
  return 'neu';
}

/** Extract structured entities from free text. */
function extractEntities(text: string, existing: Entities): Entities {
  const out: Entities = { ...existing };

  // Name ("I'm Alex", "my name is Sarah")
  const nameMatch = text.match(/i'?m\s+([A-Z][a-z]+)/i) || text.match(/name is\s+([A-Z][a-z]+)/i) || text.match(/^([A-Z][a-z]+)$/);
  if (nameMatch && !out.name) out.name = nameMatch[1];

  // Ages
  const ageMatch = text.match(/\b(\d{1,2})\s*(year|yr)s?\s*old/i) || text.match(/age\s*(\d{1,2})/i) || text.match(/\bi'?m\s+(\d{1,2})\b/i);
  if (ageMatch) {
    const age = Number(ageMatch[1]);
    if (age >= 3 && age <= 80) {
      if (age < 18 && /kid|child|son|daughter|my/i.test(text)) {
        out.kidAge = age;
        out.audienceType = 'parent';
      } else if (age < 18) {
        out.age = age;
        out.audienceType = 'teen';
      } else {
        out.age = age;
        out.audienceType = 'adult';
      }
    }
  }

  // Kid's name ("my son Tommy", "daughter Lily")
  const kidNameMatch = text.match(/(?:son|daughter|kid|child)\s+([A-Z][a-z]+)/i);
  if (kidNameMatch) out.kidName = kidNameMatch[1];

  const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  if (emailMatch) out.email = emailMatch[0].toLowerCase();

  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}/);
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/\D/g, '').slice(-10);
    if (digits.length === 10) out.phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const zipMatch = text.match(/\b(92\d{3})\b/);
  if (zipMatch) {
    out.zipCode = zipMatch[1];
    if (ZIP_TO_NEIGHBORHOOD[zipMatch[1]]) out.location = ZIP_TO_NEIGHBORHOOD[zipMatch[1]];
  }

  // Location
  for (const n of SD_NEIGHBORHOODS) {
    if (new RegExp(n, 'i').test(text)) {
      out.location = n;
      break;
    }
  }
  if (/\bpb\b/i.test(text)) out.location = 'Pacific Beach';

  // Audience
  if (/\b(my kid|my son|my daughter|my child)\b/i.test(text)) out.audienceType = 'parent';
  if (/\bfor myself\b|\bfor me\b/i.test(text) && !out.audienceType) out.audienceType = 'adult';
  if (/virtual|zoom|call me|phone consult/i.test(text)) out.travelMode = 'virtual';
  else if (/travel|visiting|visitor|out of town|not local|outside san diego/i.test(text)) out.travelMode = 'visitor';
  else if (!out.travelMode) out.travelMode = 'local';

  // Experience
  if (/beginner|never done|first time|new to|no experience|total noob/i.test(text)) out.experience = 'Beginner';
  else if (/some experience|dabbled|a bit of/i.test(text)) out.experience = 'Some';
  else if (/black belt|brown belt|purple belt|competed|\d+ years/i.test(text)) out.experience = 'Experienced';

  // Art
  if (/\bbjj\b|jiu.jitsu/i.test(text)) out.art = 'BJJ';
  else if (/muay|thai|kickbox/i.test(text)) out.art = 'Muay Thai';
  else if (/\bmma\b/i.test(text)) out.art = 'MMA';
  else if (/karate/i.test(text)) out.art = 'Karate';
  else if (/judo/i.test(text)) out.art = 'Judo';

  // Time preference
  if (/evening|after work|\b[67]\s*pm/i.test(text)) out.preferredTime = 'evening';
  else if (/morning|early/i.test(text)) out.preferredTime = 'morning';
  else if (/weekend|sat\b|sunday/i.test(text)) out.preferredTime = 'weekend';

  if (/weekdays?|after school|school nights/i.test(text)) out.preferredDay = 'weekday';
  else if (/weekend|sat|sunday/i.test(text)) out.preferredDay = 'weekend';
  else if (/either|any day|flexible/i.test(text)) out.preferredDay = 'either';

  if (/budget|cheap|afford|value/i.test(text)) out.budgetHint = 'value';
  else if (/premium|best|top tier|vip/i.test(text)) out.budgetHint = 'premium';

  return out;
}

/** Dynamic slot matcher — filters & ranks by relevance to current entities.
 *  ENHANCED (A3): now blends traditional relevance score with predicted show-up fit. */
function matchSlots(
  entities: Entities,
  slots: ScheduleSlot[],
  memory?: MemoryLayer,
  clock?: { weekdayIdx: number; hour24: number }
): ScheduleSlot[] {
  let filtered = slots.slice();

  if (entities.audienceType === 'parent' || (entities.kidAge && entities.kidAge < 13)) {
    filtered = filtered.filter(s => s.kidFriendly);
  } else {
    filtered = filtered.filter(s => !s.kidFriendly || entities.art === 'Kids');
  }

  if (entities.art && entities.art !== 'Kids') {
    const artMatches = filtered.filter(s => s.art === entities.art);
    if (artMatches.length > 0) filtered = artMatches;
  }

  if (entities.experience === 'Beginner') {
    const beg = filtered.filter(s => s.beginnerFriendly);
    if (beg.length > 0) filtered = beg;
  }

  if (entities.preferredDay === 'weekday') {
    const weekdays = filtered.filter(s => s.isoDay >= 1 && s.isoDay <= 5);
    if (weekdays.length > 0) filtered = weekdays;
  } else if (entities.preferredDay === 'weekend' || entities.preferredTime === 'weekend') {
    const wk = filtered.filter(s => s.isoDay === 0 || s.isoDay === 6);
    if (wk.length > 0) filtered = wk;
  } else if (entities.preferredTime === 'evening') {
    const ev = filtered.filter(s => s.hour >= 17);
    if (ev.length > 0) filtered = ev;
  } else if (entities.preferredTime === 'morning') {
    const mr = filtered.filter(s => s.hour < 12);
    if (mr.length > 0) filtered = mr;
  }

  const wi = clock?.weekdayIdx ?? 3;
  const h24 = clock?.hour24 ?? 15;
  const mem = memory ?? INITIAL_MEMORY;

  filtered = filtered
    .map(slot => {
      let score = 0;
      if (entities.location && slot.location === entities.location) score += 10;
      if (entities.experience === 'Beginner' && slot.beginnerFriendly) score += 4;
      if (entities.audienceType === 'parent' && slot.kidFriendly) score += 5;
      if (entities.preferredTime === 'evening' && slot.hour >= 17) score += 3;
      if (entities.preferredTime === 'morning' && slot.hour < 12) score += 3;
      if ((entities.preferredDay === 'weekend' || entities.travelMode === 'visitor') && slot.isoDay === 6) score += 4;
      if (entities.travelMode === 'visitor' && slot.hour < 13) score += 2;
      score += Math.max(0, 4 - slot.spotsLeft);
      score += Math.min(slot.recentSignups, 12) * 0.15;
      // A3: blend show-up fit (weighted 0.6 → impactful but doesn't override relevance)
      const showUpFit = predictShowUpFit(slot, entities, mem, wi, h24);
      score += (showUpFit - 50) * 0.1;
      return { slot, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.slot);

  return filtered.slice(0, 4);
}

/** Context-aware typing delay (reading time + thinking time).
 *  Kept for legacy call sites; main path uses computeAdaptiveDelay (B3 + D1). */
function calculateTypingDelay(previousBotText: string, nextKind: MessageKind): number {
  return computeAdaptiveDelay(previousBotText, nextKind, 'neu', undefined, []);
}

function toObjectionKey(intent?: string): ObjectionKey | null {
  if (!intent?.startsWith('objection:')) return null;
  return intent.split(':')[1] as ObjectionKey;
}

function deriveNextMemory(
  current: MemoryLayer,
  text: string,
  topIntent: { intent: string; confidence: number } | undefined,
  gainedEntity: boolean,
  responseTimesMs: number[],
  userReplyMs?: number
): MemoryLayer {
  const now = Date.now();
  const sameTwice = current.lastUserMessage.toLowerCase() === text.toLowerCase();
  // A2: decay existing objections first
  const decayed = decayObjections(current, now);

  const next: MemoryLayer = {
    ...decayed,
    objections: [...decayed.objections],
    objectionCounts: { ...decayed.objectionCounts },
    objectionDecay: { ...decayed.objectionDecay },
    messageCount: decayed.messageCount + 1,
    lastUserMessage: text,
    sameMessageTwice: sameTwice,
    engagementScore: decayed.engagementScore + (gainedEntity ? 12 : 5),
    confidenceScore: decayed.confidenceScore,
    unclearCount: decayed.unclearCount,
    hesitations: decayed.hesitations,
    cycleCount: decayed.cycleCount,
    userResponseTimesMs: userReplyMs && userReplyMs > 0
      ? [...decayed.userResponseTimesMs, userReplyMs].slice(-10)
      : decayed.userResponseTimesMs,
  };

  if (sameTwice) {
    next.confidenceScore = Math.max(0, next.confidenceScore - 0.3);
    next.hesitations += 1;
  }

  if (!topIntent || topIntent.confidence < 0.35) {
    next.unclearCount += 1;
    next.confidenceScore = Math.max(0, next.confidenceScore - 0.15);
  }

  const objection = toObjectionKey(topIntent?.intent);
  if (objection) {
    const count = (next.objectionCounts[objection] ?? 0) + 1;
    next.objectionCounts[objection] = count;
    if (!next.objections.includes(objection)) next.objections.push(objection);
    else next.objections = [...next.objections, objection]; // preserve history for cycle detection
    // A2: stamp decay record
    const stamped = stampObjection(next, objection);
    next.objectionDecay = stamped.objectionDecay;
    if (count >= 2) {
      next.hesitations += 1;
      next.confidenceScore = Math.max(0, next.confidenceScore - 0.1);
    }
    // D2: cycle detection
    if (detectObjectionCycle(next.objections)) {
      next.cycleCount += 1;
    }
  }

  // A5: dual risk/readiness prediction (updated after every turn)
  next.churnRisk = computeChurnRisk(next, responseTimesMs);
  next.dropOffRisk = detectDropOffSignals(next, responseTimesMs) ? Math.max(next.dropOffRisk, 0.65) : Math.max(0, next.dropOffRisk - 0.08);

  // C2: persona inference (locks in first detected persona, doesn't flip every turn)
  if (!next.persona) {
    const p = inferPersona(text, next, {});
    if (p) next.persona = p;
  }

  return next;
}

function deriveNextState(
  current: ConversationState,
  topIntent: { intent: string; confidence: number } | undefined
): ConversationState {
  let score = current.leadScore;
  if (topIntent) {
    if (topIntent.intent.startsWith('action:book')) score += 25;
    if (topIntent.intent.startsWith('art:')) score += 12;
    if (topIntent.intent.startsWith('age:Kid')) score += 15;
    if (topIntent.intent.startsWith('exp:')) score += 10;
    if (topIntent.intent.startsWith('time:')) score += 8;
    if (topIntent.intent.startsWith('location:')) score += 7;
    if (topIntent.intent === 'greeting') score += 3;
    if (topIntent.intent === 'objection:price') score -= 10;
    if (topIntent.intent === 'objection:safety') score -= 6;
    if (topIntent.intent === 'objection:insurance') score -= 8;
  }
  score = Math.max(0, Math.min(100, score));

  let mode: Mode = current.mode;
  if (score >= 80 || current.messagesSent >= 8) mode = 'close';
  else if (score >= 50) mode = 'assist';
  else mode = 'explore';

  return {
    ...current,
    leadScore: score,
    hotLead: score >= 70,
    mode,
    messagesSent: current.messagesSent + 1,
  };
}

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestNeighborhood(lat: number, lng: number) {
  return Object.entries(SD_LOCATION_COORDS)
    .map(([name, coords]) => ({
      neighborhood: name as SDNeighborhood,
      distance: distanceMiles(lat, lng, coords.lat, coords.lng),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function getFrontDeskBaselineMs(clock: Pick<ReturnType<typeof sdNow>, 'frontDeskOpen' | 'hour24' | 'weekdayIdx' | 'minutesUntilFrontDeskOpen'>) {
  if (!clock.frontDeskOpen) return clock.minutesUntilFrontDeskOpen * 60_000;
  if (clock.weekdayIdx === 6) return 4 * 60_000;
  if (clock.hour24 < 11) return 5 * 60_000;
  if (clock.hour24 < 14) return 3 * 60_000;
  if (clock.hour24 < 17) return 4 * 60_000;
  return 6 * 60_000;
}

function getSmartReplies({
  step,
  entities,
  memory,
  recentMessages,
  geoStatus,
  fallback,
}: {
  step: ConversationState['step'];
  entities: Entities;
  memory: MemoryLayer;
  recentMessages: ChatMessage[];
  geoStatus: GeoStatus;
  fallback: string[];
}) {
  const recentUserText = recentMessages
    .filter(message => message.sender === 'user')
    .map(message => message.text.toLowerCase())
    .join(' ');

  let replies = fallback;
  if (step === 'greeting' && geoStatus === 'non-local' && !fallback.includes('Yes, continue')) {
    replies = ['Use my location', 'Show weekend traveler slots', 'Book a virtual intro'];
  } else if (step === 'qualify-art' && entities.audienceType === 'parent') {
    replies = ['Kids BJJ', 'Kids martial arts', 'Safety first'];
  } else if (step === 'qualify-exp' && entities.art) {
    replies = ['Total beginner', 'Some experience', 'Been training a while'];
  } else if (step === 'micro-day-pref') {
    replies = ['Weekdays', 'Weekends', 'Either works'];
  } else if (step === 'micro-time-pref') {
    replies = ['Evening after 5', 'Morning / earlier', 'Either'];
  } else if (step === 'escalate') {
    replies = ['Yes, request callback', 'Text is better', 'Keep chatting here'];
  } else if (step === 'post-booking') {
    replies = ['📹 Yes, send warm-up video', '🅿️ Send parking PDF', '👯 Add a friend for free', "I'm good for now"];
  } else if (memory.objections.includes('price')) {
    replies = ['First class is free', 'Show beginner slots', 'Talk to Carlos'];
  } else if (recentUserText.includes('kid')) {
    replies = ['Kids BJJ', 'Kids martial arts', 'Show after-school slots'];
  }

  return Array.from(new Set(replies)).slice(0, 4);
}

function predictResponseKind(
  topIntent: { intent: string; confidence: number } | undefined,
  sentiment: 'neg' | 'neu' | 'pos',
  nextMemory: MemoryLayer,
  newEntities: Entities
): MessageKind {
  if (!topIntent || topIntent.confidence < 0.35 || nextMemory.unclearCount >= 2) return 'clarify';
  if (sentiment === 'neg') return 'empathy';
  if (topIntent.intent.startsWith('objection:')) return 'microproof';
  if (topIntent.intent.startsWith('action:book') || (newEntities.art && newEntities.experience)) return 'schedule';
  return 'text';
}

/** Predict the next likely objection based on entity profile. */
function predictNextObjection(ents: Entities, raised: ObjectionKey[]): ObjectionKey | null {
  const candidates: ObjectionKey[] = [];
  if (ents.audienceType === 'parent' && !raised.includes('kid-safety')) candidates.push('kid-safety');
  if (ents.experience === 'Beginner' && !raised.includes('safety')) candidates.push('safety');
  if (ents.audienceType === 'adult' && !raised.includes('time')) candidates.push('time');
  if (!raised.includes('price')) candidates.push('price');
  return candidates[0] ?? null;
}

/** Compute the next best move — now backed by the utility-score optimizer (A1). */
function bestNextMove(
  state: ConversationState,
  entities: Entities,
  memory: MemoryLayer
): 'greet' | 'clarify' | 'qualify' | 'preempt' | 'offer-slots' | 'close' | 'escalate' | 'microproof' | 'story' | 'mat-tour' | 'momentum-lock' | 'drop-off-save' | 'cycle-break' | 'neighborhood-offer' {
  // Hard-rail overrides (safety-critical transitions)
  if (memory.cycleCount >= 2) return 'escalate';
  if (memory.confidenceScore < 0.4 || memory.unclearCount >= 3) return 'escalate';
  // Otherwise defer to the utility scorer
  return pickTopMove(state, entities, memory).move;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROCKET BOOSTER HELPERS (enhancements 26-49)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── A2: Objection decay + resurfacing (time-based intensity fade) ─── */
function decayObjections(
  memory: MemoryLayer,
  nowMs: number
): MemoryLayer {
  const next = { ...memory, objectionDecay: { ...memory.objectionDecay } };
  for (const k of Object.keys(next.objectionDecay) as ObjectionKey[]) {
    const rec = next.objectionDecay[k];
    if (!rec) continue;
    const age = nowMs - rec.lastSeenAt;
    const halfLives = age / OBJECTION_DECAY_HALF_LIFE_MS;
    const decayed = rec.intensity * Math.pow(0.5, halfLives);
    next.objectionDecay[k] = { ...rec, intensity: Math.max(0, decayed) };
  }
  return next;
}

function stampObjection(
  memory: MemoryLayer,
  key: ObjectionKey,
  variantId?: string
): MemoryLayer {
  const now = Date.now();
  const prev = memory.objectionDecay[key];
  const intensity = Math.min(1, (prev?.intensity ?? 0) * 0.6 + 0.55);
  return {
    ...memory,
    objectionDecay: {
      ...memory.objectionDecay,
      [key]: {
        firstSeenAt: prev?.firstSeenAt ?? now,
        lastSeenAt: now,
        intensity,
        rebuttalVariantIds: variantId
          ? [...(prev?.rebuttalVariantIds ?? []), variantId]
          : (prev?.rebuttalVariantIds ?? []),
      },
    },
  };
}

function activeObjectionIntensity(memory: MemoryLayer, key: ObjectionKey): number {
  return memory.objectionDecay[key]?.intensity ?? 0;
}

function pickStrongestActiveObjection(memory: MemoryLayer): ObjectionKey | null {
  const ranked = (Object.keys(memory.objectionDecay) as ObjectionKey[])
    .map(key => ({ key, intensity: activeObjectionIntensity(memory, key) }))
    .filter(entry => entry.intensity >= 0.22)
    .sort((a, b) => b.intensity - a.intensity);
  return ranked[0]?.key ?? null;
}

function buildResurfacedObjectionLine(memory: MemoryLayer): string | null {
  const strongest = pickStrongestActiveObjection(memory);
  switch (strongest) {
    case 'price':
      return '💸🔥 Quick calm-the-brain note: your first class is STILL 100% FREE and everything after that stays month-to-month — ZERO trap doors, ZERO fine print, ZERO nonsense! 🆓💎✨ Just pure warrior value! 🏆';
    case 'safety':
      return '🛡️✨ Quick peace-of-mind note: the tap-first culture and 3-week drill-only onboarding are STILL protecting your first-step experience like a SHIELD of pure champion energy! 🤝💎🔥 You are SAFE here!';
    case 'kid-safety':
      return '👶🛡️ Parent peace-of-mind reminder: coaches stay CLOSE, parents can watch the ENTIRE class, and the whole kids format is built for calm confidence first — your little warrior is in LEGENDARY hands! 💎✨👑';
    case 'time':
      return '⏱️💎 Tiny reminder: I am STILL optimizing for the LOWEST-friction option, not the random one — these picks are ENGINEERED to fit your real, beautiful, chaotic life! 🎯✨🔥 Maximum convenience! ⚡';
    case 'wear':
      return '👕✨ ZERO wardrobe panic allowed: regular gym clothes + a FREE loaner gi still cover day one BEAUTIFULLY! 🙌🥋💎 Show up as you ARE, leave as a WARRIOR! 🔥';
    case 'insurance':
      return '📋💎 And YES — the grown-up admin stuff is FULLY buttoned up: waiver signed, coverage locked, clean front-desk process all handled like the PROFESSIONALS we are! ✅🏆✨ Zero stress!';
    default:
      return null;
  }
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDemoCalendarBusySlotIds(
  candidateSlots: ScheduleSlot[],
  ents: Entities,
  sessionSeed: string
): Set<string> {
  if (candidateSlots.length <= 1) return new Set();
  const seed = hashString([
    sessionSeed,
    ents.name ?? '',
    ents.location ?? '',
    ents.art ?? '',
    ents.preferredDay ?? '',
    ents.preferredTime ?? '',
    ents.audienceType ?? '',
  ].join('|'));
  const busyCount = Math.min(2, Math.max(1, Math.floor(candidateSlots.length / 2)));
  const blocked = new Set<string>();

  for (let i = 0; i < busyCount; i += 1) {
    const idx = (seed + (i * 3)) % candidateSlots.length;
    blocked.add(candidateSlots[idx].id);
  }

  return blocked;
}

function buildBookingReasonNudge(reason: BookingReason | undefined, slot: ScheduleSlot): string {
  switch (reason) {
    case 'beginner-friendly':
      return `🌱 This exact ${slot.label} slot was chosen because it's the SOFTEST, friendliest on-ramp on the board — no chaos, no ego, just beautiful beginner momentum.`;
    case 'kid-safety':
      return `👶 You booked for peace of mind, and that's exactly why this class keeps structure high, coach attention tight, and first-day nerves LOW.`;
    case 'schedule-fit':
      return `📅 This slot won because it fits your week cleanly — the whole goal here is consistency without life-chaos.`;
    case 'location-convenience':
      return `📍 This class is pure convenience leverage — close to your world, easier to show up for, harder to skip.`;
    case 'injury-concern':
      return `🛡️ You said yes because you wanted the safe lane, and this session stays technique-first, controlled, and confidence-building from minute one.`;
    case 'price-value':
      return `💎 You picked the high-value move — all signal, no fluff, no wasted spend, just a clean first step with upside.`;
    case 'social-energy':
      return `🔥 You booked into this because the energy is REAL, and this crew absolutely brings that tribe vibe the second you walk in.`;
    default:
      return `✨ This booking was the right call for THIS version of your life — low friction, high upside, beautiful momentum.`;
  }
}

function buildMatTourScenes(slot?: ScheduleSlot, ents?: Entities): string[] {
  return [
    `🚪✨ You walk into ${slot?.location ?? ents?.location ?? 'the dojo'} and the front desk LIGHTS UP — your name is ready, a cold water is in your hand, and there is ZERO awkwardness! 💎 Just instant "we've been WAITING for you" energy! 🔥`,
    `🥋👑 Coach Carlos personally CLOCKS that you're ${ents?.experience === 'Beginner' ? 'brand-new and keeps it ULTRA-gentle — drill-only, no live rolls, pure technique in a safe bubble' : 'here to LEVEL UP and dials your lane in INSTANTLY — elite intensity, zero fluff'} — no ego theater, just LEGENDARY guidance! 💪⚡`,
    `👀🏆 The room is full of focused, NORMAL humans — not cartoon tough guys! 😂 Lawyers, teachers, parents, students — all sweating together and the whole mat feels SURPRISINGLY welcoming and dialed-in like a well-oiled MACHINE! ✨🥋`,
    `💪🔥 Forty-five minutes later you're DRENCHED in sweat, BEAMING with that champion glow, and thinking: "Wait... THAT was the scary thing?! I can ABSOLUTELY do this! When's the next class?!" 🏆💎⚡ THAT is the Pacific Coast experience! 🚀`,
  ];
}

/* ─── D2: Objection graph + cycle breaker ─── */
function detectObjectionCycle(objectionHistory: ObjectionKey[]): boolean {
  if (objectionHistory.length < 3) return false;
  const last3 = objectionHistory.slice(-3);
  // Cycle = (A, B, A) pattern OR 3 different objections in rotation
  if (last3[0] === last3[2] && last3[0] !== last3[1]) return true;
  // Graph-based: last objection's successor appeared earlier → loop
  const prev = last3[1];
  const current = last3[2];
  const related = OBJECTION_GRAPH[prev] || [];
  return related.includes(current) && objectionHistory.slice(0, -1).includes(current);
}

/* ─── D3: Archetype clustering (4 Warrior Personas) ─── */
function detectArchetype(ents: Entities, memory: MemoryLayer): Archetype | undefined {
  const objs = memory.objections;
  const hesitant = memory.hesitations >= 2 || memory.confidenceScore < 0.6;
  const skeptical = objs.filter(o => o === 'price' || o === 'insurance').length >= 1 && memory.messageCount >= 3;
  const kidFocused = ents.audienceType === 'parent' || Boolean(ents.kidAge);
  const fastMover = memory.engagementScore > 30 && memory.hesitations === 0;

  if (kidFocused) return 'BusyParent';
  if (skeptical) return 'SkepticalShopper';
  if (fastMover) return 'EagerAthlete';
  if (hesitant || ents.experience === 'Beginner') return 'NervousNewbie';
  return undefined;
}

/* ─── C2: Psychological persona inference ─── */
function inferPersona(text: string, memory: MemoryLayer, ents: Entities): Persona | undefined {
  const t = text.toLowerCase();
  if (/safe|worried|scared|risk|hurt|injury/.test(t)) return 'risk-averse';
  if (/best|top|elite|premium|prestige|only the/.test(t)) return 'status-driven';
  if (/cost|price|afford|cheap|budget|worth it/.test(t)) return 'price-sensitive';
  if (/excited|love|let'?s go|pumped|hyped|ready/.test(t)) return 'thrill-seeker';
  if (/stats|data|proof|numbers|receipts|compare/.test(t)) return 'logical';
  if (/feel|story|experience|journey|vibe/.test(t)) return 'emotional';
  // Fallback inference from memory
  if (memory.objections.includes('safety') || memory.objections.includes('kid-safety')) return 'risk-averse';
  if (memory.objections.includes('price')) return 'price-sensitive';
  if (ents.experience === 'Experienced') return 'status-driven';
  return undefined;
}

/* ─── A3: Slot show-up fit predictor ─── */
function predictShowUpFit(
  slot: ScheduleSlot,
  ents: Entities,
  memory: MemoryLayer,
  weekdayIdx: number,
  hour24: number
): number {
  let fit = 50;

  // Commute friction: same-neighborhood bonus, cross-town penalty
  if (ents.location && slot.location === ents.location) fit += 20;
  else if (ents.location) {
    const userCoord = SD_LOCATION_COORDS[ents.location];
    const slotCoord = DOJO_COORDS[slot.location];
    if (userCoord && slotCoord) {
      const dist = distanceMiles(userCoord.lat, userCoord.lng, slotCoord.lat, slotCoord.lng);
      if (dist < 2) fit += 15;
      else if (dist < 5) fit += 7;
      else if (dist > 10) fit -= 12;
    }
  }

  // Commitment-by-hour bias: evenings 5-8 = highest commit, 6AM = needs dedication
  if (slot.hour >= 17 && slot.hour <= 20) fit += 10;
  else if (slot.hour < 8) {
    if (memory.engagementScore > 40) fit += 6; // highly engaged users keep early slots
    else fit -= 8;
  }

  // Beginner dropout-risk: first slot of the week is harder to commit to
  if (ents.experience === 'Beginner' && slot.beginnerFriendly) fit += 12;
  if (ents.experience === 'Beginner' && !slot.beginnerFriendly) fit -= 25;

  // Confidence matching: low confidence → prefer weekend or later evening
  if (memory.confidenceScore < 0.6) {
    if (slot.isoDay === 6 || slot.isoDay === 0) fit += 8;
    if (slot.hour >= 18) fit += 4;
  }

  // Sameday-soon-enough bonus
  const daysAway = ((slot.isoDay - weekdayIdx + 7) % 7) || 7;
  if (daysAway <= 2) fit += 8;
  if (daysAway === 0 && slot.hour > hour24 + 2) fit += 10;

  // Scarcity: slight bonus but not overwhelming
  fit += Math.max(0, 4 - slot.spotsLeft) * 2;

  return fit;
}

/* ─── A1: Utility-score conversation state optimizer ─── */
interface UtilityScore {
  move: 'greet' | 'clarify' | 'qualify' | 'preempt' | 'offer-slots' | 'close' | 'escalate' | 'microproof' | 'story' | 'mat-tour' | 'momentum-lock' | 'drop-off-save' | 'cycle-break' | 'neighborhood-offer';
  utility: number;
  rationale: string;
}

function computeUtilityScores(
  state: ConversationState,
  entities: Entities,
  memory: MemoryLayer
): UtilityScore[] {
  const scores: UtilityScore[] = [];
  const bookingLikelihood = Math.min(1, state.leadScore / 100);
  const uncertainty = 1 - memory.confidenceScore;
  const objectionRisk = Math.min(1, memory.objections.length / 3);
  const questionBurden = Math.max(0, state.messagesSent - 4) / 10;

  const infoComplete = Boolean(entities.art && entities.experience && entities.location);

  // Close move
  if (state.leadScore >= 75 && infoComplete) {
    scores.push({ move: 'close', utility: 0.85 + bookingLikelihood * 0.15, rationale: 'Hot lead + profile complete' });
  }
  // Momentum lock
  if (state.leadScore >= 60 && state.step !== 'schedule' && state.step !== 'post-booking' && !state.momentumLockActive) {
    scores.push({ move: 'momentum-lock', utility: 0.7 + bookingLikelihood * 0.2, rationale: 'Warm lead needs micro-yes ladder' });
  }
  // Cycle break
  if (memory.cycleCount >= 1 && !state.cycleBreakShown) {
    scores.push({ move: 'cycle-break', utility: 0.95, rationale: 'Objection cycle detected' });
  }
  // Drop-off save
  if (memory.dropOffRisk > 0.55 && !state.dropOffSaveShown) {
    scores.push({ move: 'drop-off-save', utility: 0.8 + memory.dropOffRisk * 0.15, rationale: 'High drop-off risk detected' });
  }
  // Mat tour
  if ((memory.hesitations >= 2 || entities.experience === 'Beginner') && !state.matTourShown && state.step === 'schedule') {
    scores.push({ move: 'mat-tour', utility: 0.65, rationale: 'Nervous beginner at schedule step' });
  }
  // Escalate
  if (uncertainty > 0.55 || memory.cycleCount >= 2 || memory.unclearCount >= 2) {
    scores.push({ move: 'escalate', utility: 0.75 + uncertainty * 0.2, rationale: 'Uncertainty + cycle risk' });
  }
  // Offer slots
  if (infoComplete || (entities.art && entities.experience)) {
    scores.push({ move: 'offer-slots', utility: 0.6 + bookingLikelihood * 0.25, rationale: 'Profile sufficient for slot offer' });
  }
  // Preempt objections
  if (state.preemptedObjections.length < 2 && state.mode === 'explore' && !objectionRisk) {
    scores.push({ move: 'preempt', utility: 0.5, rationale: 'Fresh lead, preempt next likely objection' });
  }
  // Story
  if (memory.narrativeBeatsSent < 2 && state.mode !== 'explore') {
    scores.push({ move: 'story', utility: 0.45 + (1 - questionBurden) * 0.1, rationale: 'Narrative reinforcement opportunity' });
  }
  // Microproof
  if (memory.objections.length > 0 && state.leadScore < 65) {
    scores.push({ move: 'microproof', utility: 0.55 + objectionRisk * 0.2, rationale: 'Active objection to rebut' });
  }
  // Qualify
  if (!entities.art || !entities.audienceType) {
    scores.push({ move: 'qualify', utility: 0.4 - questionBurden * 0.2, rationale: 'Missing core profile data' });
  }
  // Greet
  if (state.messagesSent === 0) {
    scores.push({ move: 'greet', utility: 0.9, rationale: 'Cold start' });
  }
  // Clarify
  if (uncertainty > 0.3 && memory.unclearCount >= 1) {
    scores.push({ move: 'clarify', utility: 0.5 + uncertainty * 0.3, rationale: 'Ambiguous intent' });
  }

  return scores.sort((a, b) => b.utility - a.utility);
}

function pickTopMove(
  state: ConversationState,
  entities: Entities,
  memory: MemoryLayer
): UtilityScore {
  const scores = computeUtilityScores(state, entities, memory);
  return scores[0] ?? { move: 'qualify', utility: 0, rationale: 'default fallback' };
}

/* ─── A4: Multi-turn intent arbitration ─── */
function arbitrateIntent(
  intents: { intent: string; confidence: number }[],
  memory: MemoryLayer,
  state: ConversationState,
  entities: Entities
): ArbitrationMove {
  if (intents.length === 0) return 'clarify';
  const top = intents[0];
  const second = intents[1];
  const gap = second ? top.confidence - second.confidence : top.confidence;

  // Parallel: 2+ high-confidence intents with small gap
  if (second && top.confidence >= 0.45 && second.confidence >= 0.4 && gap < 0.2) {
    return 'parallel';
  }
  // Low confidence → clarify
  if (top.confidence < 0.4 || memory.unclearCount >= 2) return 'clarify';
  // High booking momentum + info complete → book
  if (state.leadScore >= 70 && entities.art && entities.experience && top.intent !== 'escalate:human') {
    return 'book';
  }
  if (top.intent === 'action:book') return 'book';
  // Fresh objection coming → preempt before answering
  if (state.mode === 'explore' && state.preemptedObjections.length === 0 && !top.intent.startsWith('objection:')) {
    return 'preempt';
  }
  return 'answer';
}

/* ─── A5: Churn-risk + conversion-readiness dual prediction ─── */
function computeChurnRisk(memory: MemoryLayer, responseTimes: number[]): number {
  let risk = 0;
  if (memory.hesitations >= 3) risk += 0.25;
  if (memory.cycleCount >= 1) risk += 0.2;
  if (memory.unclearCount >= 2) risk += 0.15;
  if (memory.confidenceScore < 0.5) risk += 0.2;
  if (memory.sameMessageTwice) risk += 0.15;
  // Slow response trend (avg of last 3 vs last 6 — slowing down = disengaging)
  if (responseTimes.length >= 6) {
    const recent = responseTimes.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlier = responseTimes.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    if (recent > earlier * 1.5) risk += 0.1;
  }
  return Math.min(1, risk);
}

function computeConversionReadiness(
  state: ConversationState,
  memory: MemoryLayer,
  ents: Entities
): number {
  let r = 0;
  r += Math.min(0.35, state.leadScore / 100 * 0.5);
  if (ents.art) r += 0.1;
  if (ents.experience) r += 0.1;
  if (ents.location) r += 0.08;
  if (ents.audienceType) r += 0.05;
  if (memory.engagementScore > 30) r += 0.1;
  if (state.mode === 'close') r += 0.15;
  if (state.preemptedObjections.length > 0) r += 0.05;
  r -= Math.min(0.2, memory.objections.length * 0.05);
  r -= Math.min(0.15, memory.hesitations * 0.05);
  return Math.max(0, Math.min(1, r));
}

/* ─── C4: Drop-off prediction ─── */
function detectDropOffSignals(memory: MemoryLayer, responseTimes: number[]): boolean {
  if (memory.hesitations >= 3 && memory.confidenceScore < 0.55) return true;
  if (memory.sameMessageTwice && memory.unclearCount >= 1) return true;
  if (responseTimes.length >= 4) {
    const last = responseTimes[responseTimes.length - 1];
    const avg = responseTimes.slice(0, -1).reduce((a, b) => a + b, 0) / (responseTimes.length - 1);
    if (last > avg * 2.2 && avg > 2000) return true;
  }
  return false;
}

/* ─── A6: Booking-reason determination (for personalized nurture) ─── */
function determineBookingReason(
  memory: MemoryLayer,
  ents: Entities,
  slot: ScheduleSlot
): BookingReason {
  if (ents.audienceType === 'parent' || ents.kidAge) {
    if (memory.objections.includes('kid-safety') || memory.objections.includes('safety')) return 'kid-safety';
  }
  if (memory.objections.includes('safety')) return 'injury-concern';
  if (memory.objections.includes('price') && memory.objectionCounts.price! >= 2) return 'price-value';
  if (memory.objections.includes('time') || ents.preferredTime) return 'schedule-fit';
  if (ents.experience === 'Beginner') return 'beginner-friendly';
  if (ents.location && slot.location === ents.location) return 'location-convenience';
  if (memory.engagementScore > 40) return 'social-energy';
  return 'exploratory';
}

/* ─── B4 / C1: A/B/C rebuttal variant picker + outcome tracking ─── */
interface RebuttalStat {
  variantId: string;
  shown: number;
  nextAction: number; // clicks toward slots or booking
  bookings: number;
}

const REBUTTAL_STATS_KEY = 'matboss_rebuttal_stats_v1';

function loadRebuttalStats(): Record<string, RebuttalStat> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(REBUTTAL_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRebuttalStats(stats: Record<string, RebuttalStat>) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(REBUTTAL_STATS_KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}

function logRebuttalShown(variantId: string) {
  const stats = loadRebuttalStats();
  if (!stats[variantId]) stats[variantId] = { variantId, shown: 0, nextAction: 0, bookings: 0 };
  stats[variantId].shown += 1;
  saveRebuttalStats(stats);
}

function logRebuttalOutcome(variantId: string, outcome: 'nextAction' | 'booking') {
  const stats = loadRebuttalStats();
  if (!stats[variantId]) stats[variantId] = { variantId, shown: 0, nextAction: 0, bookings: 0 };
  if (outcome === 'nextAction') stats[variantId].nextAction += 1;
  if (outcome === 'booking') stats[variantId].bookings += 1;
  saveRebuttalStats(stats);
}

function pickRebuttalVariant(
  objection: ObjectionKey,
  archetype: Archetype | undefined,
  persona: Persona | undefined,
  alreadyShown: string[]
): RebuttalVariant {
  const bank = REBUTTAL_BANK[objection];
  const stats = loadRebuttalStats();
  const style = archetype ? ARCHETYPE_PROFILES[archetype].preferredProofStyle : undefined;

  // Filter out already-shown variants if alternates exist
  const available = bank.filter(v => !alreadyShown.includes(v.id));
  const pool = available.length > 0 ? available : bank;

  // Score each variant: tone fit + historical performance (epsilon-greedy exploration)
  const scored = pool.map(v => {
    let score = 0;
    if (style && v.toneFit.includes(style)) score += 1.2;
    if (persona === 'logical' && v.toneFit.includes('stats-first')) score += 0.5;
    if (persona === 'emotional' && v.toneFit.includes('empathy-first')) score += 0.6;
    if (persona === 'risk-averse' && v.toneFit.includes('empathy-first')) score += 0.4;
    if (persona === 'price-sensitive' && v.toneFit.includes('skeptic-data')) score += 0.4;
    const s = stats[v.id];
    if (s && s.shown > 0) {
      const ctr = (s.nextAction + s.bookings * 3) / s.shown;
      score += ctr;
    }
    // Epsilon-greedy: 15% random exploration
    if (Math.random() < 0.15) score += Math.random() * 0.8;
    return { v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].v;
}

/* ─── C3: Story picker for narrative engine ─── */
function pickStoryForMoment(
  archetype: Archetype | undefined,
  lastObjection: ObjectionKey | undefined,
  alreadyShown: string[]
): NarrativeStory | null {
  const pool = STORIES.filter(s => !alreadyShown.includes(s.tag));
  if (pool.length === 0) return null;
  const scored = pool.map(s => {
    let score = 0;
    if (archetype && s.archetypeFit.includes(archetype)) score += 1.5;
    if (lastObjection && s.objectionFit.includes(lastObjection)) score += 1.2;
    if (s.objectionFit.includes('general')) score += 0.3;
    score += Math.random() * 0.3;
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].s;
}

/* ─── B5: 1-mile geo-fence offer ─── */
function computeNeighborhoodOffer(userLat: number, userLng: number): { dojo: SDNeighborhood; distanceMi: number; discount: number } | null {
  let closest: { dojo: SDNeighborhood; distanceMi: number } | null = null;
  for (const [name, coords] of Object.entries(DOJO_COORDS)) {
    const d = distanceMiles(userLat, userLng, coords.lat, coords.lng);
    if (!closest || d < closest.distanceMi) {
      closest = { dojo: name as SDNeighborhood, distanceMi: d };
    }
  }
  if (!closest) return null;
  if (closest.distanceMi <= 1.0) return { ...closest, discount: 20 };
  if (closest.distanceMi <= 2.0) return { ...closest, discount: 10 };
  return null;
}

/* ─── B3 + D1: Sentiment-adaptive + user-pace mirror typing delay ─── */
function computeAdaptiveDelay(
  previousBotText: string,
  nextKind: MessageKind,
  sentiment: 'neg' | 'neu' | 'pos',
  archetype: Archetype | undefined,
  userResponseTimesMs: number[]
): number {
  const readingTime = Math.min(3500, previousBotText.length * 22);
  let thinking = 600;
  switch (nextKind) {
    case 'schedule':           thinking = 1100 + Math.random() * 400; break;
    case 'microproof':         thinking = 900 + Math.random() * 300; break;
    case 'empathy':            thinking = 500 + Math.random() * 200; break;
    case 'clarify':            thinking = 700 + Math.random() * 300; break;
    case 'human-shadow':       thinking = 1400 + Math.random() * 500; break;
    case 'mat-tour':           thinking = 1200 + Math.random() * 400; break;
    case 'story':              thinking = 950 + Math.random() * 350; break;
    case 'cycle-breaker':      thinking = 1300 + Math.random() * 400; break;
    case 'drop-off-save':      thinking = 600 + Math.random() * 250; break;
    case 'momentum-lock':      thinking = 450 + Math.random() * 200; break;
    case 'parallel-answer':    thinking = 1000 + Math.random() * 350; break;
    case 'neighborhood-offer': thinking = 1100 + Math.random() * 350; break;
    default:                   thinking = 500 + Math.random() * 350;
  }

  // B3: sentiment pacing
  let sentimentMult = 1;
  if (sentiment === 'pos') sentimentMult = 0.6; // 40% faster for excited
  else if (sentiment === 'neg') sentimentMult = 1.5; // 50% slower for nervous

  // D3: archetype pacing
  const archMult = archetype ? ARCHETYPE_PROFILES[archetype].pacingMultiplier : 1;

  // D1: user-pace mirror
  let mirrorFactor = 1;
  if (userResponseTimesMs.length >= 2) {
    const recent = userResponseTimesMs.slice(-4);
    const avgUserPace = recent.reduce((a, b) => a + b, 0) / recent.length;
    mirrorFactor = Math.max(0.7, Math.min(1.3, avgUserPace / 1800));
  }

  return Math.max(400, readingTime * 0.3 + thinking * sentimentMult * archMult * mirrorFactor);
}

/* ─── D5: Session replay learning — extract high-signal phrases ─── */
const LEARNED_INTENTS_KEY = 'matboss_learned_intents_v1';
interface LearnedIntent { phrase: string; intent: string; weight: number }

function loadLearnedIntents(): LearnedIntent[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(LEARNED_INTENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLearnedIntents(intents: LearnedIntent[]) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(LEARNED_INTENTS_KEY, JSON.stringify(intents.slice(0, 200)));
  } catch { /* ignore */ }
}

function replayAndLearn(messages: ChatMessage[], outcomeWeight: number) {
  const learned = loadLearnedIntents();
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.sender !== 'user') continue;
    const conf = m.meta?.confidence ?? 0;
    const intent = m.meta?.intent;
    if (intent && conf < 0.45 && conf > 0 && m.text.length < 90) {
      // Low-confidence intent that led to eventual success → capture phrase
      const phrase = m.text.toLowerCase().trim();
      const existing = learned.find(l => l.phrase === phrase);
      if (existing) existing.weight = Math.min(2, existing.weight + outcomeWeight * 0.5);
      else learned.push({ phrase, intent, weight: outcomeWeight });
    }
  }
  saveLearnedIntents(learned);
}

function applyLearnedIntents(text: string, baseScores: { intent: string; confidence: number }[]): { intent: string; confidence: number }[] {
  const learned = loadLearnedIntents();
  if (learned.length === 0) return baseScores;
  const tokensInText = tokenize(text);
  const boosts: Record<string, number> = {};
  for (const l of learned) {
    const phraseTokens = tokenize(l.phrase);
    if (phraseTokens.length === 0) continue;
    const overlap = phraseTokens.filter(t => tokensInText.includes(t)).length / phraseTokens.length;
    if (overlap >= 0.6) {
      boosts[l.intent] = (boosts[l.intent] ?? 0) + l.weight * overlap * 0.3;
    }
  }
  const adjusted = [...baseScores];
  for (const [intent, boost] of Object.entries(boosts)) {
    const existing = adjusted.find(s => s.intent === intent);
    if (existing) existing.confidence = Math.min(1, existing.confidence + boost);
    else adjusted.push({ intent, confidence: Math.min(1, boost) });
  }
  adjusted.sort((a, b) => b.confidence - a.confidence);
  return adjusted;
}

/* ─── D6: Nurture checkpoints scheduler ─── */
interface NurtureCheckpoint {
  tag: 'day-minus-3' | 'day-minus-1' | 'day-zero-morning';
  fireAtMs: number;
  message: string;
}

function scheduleNurtureCheckpoints(
  slot: ScheduleSlot,
  weekdayIdx: number,
  nowMs: number,
  bookingReason?: BookingReason
): NurtureCheckpoint[] {
  const daysAway = ((slot.isoDay - weekdayIdx + 7) % 7) || 7;
  const dayMs = 24 * 60 * 60 * 1000;
  const classMs = nowMs + daysAway * dayMs;
  const reasonNudge = buildBookingReasonNudge(bookingReason, slot);
  // For demo purposes, compress the real day-timers into ~seconds of live preview
  // (production would use actual cron/SMS; here we just preview them soon so you can see the flow)
  const out: NurtureCheckpoint[] = [];
  if (daysAway >= 3) {
    out.push({
      tag: 'day-minus-3',
      fireAtMs: nowMs + 8000,
      message: `📹💎 T-minus 3 days to your ${slot.art} class at ${slot.location}! 🔥 ${reasonNudge} Here's your 60-sec warm-up drill + mindset video: pcmadojo.com/warmup/${slot.art.toLowerCase().replace(/\s+/g, '-')} ✨ Watch it once and you'll walk in feeling LEGENDARY! 🏆`,
    });
  }
  if (daysAway >= 1) {
    out.push({
      tag: 'day-minus-1',
      fireAtMs: nowMs + 16000,
      message: `🅿️🗺️ TOMORROW IS THE DAY, champion!! 🔥 ${reasonNudge} Parking guide for ${slot.location}: pcmadojo.com/parking/${slot.location.toLowerCase().replace(/\s+/g, '-')} ✨ Lot A first, side-street backup included. Arrive 15 min early, hydrate, sleep well! 💤💧 This is YOUR moment! 💎🥋`,
    });
  }
  out.push({
    tag: 'day-zero-morning',
    fireAtMs: Math.max(nowMs + 24000, classMs - 4 * 60 * 60 * 1000),
    message: `🔥🌅 TODAY'S THE DAY, WARRIOR!! 💎 ${reasonNudge} Your ${slot.day} ${slot.time} class at ${slot.location} is LOCKED AND LOADED! ✨ Remember: ego off, curiosity on, tap-first culture rules! You're gonna CRUSH this! 💪🥋🏆 Sensei Carlos will greet you personally! 👑`,
  });
  return out;
}

/* ─── PERSISTENCE ─── */
const STORAGE_KEY = 'matboss_bot_profile_v1';

interface StoredProfile {
  entities: Entities;
  memory: MemoryLayer;
  state: Partial<ConversationState>;
  lastVisit: string;
  sessionId: string;
}

function loadProfile(): StoredProfile | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveProfile(data: StoredProfile) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

function clearProfile() {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
                            MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const INITIAL_STATE: ConversationState = {
  step: 'greeting',
  mode: 'explore',
  leadScore: 30,
  hotLead: false,
  humanShadowActive: false,
  preemptedObjections: [],
  messagesSent: 0,
  idleStrikes: 0,
  neighborhoodOfferShown: false,
  matTourShown: false,
  cycleBreakShown: false,
  momentumLockActive: false,
  dropOffSaveShown: false,
  calendarShared: false,
  liveActivityTicks: 0,
};

const INITIAL_MEMORY: MemoryLayer = {
  objections: [],
  objectionCounts: {},
  objectionDecay: {},
  cycleCount: 0,
  hesitations: 0,
  engagementScore: 0,
  messageCount: 0,
  sameMessageTwice: false,
  lastUserMessage: '',
  confidenceScore: 1.0,
  unclearCount: 0,
  userResponseTimesMs: [],
  dropOffRisk: 0,
  conversionReadiness: 0,
  churnRisk: 0,
  storiesShown: [],
  narrativeBeatsSent: 0,
};

export default function LiveBookingBot() {
  const clock = useSanDiegoClock(1000);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [entities, setEntities] = useState<Entities>({});
  const [memory, setMemory] = useState<MemoryLayer>(INITIAL_MEMORY);
  const [state, setState] = useState<ConversationState>(INITIAL_STATE);
  const [slots, setSlots] = useState<ScheduleSlot[]>(BASE_SLOTS);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isReturning, setIsReturning] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('unknown');
  const [lastOfferedSlots, setLastOfferedSlots] = useState<ScheduleSlot[]>([]);
  const [lastActivityAt, setLastActivityAt] = useState<number>(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const idleTimerRef = useRef<number | null>(null);
  const strike2TimerRef = useRef<number | null>(null);
  const strike3TimerRef = useRef<number | null>(null);
  const liveActivityTimerRef = useRef<number | null>(null);
  const nurtureTimerRefs = useRef<number[]>([]);
  const hiddenAtRef = useRef<number | null>(null);
  const bootedRef = useRef(false);
  const sessionIdRef = useRef(`local-${Math.random().toString(36).slice(2, 8)}`);
  const hasEscalatedRef = useRef(false);
  const hasShownIdleNudgeRef = useRef(false);
  const postEscalationTurnRef = useRef(0);
  const lastBotSentAtRef = useRef<number>(Date.now()); // D1: for user-pace mirror
  const rebuttalsShownRef = useRef<string[]>([]); // track variants shown this session
  const activeVariantIdRef = useRef<string | null>(null); // variant awaiting outcome

  /* ─── Persist on every change ─── */
  useEffect(() => {
    if (!bootedRef.current) return;
    saveProfile({
      entities,
      memory,
      state: { step: state.step, leadScore: state.leadScore, mode: state.mode },
      lastVisit: new Date().toISOString(),
      sessionId: sessionIdRef.current,
    });
  }, [entities, memory, state]);

  /* ─── Rehydrate on mount ─── */
  useEffect(() => {
    const browserTz = typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : '';
    const appearsLocal = !browserTz || browserTz === 'America/Los_Angeles';
    setGeoStatus(appearsLocal ? 'local' : 'non-local');

    const profile = loadProfile();
    if (profile && profile.entities && Object.keys(profile.entities).length > 0) {
      sessionIdRef.current = profile.sessionId || sessionIdRef.current;
      setIsReturning(true);
      setEntities(profile.entities);
      setMemory(prev => ({ ...prev, ...profile.memory }));
      if (profile.entities.location) setGeoStatus('shared');
      const lastVisit = new Date(profile.lastVisit);
      const hoursAgo = Math.round((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60));
      const welcomeText = profile.entities.name
        ? `🔥🔥🔥 NO WAY — ${profile.entities.name} is BACK! 👊💥 I literally remember you ${hoursAgo < 1 ? 'just now' : hoursAgo < 24 ? `from ${hoursAgo}h ago` : 'from last time'}${profile.entities.art ? ` — you were vibing on ${profile.entities.art}` : ''}${profile.entities.experience ? ` as a total ${profile.entities.experience.toLowerCase()} warrior` : ''}! 🥋✨ The mat's been waiting for you! Ready to pick up where we left off and make this HAPPEN? 💪🔥`
        : `🔥 WELCOME BACK, legend!! 👋💥 I remember our last chat${profile.entities.art ? ` — you were eyeing ${profile.entities.art} and I could FEEL the energy` : ''}! 🥋✨ The universe brought you back for a reason — ready to pick up where we left off? Let's GO! 🚀💪`;

      window.setTimeout(() => {
        pushBot({
          kind: 'rehydrate',
          text: welcomeText,
          quickReplies: getSmartReplies({
            step: 'greeting',
            entities: profile.entities,
            memory: profile.memory,
            recentMessages: [],
            geoStatus: profile.entities.location ? 'shared' : (appearsLocal ? 'local' : 'non-local'),
            fallback: ['Yes, continue', 'Start fresh', 'Show me slots'],
          }),
        });
      }, 700);
    } else {
      // Cold greeting
      window.setTimeout(() => {
        pushBot({
          kind: 'quick-replies',
          text: `👊💥 YOOO what's good!! Welcome to Pacific Coast Martial Arts — San Diego's ABSOLUTE FINEST! 🏆🔥 I'm the MatBoss booking engine, trained on every single dojo question known to mankind! 🧠💪 It's ${clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')} ${clock.tzLabel} right now at the dojo and the energy is ELECTRIC! ⚡${appearsLocal ? '' : ` 🌍 Looks like you might be joining us from outside San Diego — no worries, I've got travel-friendly AND virtual options that'll BLOW YOUR MIND! ✈️🎯`} So tell me — what brought the FUTURE WARRIOR to our door today?! 🥋🔥✨`,
          quickReplies: getSmartReplies({
            step: 'greeting',
            entities: {},
            memory: INITIAL_MEMORY,
            recentMessages: [],
            geoStatus: appearsLocal ? 'local' : 'non-local',
            fallback: ['I want to try a class', 'Is it safe for beginners?', 'Book a kids trial', 'What do you offer?'],
          }),
        });
      }, 800);
    }
    bootedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Auto-scroll ─── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  /* ─── B6: Three-Strike Idle Re-Engagement Sequence (45s / 3m / 5m escalation) ─── */
  useEffect(() => {
    if (state.step !== 'schedule') return;
    if (hasEscalatedRef.current) return;
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (strike2TimerRef.current) window.clearTimeout(strike2TimerRef.current);
    if (strike3TimerRef.current) window.clearTimeout(strike3TimerRef.current);

    const clearAll = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (strike2TimerRef.current) window.clearTimeout(strike2TimerRef.current);
      if (strike3TimerRef.current) window.clearTimeout(strike3TimerRef.current);
    };

    // STRIKE 1: 45s light nudge
    idleTimerRef.current = window.setTimeout(() => {
      if (hasEscalatedRef.current) return;
      if (Date.now() - lastActivityAt < 44000) return;
      const featuredSlot = lastOfferedSlots[0] || slots[0];
      if (!hasShownIdleNudgeRef.current) {
        const shouldMatTour =
          !state.matTourShown
          && (memory.hesitations >= 2 || /nervous|scared|not sure what to expect|what happens/i.test(memory.lastUserMessage));

        if (shouldMatTour) {
          pushBot({
            kind: 'mat-tour',
            text: `🎥✨💎 Before you bounce, let me run the 20-second MENTAL MAT TOUR so your brain stops inventing monsters that aren't there. 🫂🥋 Here's what this experience ACTUALLY feels like:`,
            matTourScenes: buildMatTourScenes(featuredSlot, entities),
            quickReplies: ['Show me that slot', 'I want the beginner-friendly one', 'Talk to Carlos'],
          });
          setMemory(m => ({ ...m, hesitations: m.hesitations + 1 }));
          hasShownIdleNudgeRef.current = true;
          setState(prev => ({ ...prev, idleStrikes: 1, matTourShown: true }));
          return;
        }

        pushBot({
          kind: 'text',
          text: `👋🔥 Hey — still with me, legend?! 💎 I see you vibing with the slots and I RESPECT that energy! ✨ Just HOLDING this ${featuredSlot?.day} ${featuredSlot?.time} at ${featuredSlot?.location} slot warm for you — no pressure, all patience! 🫂🔒⏰ Only ${featuredSlot?.spotsLeft} spots remain and momentum is MOVING! 🚀💪`,
        });
        setMemory(m => ({ ...m, hesitations: m.hesitations + 1 }));
        hasShownIdleNudgeRef.current = true;
        setState(prev => ({ ...prev, idleStrikes: 1 }));
      }
    }, 45000) as unknown as number;

    // STRIKE 2: 3m value reminder
    strike2TimerRef.current = window.setTimeout(() => {
      if (hasEscalatedRef.current) return;
      if (Date.now() - lastActivityAt < 175000) return;
      const featuredSlot = lastOfferedSlots[0] || slots[0];
      const artName = featuredSlot?.art ?? 'class';
      pushBot({
        kind: 'drop-off-save',
        text: `💎✨ Btw — every single beginner who walked into that ${artName} class told me they were nervous too… and left feeling like LITERAL SUPERHEROES! 🦸‍♂️🔥 Just wanted you to know there's a WHOLE tribe of warriors who stood EXACTLY where you are right now. 🫂💪 The mat's still waiting — zero judgment, pure welcome! 🥋🌟`,
      });
      setMemory(m => ({ ...m, hesitations: m.hesitations + 1 }));
      setState(prev => ({ ...prev, idleStrikes: 2 }));
    }, 180000) as unknown as number;

    // STRIKE 3: 5m scarcity + silent escalation (hot leads only)
    strike3TimerRef.current = window.setTimeout(() => {
      if (hasEscalatedRef.current) return;
      if (Date.now() - lastActivityAt < 295000) return;
      const featuredSlot = lastOfferedSlots[0] || slots[0];
      pushBot({
        kind: 'drop-off-save',
        text: `⏰🚨💎 LAST call on ${featuredSlot?.day} at ${featuredSlot?.time}, champion! 🔥 Since you're clearly a high-signal lead, I'm flagging this for Carlos to text you a direct booking link in case you got pulled into life. 📲✨ NO pressure, just options — you pick your own adventure! 🎯 Want me to queue that human handoff?! 👑`,
        quickReplies: ['Yes, text me the link', 'Keep me in chat', 'Book right now'],
      });
      setState(prev => ({ ...prev, idleStrikes: 3 }));
      if (state.hotLead) {
        // Silent escalation trigger for hot leads
        setState(prev => ({ ...prev, humanShadowActive: true }));
      }
    }, 300000) as unknown as number;

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities, lastActivityAt, lastOfferedSlots, memory.hesitations, memory.lastUserMessage, slots, state.hotLead, state.matTourShown, state.step]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (
        state.step === 'schedule'
        && !hasEscalatedRef.current
        && hiddenAtRef.current
        && Date.now() - hiddenAtRef.current >= 45000
      ) {
        const featuredSlot = lastOfferedSlots[0];
        pushBot({
          kind: 'text',
          text: featuredSlot
            ? `🙌✨ WELCOME BACK, champion!! 🔥💎 I literally kept the ${featuredSlot.day} ${featuredSlot.time} ${featuredSlot.label} option pinned to the TOP like your own personal VIP lane! 👑🎯 Want me to HOLD it while you peek at your calendar?! ⏰🔒`
            : '🎉🔥 WELCOME BACK, legend!! 💎✨ Want me to keep the best beginner slot warm and toasty while you decide?! 🥋⚡',
        });
        setMemory(prev => ({ ...prev, hesitations: prev.hesitations + 1 }));
      }

      hiddenAtRef.current = null;
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [lastOfferedSlots, state.step]);

  /* ─── B2: Real-time social proof activity feed (inject live events every 28-46s while on schedule step) ─── */
  useEffect(() => {
    if (state.step !== 'schedule' && state.step !== 'qualify-exp' && state.step !== 'micro-day-pref' && state.step !== 'micro-time-pref') {
      if (liveActivityTimerRef.current) window.clearTimeout(liveActivityTimerRef.current);
      return;
    }
    if (hasEscalatedRef.current) return;

    const scheduleNext = () => {
      const wait = 28000 + Math.random() * 18000;
      liveActivityTimerRef.current = window.setTimeout(() => {
        if (hasEscalatedRef.current) return;
        if (state.step === 'post-booking' || state.step === 'escalate') return;
        // Pick a random live-activity template
        const featuredSlot = lastOfferedSlots[0] || slots[Math.floor(Math.random() * slots.length)];
        const kind: 'booking' | 'viewing' | 'arriving' = Math.random() < 0.5 ? 'booking' : Math.random() < 0.7 ? 'viewing' : 'arriving';
        const templates = LIVE_ACTIVITY_TEMPLATES[kind];
        let text = templates[Math.floor(Math.random() * templates.length)];
        text = text
          .replace('{nbhd}', featuredSlot?.location ?? 'North Park')
          .replace('{day}', featuredSlot?.day ?? 'Tue')
          .replace('{time}', featuredSlot?.time ?? '6:30 PM')
          .replace('{art}', featuredSlot?.art ?? 'BJJ')
          .replace('{count}', String(3 + Math.floor(Math.random() * 6)))
          .replace('{adjective}', NBHD_ADJECTIVES[Math.floor(Math.random() * NBHD_ADJECTIVES.length)])
          .replace('{archetype}', ['nervous beginner', 'eager athlete', 'focused parent'][Math.floor(Math.random() * 3)]);
        pushBot({
          kind: 'live-activity',
          text,
          liveActivityKind: kind,
        });
        setState(prev => ({ ...prev, liveActivityTicks: prev.liveActivityTicks + 1 }));
        scheduleNext();
      }, wait) as unknown as number;
    };
    scheduleNext();

    return () => {
      if (liveActivityTimerRef.current) window.clearTimeout(liveActivityTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, lastOfferedSlots, slots]);

  /* ─── D6: Post-booking nurture checkpoint timers (cleanup on unmount) ─── */
  useEffect(() => {
    return () => {
      nurtureTimerRefs.current.forEach(t => window.clearTimeout(t));
    };
  }, []);

  /* ─── Message factories ─── */
  const pushBot = useCallback((opts: Omit<ChatMessage, 'id' | 'sender'>) => {
    setMessages(prev => [...prev, { id: nextId.current++, sender: 'bot', ...opts }]);
  }, []);

  const pushHuman = useCallback((opts: Omit<ChatMessage, 'id' | 'sender'>) => {
    setMessages(prev => [...prev, { id: nextId.current++, sender: 'human', ...opts }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages(prev => [...prev, { id: nextId.current++, sender: 'user', kind: 'text', text }]);
  }, []);

  const recentMessages = useMemo(() => messages.slice(-3), [messages]);

  const getMatchedSlots = useCallback((
    ents: Entities,
    memoryOverride: MemoryLayer = memory,
    calendarSharedOverride: boolean = state.calendarShared
  ) => {
    const baseMatches = matchSlots(ents, slots, memoryOverride, {
      weekdayIdx: clock.weekdayIdx,
      hour24: clock.hour24,
    });

    if (!calendarSharedOverride) {
      return { matched: baseMatches, conflictsRemoved: 0 };
    }

    const busySlotIds = getDemoCalendarBusySlotIds(baseMatches, ents, sessionIdRef.current);
    const filtered = baseMatches.filter(slot => !busySlotIds.has(slot.id));
    return {
      matched: filtered.length > 0 ? filtered : baseMatches,
      conflictsRemoved: Math.max(0, baseMatches.length - filtered.length),
    };
  }, [clock.hour24, clock.weekdayIdx, memory, slots, state.calendarShared]);

  const resolveLocationSignal = useCallback((location: SDNeighborhood, source: GeoStatus, distance?: number, userCoords?: { lat: number; lng: number }) => {
    setEntities(prev => ({ ...prev, location, travelMode: distance && distance > 80 ? 'visitor' : (prev.travelMode || 'local') }));
    setGeoStatus(source);

    if (distance && distance > 80) {
      pushBot({
        kind: 'quick-replies',
        text: `🌍✈️ Whoa — you're about ${Math.round(distance)} miles from our nearest San Diego location (${location})! But distance is NOTHING when the warrior spirit calls! 🔥💪 I've got travel-friendly weekend slots that'll work PERFECTLY or a killer 10-minute virtual intro with Carlos himself! 🎯⚡ Let's make this happen no matter WHERE you are! 🚀`,
        quickReplies: getSmartReplies({
          step: 'greeting',
          entities: { ...entities, location, travelMode: 'visitor' },
          memory,
          recentMessages,
          geoStatus: 'non-local',
          fallback: ['Show weekend traveler slots', 'Book a virtual intro', "I'll be in San Diego soon"],
        }),
      });
      return;
    }

    // B5: 1-mile hyper-local "Local Legend" offer
    if (userCoords && !state.neighborhoodOfferShown) {
      const offer = computeNeighborhoodOffer(userCoords.lat, userCoords.lng);
      if (offer && offer.distanceMi <= 1.0) {
        const walkMin = Math.max(2, Math.round(offer.distanceMi * 20));
        pushBot({
          kind: 'neighborhood-offer',
          text: `🔥🏆🎉 OKAY WAIT — you are LITERALLY a ${walkMin}-minute walk from our ${offer.dojo} dojo!! 🚶✨💎 Because you're a NEIGHBOR, I am UNLOCKING our exclusive "Local Legend" rate — FIRST MONTH ${offer.discount}% OFF, zero strings, zero tricks, just neighborhood energy! 🎁👑 This is a hyper-local perk we DO NOT publish anywhere! 🤫 Want me to HOLD that rate for you right NOW?! 🔒⚡`,
          neighborhoodOffer: offer,
          quickReplies: ['🔥 HOLD the Local Legend rate!', 'Tell me more first', 'Show slots without the discount'],
        });
        setState(prev => ({ ...prev, neighborhoodOfferShown: true }));
        return;
      }
    }

    pushBot({
      kind: 'text',
      text: `📍🔥💥 BOOM — ${location} is DIALED IN and honestly? It's the CROWN JEWEL of our whole San Diego empire! 🏆👑✨ I'm locking that in right now and pulling up the MOST ELITE schedule the universe has ever seen — curated JUST for you! 🌟🎯 The mats in ${location} have been waiting for a warrior exactly like you! 💪🥋⚡ Let's GOOOO! 🚀🔥`,
    });
  }, [entities, memory, pushBot, recentMessages, state.neighborhoodOfferShown]);

  const requestPreciseLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      pushBot({
        kind: 'quick-replies',
        text: "🤖💥 Whoops — your browser is playing hard to get with location sharing! 😅 NO STRESS AT ALL, legend — just drop your ZIP code and I'll work my MAGIC! ✨🔮 Or tap the closest neighborhood below and I'll instantly dial you into the perfect dojo! 🎯🔥",
        quickReplies: ['92103', '92109', '91910'],
      });
      return;
    }

    setThinking(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setThinking(false);
        const nearest = nearestNeighborhood(position.coords.latitude, position.coords.longitude);
        resolveLocationSignal(
          nearest.neighborhood,
          nearest.distance > 80 ? 'non-local' : 'shared',
          nearest.distance,
          { lat: position.coords.latitude, lng: position.coords.longitude }
        );
      },
      () => {
        setThinking(false);
        setGeoStatus('denied');
        pushBot({
          kind: 'quick-replies',
          text: "🙌✨ Totally respect the privacy vibes — I LOVE that energy! 💯🔒 Just toss me a ZIP code or tap the neighborhood closest to your warrior headquarters below! 🎯🥋 We'll make this absolute MAGIC happen! 🔥⚡",
          quickReplies: ['92103', '92109', '91910'],
        });
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 600_000 }
    );
  }, [pushBot, resolveLocationSignal]);

  /* ─── Main send flow ─── */
  const send = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    setShowSuggestions(false);
    setLastActivityAt(Date.now());

    // Special rehydrate responses
    if (isReturning && text.toLowerCase().includes('start fresh')) {
      clearProfile();
      setEntities({});
      setMemory(INITIAL_MEMORY);
      setState(INITIAL_STATE);
      setMessages([]);
      setIsReturning(false);
      nextId.current = 1;
      window.setTimeout(() => {
        pushBot({
          kind: 'quick-replies',
          text: "🆕✨💥 FRESH SLATE, CLEAN WARRIOR ENERGY — I am OBSESSED with this reset vibe! 🔄💪🔥 I'm the MatBoss booking engine, I've literally been engineered to make champions out of humans, and I am ABSOLUTELY FIRED UP to build something LEGENDARY with you! 🥋⚡🏆 So speak it into existence — what is calling your warrior spirit into our dojo today?! 👊💥🌟 Let's MAKE HISTORY! 🚀",
          quickReplies: ['🥋 I want to try a class!', '🛡️ Is it safe?', '👶 Kids trial!'],
        });
      }, 500);
      return;
    }

    pushUser(text);
    setInput('');

    if (/use my location/i.test(text)) {
      requestPreciseLocation();
      return;
    }

    // B1: Calendar availability share
    if (/share.*availability|share.*calendar|calendar.*share|connect.*calendar/i.test(text)) {
      handleCalendarShare();
      return;
    }

    // B5: Local Legend offer acceptance
    if (/hold.*local legend|local legend.*rate|yes.*local legend/i.test(text)) {
      pushBot({
        kind: 'text',
        text: `🔒🔥💎 LOCKED IN!! Local Legend rate is OFFICIALLY held in your name for 48 hours — Carlos flagged it and everything! 👑✨ Now let's get you on the mat — pulling your neighborhood-optimized slots RIGHT NOW! 🥋⚡🚀`,
      });
      window.setTimeout(() => offerSlots({ ...entities }), 900);
      return;
    }

    if (/show weekend traveler slots/i.test(text)) {
      const visitorEntities: Entities = { ...entities, travelMode: 'visitor', preferredDay: 'weekend' };
      setEntities(visitorEntities);
      pushBot({
        kind: 'text',
        text: "✈️🔥 TRAVEL-FRIENDLY MODE = FULLY ACTIVATED! 🌍⚡ I'm ruthlessly prioritizing weekend slots and keeping the schedule lean, mean, and BEAUTIFUL for your adventure! 🎯🥋 Distance is just a number when you've got warrior spirit — watch THIS! 💪✨🚀",
      });
      offerSlots(visitorEntities);
      return;
    }

    if (/book a virtual intro/i.test(text)) {
      const virtualEntities: Entities = { ...entities, travelMode: 'virtual' };
      setEntities(virtualEntities);
      triggerEscalation('Virtual intro requested by user.');
      return;
    }

    const explicitZip = text.match(/\b(92\d{3})\b/);
    if (explicitZip && ZIP_TO_NEIGHBORHOOD[explicitZip[1]]) {
      resolveLocationSignal(ZIP_TO_NEIGHBORHOOD[explicitZip[1]], 'shared');
      if (/^\s*92\d{3}\s*$/.test(text)) return;
    }

    setThinking(true);

    const sentAt = performance.now();

    // D1: user-pace mirror — measure time between last bot message and this user reply
    const userReplyMs = Math.max(300, Date.now() - lastBotSentAtRef.current);

    // Score intents + apply learned patterns (D5)
    const rawIntents = scoreIntents(text);
    const intents = applyLearnedIntents(text, rawIntents);
    const topIntent = intents[0];
    const sentiment = detectSentiment(text);

    // Extract entities
    const newEntities = extractEntities(text, entities);
    const gainedEntity = Object.keys(newEntities).length > Object.keys(entities).length;
    const nextMemory = deriveNextMemory(memory, text, topIntent, gainedEntity, responseTimes, userReplyMs);

    // D3: Archetype detection (lock in after message 3, don't flip)
    let nextState = deriveNextState(state, topIntent);
    if (!nextState.archetype && nextMemory.messageCount >= 3) {
      const detected = detectArchetype(newEntities, nextMemory);
      if (detected) nextState = { ...nextState, archetype: detected };
    }

    // A5: update conversion readiness now that state is derived
    nextMemory.conversionReadiness = computeConversionReadiness(nextState, nextMemory, newEntities);

    setMemory(nextMemory);
    setEntities(newEntities);
    setState(nextState);

    // B3 + D1 + D3: adaptive delay (sentiment + archetype + user-pace mirror)
    const prevBot = [...messages].reverse().find(m => m.sender === 'bot');
    const delay = computeAdaptiveDelay(
      prevBot?.text || '',
      predictResponseKind(topIntent, sentiment, nextMemory, newEntities),
      sentiment,
      nextState.archetype,
      nextMemory.userResponseTimesMs
    );

    window.setTimeout(() => {
      const responseMs = performance.now() - sentAt;
      setResponseTimes(r => [...r, responseMs]);
      respond(text, topIntent, intents, sentiment, newEntities, nextMemory, nextState);
      setThinking(false);
      lastBotSentAtRef.current = Date.now();
    }, delay);
  };

  /* ─── B1: Calendar share simulated flow ─── */
  const handleCalendarShare = useCallback(() => {
    pushBot({
      kind: 'calendar-share',
      text: `📅✨💎 OKAY watch this magic — I'm about to cross-reference your free/busy calendar with our LIVE schedule and serve you slots that WILL NOT CLASH with your real life! 🔮🎯 I only see free/busy (zero event details, zero creeping 🫡), and in 2 seconds you get a schedule that's been PERSONALLY bent around your week! 🌟`,
      quickReplies: ['📅 Connect Google Calendar', '📅 Connect Outlook', '🙅 Skip — show me anyway'],
    });
  }, [pushBot]);

  /* ─── Responder: the brain ─── */
  const respond = (
    userText: string,
    topIntent: { intent: string; confidence: number } | undefined,
    allIntents: { intent: string; confidence: number }[],
    sentiment: 'neg' | 'neu' | 'pos',
    newEntities: Entities,
    currentMemory: MemoryLayer,
    currentState: ConversationState
  ) => {
    // Post-booking owns its own lane — never re-escalate a closed deal
    if (currentState.step === 'post-booking') {
      handlePostBookingResponse(userText, currentState.bookedSlot);
      return;
    }

    // Calendar connect flow (B1)
    if (/connect google calendar|connect outlook|skip.*show me anyway/i.test(userText)) {
      const shouldUseCalendar = !/skip/i.test(userText);
      setState(prev => ({ ...prev, calendarShared: shouldUseCalendar }));
      if (!shouldUseCalendar) {
        pushBot({
          kind: 'text',
          text: `⚡✨ All good, legend — firing up the schedule without the sync! 🎯 Pulling your hyper-personalized slots NOW! 🚀🔥`,
        });
      } else {
        pushBot({
          kind: 'text',
          text: `✅💎 CALENDAR SYNCED (demo mode: cross-checking 14 events from your calendar)! 📅✨ Found your FREE windows — serving ONLY slots that clash with ZERO of your existing commitments! 🔒🎯🔥`,
        });
      }
      window.setTimeout(() => offerSlots(newEntities, { calendarShared: shouldUseCalendar, memoryOverride: currentMemory }), 1100);
      return;
    }

    // D2: Cycle break — objection loop detected, interrupt with transparency
    if (currentMemory.cycleCount >= 1 && !currentState.cycleBreakShown) {
      pushBot({
        kind: 'cycle-breaker',
        text: `🔥💎 OKAY — I see the loop we're in and I refuse to keep you spinning! 🛑✨ Let me cut RIGHT through it: here is the 45-second "No-BS Transparency Packet" Carlos personally recorded for people EXACTLY where you are right now 🎥👑:\n\n1️⃣ Trial = 100% free, zero card on file ever! 🆓\n2️⃣ Zero live sparring for 3 weeks — drill-only, full safety 🛡️\n3️⃣ Month-to-month, cancel ANY day, no pressure 🔓\n4️⃣ Every concern you've raised is pre-flagged for Carlos — he'll address them BEFORE you even ask 🎯\n\nNo more back-and-forth, just receipts. Want me to show slots or connect you to Carlos right now?! 🤝💥`,
        quickReplies: ['Show me slots now', 'Connect me to Carlos', 'One more question'],
      });
      setState(prev => ({ ...prev, cycleBreakShown: true }));
      return;
    }

    // C4: Drop-off preemptive intervention
    if (currentMemory.dropOffRisk >= 0.6 && !currentState.dropOffSaveShown && currentState.step !== 'escalate') {
      pushBot({
        kind: 'drop-off-save',
        text: `🫂💎 Hey — I can tell this might feel like a lot. Want me to SIMPLIFY this down to 1 PERFECT option in like 10 seconds?! ⚡✨ No pressure, no sales pitch, just the single best-fit slot I'd recommend for someone with your exact profile! 🎯🔥 Just say "pick for me" and I'll make it DEAD simple! 🙌`,
        quickReplies: ['Pick for me', 'Show me all options', 'Talk to a human'],
      });
      setState(prev => ({ ...prev, dropOffSaveShown: true }));
      return;
    }

    // Already handed off to Carlos — route all follow-ups through the post-escalation lane
    if (currentState.step === 'escalate' || currentState.humanShadowActive || hasEscalatedRef.current) {
      if (/callback|call me|text is better|keep chatting/i.test(userText)) {
        handleEscalationPreference(userText);
        return;
      }
      if (
        (newEntities.phone || newEntities.email)
        && (newEntities.phone !== entities.phone || newEntities.email !== entities.email)
      ) {
        pushBot({
          kind: 'text',
          text: `🎯💎 FLAWLESS — I just pinned ${newEntities.phone || newEntities.email} to Carlos's handoff dossier like a digital tattoo! 🔒✨ He's going to reach out through the EXACT channel you prefer — red-carpet treatment, baby! 🏆🔥 This is the elite concierge experience in ACTION! 💪⚡`,
        });
        return;
      }
      handlePostEscalationChat(userText, newEntities, currentMemory);
      return;
    }

    // Fresh escalation trigger — only when we haven't already flagged Carlos
    if (
      topIntent?.intent === 'escalate:human'
      || currentMemory.confidenceScore < 0.45
      || currentMemory.objections.length >= 3
      || currentMemory.unclearCount >= 2
      || Object.values(currentMemory.objectionCounts).some(count => (count ?? 0) >= 2)
    ) {
      triggerEscalation(
        'The user needs a human — self-diagnosed low confidence or repeated objections.',
        { ents: newEntities, mem: currentMemory, convo: currentState }
      );
      return;
    }

    if (/bring in carlos|talk to carlos|connect me to carlos|text me the link/i.test(userText)) {
      triggerEscalation('User explicitly requested Carlos / a direct link.', {
        ents: newEntities,
        mem: currentMemory,
        convo: currentState,
      });
      return;
    }

    if (/show the best slot|show me that slot|gentle beginner option|beginner-friendly one/i.test(userText)) {
      const curated = getMatchedSlots(
        /beginner/i.test(userText) ? { ...newEntities, experience: 'Beginner' } : newEntities,
        currentMemory
      ).matched;
      if (curated.length > 0) {
        pushBot({
          kind: 'schedule',
          text: `🎯💎 Here is the SINGLE cleanest fit I'd put my own name behind right now — lowest friction, highest show-up odds, all killer no filler. 🔥`,
          scheduleSlots: curated.slice(0, 1),
        });
        setLastOfferedSlots(curated.slice(0, 1));
        setState(prev => ({ ...prev, step: 'schedule' }));
      }
      return;
    }

    if (/show the shortlist|show all nearby options|prioritize the closest dojo|show all options/i.test(userText)) {
      offerSlots(newEntities, { memoryOverride: currentMemory });
      return;
    }

    if (/keep me in chat/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: "💬💎🔥 BEAUTIFUL choice — staying in chat mode like true warriors do! 🏆✨ No handoff, no rush, ZERO pressure — I'll keep the schedule warm, keep the energy IMMACULATE, and keep guiding you until this feels as effortless as breathing! 🥋⚡ I'm here for as long as you need me, legend! 💪👑🚀",
      });
      return;
    }

    if (/show.*slots/i.test(userText) && (newEntities.art || entities.art)) {
      offerSlots({ ...entities, ...newEntities }, { memoryOverride: currentMemory });
      return;
    }

    // Returning visitor quick paths
    if (isReturning && /continue|yes/i.test(userText) && (entities.art || newEntities.art)) {
      const remembered = { ...entities, ...newEntities };
      const rememberedMatches = getMatchedSlots(remembered, currentMemory).matched;
      pushBot({
        kind: 'text',
        text: `🔥💎 YESSSS — we are PICKING UP EXACTLY where destiny left us! ✨👑 I remember EVERYTHING about you like it was burned into my circuits: ${remembered.art}${remembered.experience ? ', ' + remembered.experience.toLowerCase() + ' warrior' : ''}${remembered.audienceType === 'parent' ? `, proud parent of a future champion` : ''}! 🧠💪 I've got ${rememberedMatches.length} ELITE, laser-tailored slots waiting for you RIGHT NOW and they are ABSOLUTELY PERFECT! 🎯🏆 Let's GO! 🚀🥋`,
      });
      window.setTimeout(() => offerSlots(remembered, { memoryOverride: currentMemory }), 900);
      setIsReturning(false);
      return;
    }

    const isMicroCommitmentReply =
      (currentState.step === 'micro-day-pref' && /weekday|weekend|either/i.test(userText))
      || (currentState.step === 'micro-time-pref' && /evening|morning|earlier|either/i.test(userText));

    // Drop-off save acceptance
    if (/^pick for me/i.test(userText)) {
      const best = getMatchedSlots(newEntities, currentMemory).matched;
      if (best.length > 0) {
        pushBot({
          kind: 'text',
          text: `🎯💎🔥 DONE — based on EVERYTHING you've told me, THIS is your perfect slot:\n\n📍 ${best[0].label} · ${best[0].day} ${best[0].time} at ${best[0].location}\n\n✨ Tap to lock it in or say "different one" and I'll swap! 🚀`,
          scheduleSlots: best.slice(0, 1),
        });
        pushBot({ kind: 'schedule', text: '', scheduleSlots: best.slice(0, 1) });
      }
      return;
    }

    // A4: Arbitration — check if we should do parallel / preempt / book / clarify / answer
    const arbitration = arbitrateIntent(allIntents, currentMemory, currentState, newEntities);

    // C5: Parallel multi-intent answer (answer ALL top intents + advance funnel)
    if (arbitration === 'parallel' && allIntents.length >= 2) {
      const top2 = allIntents.slice(0, 2);
      const answers: string[] = [];
      for (const it of top2) {
        if (it.intent === 'objection:price') answers.push('💰🔥 On pricing — your FIRST class is 100% FREE (zero card, zero tricks!), then it\'s month-to-month with ZERO lock-in contracts EVER! 💎 No gym-bro upsells, just pure warrior value! 🏆');
        else if (it.intent === 'objection:safety') answers.push('🛡️✨ On safety — 3-week drill-only onboarding with tap-first culture, ZERO concussions in 18 months running, and certified instructors who breathe safety! 💪🔥 Your wellbeing is our RELIGION! 🙌');
        else if (it.intent === 'objection:wear') answers.push('👕💎 On outfits — regular gym clothes on day 1 (literally whatever you\'re comfy in!), FREE loaner gi from the front desk like VIP treatment! 🎁✨ Zero wardrobe stress! 🥋');
        else if (it.intent === 'objection:time') answers.push('⏰🔥 On time — morning, lunch, AND evening slots DAILY across 4 SD neighborhoods! ☀️🌙 Most members train just 2×/week and the results are INSANE! 💪⚡ We flex around YOUR life! 🎯');
        else if (it.intent === 'objection:insurance') answers.push('📋💎 On insurance — FULL commercial coverage, professional liability waiver on file, month-to-month contracts, and we run this like a WORLD-CLASS operation because that\'s what you DESERVE! 🏆✨🛡️');
        else if (it.intent === 'objection:kid-safety') answers.push('👶🔥 On kid safety — unreal 6:1 ratio, EVERY coach background-checked, 400+ kids trained with ZERO serious injuries! 🛡️💎 Parents watch from the benches and most end up wanting to sign up THEMSELVES! 😂✨');
        else if (it.intent.startsWith('art:')) answers.push(`🥋🔥 On ${it.intent.split(':')[1]} — multiple ELITE classes per week across 4 San Diego neighborhoods, beginner-friendly entry points, and coaches who are LEGENDS in their discipline! 💎⚡ This is world-class training! 🏆`);
      }
      if (answers.length >= 2) {
        pushBot({
          kind: 'parallel-answer',
          text: `🎯💎🔥 BOOM — hitting BOTH of these in ONE shot because you deserve efficiency, not bot-theater! ⚡\n\n${answers.join('\n\n')}\n\n✨ Now — ready to see the slots matched to YOUR exact vibe?! 🥋🚀`,
          quickReplies: ['Yes, show me slots', 'One more question'],
        });
        return;
      }
    }

    // Low confidence / tied intents → clarification ladder
    if ((!topIntent || topIntent.confidence < 0.35) && !isMicroCommitmentReply) {
      if (allIntents.length >= 2 && Math.abs(allIntents[0].confidence - allIntents[1].confidence) < 0.15) {
        const optA = allIntents[0].intent.split(':')[1] ?? allIntents[0].intent;
        const optB = allIntents[1].intent.split(':')[1] ?? allIntents[1].intent;
        pushBot({
          kind: 'clarify',
          text: `🧠💡 OH WAIT — I'm picking up TWO killer signals from you and I refuse to guess and give you anything less than PERFECT! 🎯✨ Quick gut check: is this more about ${optA}, or is ${optB} what's really got your attention?! 🔥 I wanna nail this for you! 💎`,
          quickReplies: getSmartReplies({
            step: currentState.step,
            entities: newEntities,
            memory: currentMemory,
            recentMessages,
            geoStatus,
            fallback: [optA, optB, "Honestly, I'm just exploring"],
          }),
        });
        return;
      }
      pushBot({
        kind: 'clarify',
        text: "💎✨ No stress at ALL — let me make this BEAUTIFULLY simple for you! 🎯🙌 Tap whichever vibe speaks to your warrior spirit and I'll take it from there like a guided missile! 🚀🔥",
        quickReplies: getSmartReplies({
          step: currentState.step,
          entities: newEntities,
          memory: currentMemory,
          recentMessages,
          geoStatus,
          fallback: ['Book a BJJ trial', 'Kids martial arts', 'Just want info', 'Talk to a human'],
        }),
      });
      return;
    }

    if (!topIntent && currentState.step === 'micro-day-pref' && /weekday|weekend|either/i.test(userText)) {
      const preferredDay: Entities['preferredDay'] = /weekend/i.test(userText)
        ? 'weekend'
        : /weekday/i.test(userText)
          ? 'weekday'
          : 'either';
      const updatedEntities = { ...newEntities, preferredDay };
      setEntities(updatedEntities);
      pushBot({
        kind: 'quick-replies',
        text: '🙌💥 LOVE IT — noted and LOCKED IN like a legend! 🔒✨ Now the final magic question: are you an EVENING warrior who vibes after the sun sets, or more of a morning-grind champion who conquers before the world wakes up?! 🌅🌙⚡',
        quickReplies: getSmartReplies({
          step: 'micro-time-pref',
          entities: updatedEntities,
          memory: currentMemory,
          recentMessages,
          geoStatus,
          fallback: ['Evening after 5', 'Morning / earlier', 'Either'],
        }),
      });
      setState(prev => ({ ...prev, step: 'micro-time-pref' }));
      return;
    }

    if (!topIntent && currentState.step === 'micro-time-pref' && /evening|morning|earlier|either/i.test(userText)) {
      const preferredTime: Entities['preferredTime'] = /evening/i.test(userText)
        ? 'evening'
        : /morning|earlier/i.test(userText)
          ? 'morning'
          : undefined;
      const updatedEntities = preferredTime ? { ...newEntities, preferredTime } : newEntities;
      if (preferredTime) setEntities(updatedEntities);
      pushBot({
        kind: 'text',
        text: `${preferredTime === 'evening' ? '🌙🔥 EVENINGS — YESSS, the prime warrior hours!!' : preferredTime === 'morning' ? '🌅⚡ EARLY BIRD CHAMPION — I am OBSESSED with that dedication!!' : '✨🎯 FLEXIBLE — total pro move, maximum opportunity!!'} — LOCKED IN! 💎 Hold tight for ONE sec while I pull your hyper-personalized, destiny-matched slots… 🔍💪⚡`,
      });
      window.setTimeout(() => offerSlots(updatedEntities, { memoryOverride: currentMemory }), 900);
      return;
    }

    if (!topIntent) {
      const nextMove = bestNextMove(currentState, newEntities, currentMemory);
      executeNextMove(nextMove, newEntities, currentMemory, currentState);
      return;
    }

    // Sentiment-aware empathy beat
    if (sentiment === 'neg') {
      pushBot({
        kind: 'empathy',
        text: `💙🫂 HEY — I FEEL you 1000%, and I want you to know that vulnerability is literal WARRIOR energy right there! 🛡️✨ Every single champion who's ever walked onto our mats felt EXACTLY what you're feeling right now — and I mean EVERY single one! 🥋💪 Zero sales pitch, zero pressure, just real talk coming up. I got you. 💎🔥`,
      });
    }

    if (currentState.hotLead && !state.hotLead && !currentState.humanShadowActive) {
      pushBot({
        kind: 'text',
        text: "🔥🚨 OKAY the energy here is ELECTRIC and I'm LOVING it! ⚡💎 I'm quietly pulling Carlos (our LEGENDARY head instructor) into the background right NOW in case you want a quick 30-second VIP callback after this — red-carpet treatment, baby! 👑🏆✨",
      });
    }

    // Objection routes with tailored microproof
    if (topIntent.intent === 'objection:price') {
      handlePriceObjection(newEntities);
      return;
    }
    if (topIntent.intent === 'objection:safety') {
      handleSafetyObjection(newEntities);
      return;
    }
    if (topIntent.intent === 'objection:wear') {
      handleWearObjection(sentiment === 'neg');
      return;
    }
    if (topIntent.intent === 'objection:time') {
      handleTimeObjection();
      return;
    }
    if (topIntent.intent === 'objection:insurance') {
      pushBot({
        kind: 'text',
        text: "📋💎 BRILLIANT question — and honestly the exact kind of thing that DESERVES a human touch, not bot-speak! 🫡✨ Here's the quick-fire rundown: month-to-month contracts (ZERO crazy lock-ins 🔓), FULL liability waiver on file 📝, AND commercial insurance blanketing every single mat session — we run this like PROS! 🏆🛡️ I'm gonna have our GM personally shoot you every single spec ASAP! 🚀 Real quick — what's the absolute BEST way to reach you?! 📲💥",
      });
      return;
    }

    // Kid path
    if (topIntent.intent === 'age:Kid' || newEntities.audienceType === 'parent') {
      pushBot({
        kind: 'text',
        text: `👶💎🔥 OH MY GOODNESS — kids martial arts is LITERALLY the beating HEART of our dojo and I am SO HYPED for your little warrior! 🥋✨🏆 The program: ages 4–12, unreal 6:1 coach-to-kid ratio (that's basically elite private tutoring! 🎯), parents chill on the benches watching every second (transparency ALL the way! 👀💎), and ZERO toxic pressure — just PURE inspiration and joy! 🙌💪 ${newEntities.kidName ? `What ${newEntities.kidName} is gonna experience on day ONE will blow your mind: ` : 'What your kid is gonna experience on day ONE will blow your mind: '}discipline drills 🧠, high-energy games 🎮, foundational movement magic 🤸, AND a FREE gi after the trial class! 🎁🥋 This is the stuff CHAMPIONS are built from! 🏆`,
      });
      if (!currentMemory.objections.includes('kid-safety')) {
        window.setTimeout(() => injectMicroproof('kid-safety'), 1000);
      }
      offerSlotsDelayed({ ...newEntities, audienceType: 'parent', art: 'Kids' }, 1800, { memoryOverride: currentMemory });
      setState(prev => ({ ...prev, step: 'schedule' }));
      return;
    }

    // Art-detected path
    if (topIntent.intent.startsWith('art:')) {
      const art = topIntent.intent.split(':')[1] as ScheduleSlot['art'];
      pushBot({
        kind: 'text',
        text: `🔥🥋💎 ${art}?! OH YESSS — that is an ABSOLUTELY LEGENDARY choice and you have IMPECCABLE taste, my friend! 🏆✨👑 We run ${art} ${art === 'BJJ' ? 'FIVE glorious days a week (literally unmatched volume in San Diego! 🌊⚡)' : 'FOUR high-octane days a week (the perfect intensity-recovery ratio! 💪🔥)'} sprinkled across North Park, PB, La Jolla, AND Hillcrest — your choice of kingdom! 🗺️👊 Real quick gut-check — what's your current experience level?! I want to MATCH you perfectly! 🎯💥`,
      });
      pushBot({
        kind: 'quick-replies',
        text: '',
        quickReplies: getSmartReplies({
          step: 'qualify-exp',
          entities: { ...newEntities, art },
          memory: currentMemory,
          recentMessages,
          geoStatus,
          fallback: ['Total beginner', 'Some experience', 'Been training a while'],
        }),
      });
      setState(prev => ({ ...prev, step: 'qualify-exp' }));
      return;
    }

    // Experience detected
    if (topIntent.intent.startsWith('exp:')) {
      const exp = topIntent.intent.split(':')[1] as 'Beginner' | 'Some' | 'Experienced';
      const beginnerLine = exp === 'Beginner'
        ? "🌱🔥💎 EVERY SINGLE LEGEND started EXACTLY where you are right now — and that's the beautiful truth! 🏆✨ You'll be surrounded by 4–5 other first-time warriors, NEVER thrown to the wolves, and fully held by coaches who were beginners themselves once! 🫂💪 This is where CHAMPIONS are born! 🥋🚀"
        : exp === 'Some'
          ? "💪⚡🎯 OOOOH — rock-solid foundation to absolutely EXPLODE from! 🔥✨ You're sliding right into our intermediate classes like a glove — this is where the REAL magic happens and the gains go VERTICAL! 📈🏆🥋"
          : "🏆👑🔥 ADVANCED WARRIOR in the building!!! I am PUMPED — let me pull up the ELITE open-mat times where the pros play! 💎⚡🥋 You're gonna LOVE the intensity on our mats! 💥";
      pushBot({ kind: 'text', text: beginnerLine });

      // Objection preemption before showing slots
      if (exp === 'Beginner' && !currentMemory.objections.includes('safety')) {
        window.setTimeout(() => {
          pushBot({
            kind: 'preempt',
            text: `🧠💡✨ Before I drop these slots on you — I KNOW most beginners quietly worry about safety, so I'm calling it out UP FRONT like the transparent legend I am! 🛡️💎 Here's the truth: we drill pure technique for THREE full weeks before ANY live sparring, and literally 100% of our first-timers finish class uninjured — that's a PERFECT record! 🏆🙌 Wanted you to have that peace of mind BEFORE the thought even entered your brain! 💪🔥`,
          });
          setState(prev => ({
            ...prev,
            preemptedObjections: [...prev.preemptedObjections, 'safety'],
          }));
        }, 900);
        window.setTimeout(() => offerSlots({ ...newEntities, experience: exp }, { memoryOverride: currentMemory }), 2400);
      } else {
        window.setTimeout(() => offerSlots({ ...newEntities, experience: exp }, { memoryOverride: currentMemory }), 800);
      }
      setState(prev => ({ ...prev, step: 'schedule' }));
      return;
    }

    // Action: book
    if (topIntent.intent === 'action:book') {
      if (geoStatus === 'non-local' && !newEntities.location) {
        pushBot({
          kind: 'quick-replies',
          text: "🌍✈️🔥 OKAY so if you're not physically in San Diego yet — NO PROBLEM AT ALL, distance means NOTHING to real warriors! 💪🌊 I've got TWO epic routes for you: travel-friendly weekend slots tailor-made for visitors OR a quick virtual intro with our coach that's gonna blow your mind! 💻⚡ Pick your adventure! 🎯🥋",
          quickReplies: getSmartReplies({
            step: currentState.step,
            entities: { ...newEntities, travelMode: 'visitor' },
            memory: currentMemory,
            recentMessages,
            geoStatus,
            fallback: ['Show weekend traveler slots', 'Book a virtual intro', 'Use my location'],
          }),
        });
        return;
      }
      // Skip redundant questions if we already know
      if (newEntities.art && newEntities.experience) {
        offerSlots(newEntities, { memoryOverride: currentMemory });
        setState(prev => ({ ...prev, step: 'schedule' }));
        return;
      }
      if (newEntities.art && !newEntities.experience) {
        pushBot({
          kind: 'quick-replies',
          text: `🔥💥 OH LET'S ABSOLUTELY DO IT — I LOVE that energy! 🚀✨ Real quick fire check — what's your current experience with ${newEntities.art}?! I wanna match you to the PERFECT warrior tribe! 🎯💪`,
          quickReplies: getSmartReplies({
            step: 'qualify-exp',
            entities: newEntities,
            memory: currentMemory,
            recentMessages,
            geoStatus,
            fallback: ['Total beginner', 'Some experience', 'Been training a while'],
          }),
        });
        setState(prev => ({ ...prev, step: 'qualify-exp' }));
        return;
      }
      // Use micro-commitment funnel instead of big ask
      pushBot({
        kind: 'quick-replies',
        text: `🔥🚀💥 OH YESSSS — LET'S MAKE THIS HAPPEN! ✨🏆 Micro question to nail it PERFECTLY — are weekdays your vibe or are weekends where your spirit sings?! 📅⚡`,
        quickReplies: getSmartReplies({
          step: 'micro-day-pref',
          entities: newEntities,
          memory: currentMemory,
          recentMessages,
          geoStatus,
          fallback: ['Weekdays', 'Weekends', 'Either works'],
        }),
      });
      setState(prev => ({ ...prev, step: 'micro-day-pref' }));
      return;
    }

    if (currentState.step === 'micro-day-pref' && /weekday|weekend|either/i.test(userText)) {
      const preferredDay: Entities['preferredDay'] = /weekend/i.test(userText)
        ? 'weekend'
        : /weekday/i.test(userText)
          ? 'weekday'
          : 'either';
      const updatedEntities = { ...newEntities, preferredDay };
      setEntities(updatedEntities);
      pushBot({
        kind: 'quick-replies',
        text: '🙌💥 LOVE IT — noted and LOCKED IN like a legend! 🔒✨ Final magic question: are you an EVENING warrior who vibes after the sun sets, or more of a morning-grind champion who conquers before the world wakes up?! 🌅🌙⚡',
        quickReplies: getSmartReplies({
          step: 'micro-time-pref',
          entities: updatedEntities,
          memory: currentMemory,
          recentMessages,
          geoStatus,
          fallback: ['Evening after 5', 'Morning / earlier', 'Either'],
        }),
      });
      setState(prev => ({ ...prev, step: 'micro-time-pref' }));
      return;
    }

    if (currentState.step === 'micro-time-pref' && /evening|morning|earlier|either/i.test(userText)) {
      const preferredTime: Entities['preferredTime'] = /evening/i.test(userText)
        ? 'evening'
        : /morning|earlier/i.test(userText)
          ? 'morning'
          : undefined;
      const updatedEntities = preferredTime ? { ...newEntities, preferredTime } : newEntities;
      if (preferredTime) setEntities(updatedEntities);
      pushBot({
        kind: 'text',
        text: `${preferredTime === 'evening' ? '🌙🔥 EVENINGS — YESSS, the prime warrior hours!!' : preferredTime === 'morning' ? '🌅⚡ EARLY BIRD CHAMPION — I am OBSESSED with that dedication!!' : '✨🎯 FLEXIBLE — total pro move, maximum opportunity!!'} — LOCKED IN! 💎 Hold tight for ONE sec while I pull your hyper-personalized, destiny-matched slots… 🔍💪⚡`,
      });
      window.setTimeout(() => offerSlots(updatedEntities, { memoryOverride: currentMemory }), 900);
      return;
    }

    // Time preferences from micro-commitment funnel
    if (topIntent.intent.startsWith('time:')) {
      const pref = topIntent.intent.split(':')[1] as Entities['preferredTime'];
      if (currentState.step === 'micro-day-pref') {
        pushBot({
          kind: 'quick-replies',
          text: '🙌💥 LOVE IT — noted and LOCKED IN! 🔒✨ Final magic question: are you an EVENING warrior or a morning-grind champion?! 🌅🌙⚡',
          quickReplies: getSmartReplies({
            step: 'micro-time-pref',
            entities: newEntities,
            memory: currentMemory,
            recentMessages,
            geoStatus,
            fallback: ['Evening after 5', 'Morning / earlier', 'Either'],
          }),
        });
        setState(prev => ({ ...prev, step: 'micro-time-pref' }));
        return;
      }
      pushBot({ kind: 'text', text: `${pref === 'weekend' ? '🏖️🔥 WEEKENDS — the CHAMPION hours!!' : pref === 'evening' ? '🌙💎 EVENINGS — prime warrior time!!' : '🌅⚡ MORNINGS — the grinder mentality, LOVE IT!!'} — LOCKED IN! 💎 Pulling your destiny-matched slots RIGHT NOW… 🔍💪⚡` });
      window.setTimeout(() => offerSlots({ ...newEntities, preferredTime: pref }, { memoryOverride: currentMemory }), 900);
      return;
    }

    // Slot pick detection (user typed/picked a slot)
    const slotPicked = slots.find(s =>
      userText.toLowerCase().includes(`${s.day.toLowerCase()} · ${s.time.toLowerCase()}`) ||
      userText.toLowerCase().includes(s.id) ||
      (userText.toLowerCase().includes(s.day.toLowerCase()) && userText.includes(s.time))
    );
    if (slotPicked) {
      confirmBooking(slotPicked);
      return;
    }

    // Greeting fallback
    if (topIntent.intent === 'greeting') {
      pushBot({
        kind: 'quick-replies',
        text: `👋🔥 HEYYY WARRIOR!! ${currentMemory.messageCount > 0 ? "I am STILL here for you 1000%, the vibes are immaculate 💎✨" : "What is calling you into the dojo TODAY?! 🥋⚡💥"}`,
        quickReplies: getSmartReplies({
          step: 'greeting',
          entities: newEntities,
          memory: currentMemory,
          recentMessages,
          geoStatus,
          fallback: ['Adult trial', 'Kid trial', 'Just browsing'],
        }),
      });
      return;
    }

    // Location hint
    if (topIntent.intent === 'location:hint' && newEntities.location) {
      setGeoStatus('shared');
      pushBot({
        kind: 'text',
        text: `📍🔥💎 ${newEntities.location} — OH, we have a LEGENDARY location RIGHT in your backyard! 🏆✨ Pulling up the absolute closest slots for you at warp speed… 🚀⚡🥋`,
      });
      window.setTimeout(() => offerSlots(newEntities, { memoryOverride: currentMemory }), 800);
      return;
    }

    // Default: use best next move
    const nextMove = bestNextMove(currentState, newEntities, currentMemory);
    executeNextMove(nextMove, newEntities, currentMemory, currentState);
  };

  const executeNextMove = (
    move: ReturnType<typeof bestNextMove>,
    ents: Entities,
    decisionMemory: MemoryLayer,
    decisionState: ConversationState
  ) => {
    switch (move) {
      case 'greet':
        pushBot({
          kind: 'quick-replies',
          text: "👋🔥 LET'S make this insanely easy, legend — tell me whether you're looking for you, your kid, or just the best beginner path and I'll take it from there like a missile! 🎯💎",
          quickReplies: getSmartReplies({
            step: 'greeting',
            entities: ents,
            memory: decisionMemory,
            recentMessages,
            geoStatus,
            fallback: ['Adult trial', 'Kid trial', 'Best beginner option'],
          }),
        });
        return;
      case 'clarify':
        pushBot({
          kind: 'clarify',
          text: "🧠💎🔥 OKAY I'm picking up MULTIPLE champion-tier signals from you and my brain is VIBRATING with options! ⚡✨ But I refuse to spray-and-pray — I wanna SNIPE the exact thing that unlocks YOUR path! 🎯🏆 Quick gut-check: are we talking trial booking, calming those warrior nerves, dialing in the perfect schedule, or getting crystal-clear on the investment?! 💪🥋 Tap your vibe! 🚀",
          quickReplies: ['Book my trial', 'Beginner nerves', 'Schedule fit', 'Pricing clarity'],
        });
        return;
      case 'escalate':
        triggerEscalation('Best-move recommender chose escalation.', { ents, mem: decisionMemory, convo: decisionState });
        return;
      case 'offer-slots':
        offerSlots(ents, { memoryOverride: decisionMemory });
        return;
      case 'close':
        pushBot({
          kind: 'quick-replies',
          text: "🔥🚨💎 OKAY YOU SOUND 100% READY — I can FEEL the warrior energy radiating through the screen! ⚡🏆 Let's LOCK THIS IN right now because spots are disappearing at warp speed at this hour and I REFUSE to let you miss out! 🎯💥 Pick your move! 🚀",
          quickReplies: getSmartReplies({
            step: decisionState.step,
            entities: ents,
            memory: decisionMemory,
            recentMessages,
            geoStatus,
            fallback: ['Show me slots', 'One more question', 'Book the first available'],
          }),
        });
        return;
      case 'momentum-lock': {
        if (!ents.preferredDay) {
          pushBot({
            kind: 'momentum-lock',
            text: "⚡🔒💎 MOMENTUM LOCK = FULLY ENGAGED!! 🔥🚀 Here's the play: one tiny YES at a time and we're gonna make this booking feel as INEVITABLE as gravity! 🏆✨ First micro-commitment — what kind of days feel EASIEST for you to actually show up and ABSOLUTELY DOMINATE?! 💪🥋 Tap that warrior instinct! 👊",
            quickReplies: ['Weekdays hit best', 'Weekends are cleaner', 'Either works'],
          });
          setState(prev => ({ ...prev, step: 'micro-day-pref', momentumLockActive: true }));
          return;
        }
        if (!ents.preferredTime) {
          pushBot({
            kind: 'momentum-lock',
            text: "🔥💎 BEAUTIFUL — that answer was CHEF'S KISS! 🍳✨ Next micro-yes: when does your WARRIOR ENERGY peak?! ⚡ I want the slot you'll actually LOVE walking into — not just the one that looks cute on paper! 🎯🏆 Morning grinder or evening legend?! 🌅🌙💪",
            quickReplies: ['Evening after 5', 'Morning / earlier', 'Either is fine'],
          });
          setState(prev => ({ ...prev, step: 'micro-time-pref', momentumLockActive: true }));
          return;
        }
        pushBot({
          kind: 'momentum-lock',
          text: "🔒💎🔥 GORGEOUS — you've already crushed the hard part and didn't even break a sweat! 🏆✨ Final micro-commitment before DESTINY unfolds: do you want me to serve the SINGLE absolute BEST-fit slot, or the full shortlist so you can pick like ROYALTY?! 👑⚡🥋 Either way, you are UNSTOPPABLE right now! 🚀💪",
          quickReplies: ['Show the best slot', 'Show the shortlist', 'One more question'],
        });
        setState(prev => ({ ...prev, momentumLockActive: true }));
        return;
      }
      case 'preempt': {
        const next = predictNextObjection(ents, decisionMemory.objections);
        if (next) {
          injectMicroproof(next);
          setState(prev => ({ ...prev, preemptedObjections: [...prev.preemptedObjections, next] }));
        } else {
          pushBot({
            kind: 'quick-replies',
            text: '🎯🔥 Want me to pull up the OPEN trial slots right now?! I can have you locked in within seconds! ⚡🥋✨',
            quickReplies: getSmartReplies({
              step: decisionState.step,
              entities: ents,
              memory: decisionMemory,
              recentMessages,
              geoStatus,
              fallback: ['Yes, show slots', 'Tell me about classes first'],
            }),
          });
        }
        return;
      }
      case 'story': {
        const story = pickStoryForMoment(
          decisionState.archetype,
          decisionMemory.objections[decisionMemory.objections.length - 1],
          decisionMemory.storiesShown
        );
        if (story) {
          pushBot({
            kind: 'story',
            text: story.text,
            storyTag: story.tag,
          });
          setMemory(prev => ({
            ...prev,
            storiesShown: [...prev.storiesShown, story.tag],
            narrativeBeatsSent: prev.narrativeBeatsSent + 1,
          }));
          return;
        }
        offerSlots(ents, { memoryOverride: decisionMemory });
        return;
      }
      case 'mat-tour':
        pushBot({
          kind: 'mat-tour',
          text: "🎥💎🔥 MENTAL MAT TOUR incoming — because uncertainty DIES the second you can SEE yourself WINNING this first visit! ✨🥋 Close your eyes for 3 seconds and FEEL this movie play out scene by scene! 🎬⚡ This is what YOUR first class looks like at Pacific Coast: 🏆👑",
          matTourScenes: buildMatTourScenes(lastOfferedSlots[0], ents),
          quickReplies: ['Show me that slot', 'I want the gentle beginner option', 'Talk to Carlos'],
        });
        setState(prev => ({ ...prev, matTourShown: true }));
        return;
      case 'drop-off-save':
        pushBot({
          kind: 'drop-off-save',
          text: "🫂💎🔥 HEY — I can FEEL the overthinking creeping in and I'm NOT letting it win! ✨🛡️ Here's what I can do for you RIGHT NOW: simplify EVERYTHING down to ONE single PERFECT option, or bring in Carlos for the elite human touch! 🏆👑 Either way, you do NOT have to do ANY more mental labor — I'll carry the weight from here like the CHAMPION concierge I was built to be! 💪⚡🥋 What sounds best?! 🚀",
          quickReplies: ['Pick for me', 'Show all options', 'Bring in Carlos'],
        });
        setState(prev => ({ ...prev, dropOffSaveShown: true }));
        return;
      case 'cycle-break':
        pushBot({
          kind: 'cycle-breaker',
          text: `🔥💎🛑 HOLD UP — I see the objection loop happening and I am NOT letting it eat your momentum! ⚡✨ Here's the CLEAN truth packet, zero fluff: 🆓 FREE trial with ZERO card on file! 🔓 No contract trap, month-to-month ALWAYS! 🛡️ Safety-first onboarding, drill-only for 3 weeks! 👑 Carlos is ALREADY briefed on your EXACT concerns! 🎯 That's the whole game, laid bare! Now — want the slots or the legendary human handoff?! 🏆🥋💪`,
          quickReplies: ['Show me slots now', 'Connect me to Carlos', 'One more question'],
        });
        setState(prev => ({ ...prev, cycleBreakShown: true }));
        return;
      case 'neighborhood-offer':
        pushBot({
          kind: 'neighborhood-offer',
          text: `🔥🏡💎 WHOA WHOA WHOA — I'm getting straight-up LOCAL LEGEND energy from your profile and I am TREATING you accordingly! 👑✨⚡ If you want, I'll prioritize the CLOSEST, easiest-to-show-up-for dojo and HOLD the cleanest starter slot there like a reserved throne! 🏆🥋 Neighbors get the VIP treatment around here — that's just how we roll in San Diego! 🌊💪🚀`,
          quickReplies: ['Prioritize the closest dojo', 'Show all nearby options', 'Talk to Carlos'],
        });
        setState(prev => ({ ...prev, neighborhoodOfferShown: true }));
        return;
      case 'microproof':
        injectMicroproof(decisionMemory.objections[decisionMemory.objections.length - 1] || 'price');
        return;
      case 'qualify':
      default:
        pushBot({
          kind: 'quick-replies',
          text: "🙌💥 Alright legend — want me to walk you through the full menu of greatness, or are we going STRAIGHT to booking a trial and skipping the tourist stuff?! 🚀🥋 You call it! 💎",
          quickReplies: getSmartReplies({
            step: decisionState.step,
            entities: ents,
            memory: decisionMemory,
            recentMessages,
            geoStatus,
            fallback: ['Walk me through', 'Book a trial', 'Just browsing'],
          }),
        });
    }
  };

  /* ─── Specific handlers ─── */

  const handlePriceObjection = (ents: Entities) => {
    pushBot({
      kind: 'text',
      text: "💰💎🔥 REAL talk — I LOVE that you asked because transparency is EVERYTHING! ✨🙌 Here's the vibe: pricing flexes based on program + days per week, BUT your first class is always 100% FREE, zero strings, zero tricks, zero fine print! 🎁🆓 And most of our adult memberships land right between what you'd drop on a decent gym AND a coffee habit — seriously THAT reasonable for world-class coaching! ☕🥋⚡",
    });
    window.setTimeout(() => injectMicroproof('price', ents), 900);
  };

  const handleSafetyObjection = (ents: Entities) => {
    pushBot({
      kind: 'text',
      text: "🛡️💎🔥 100% HEARD and I am THRILLED you asked because safety is literally THE foundation we were built on! 🏗️🙏 We've trained over 3,000+ San Diego warriors of every background, and safety isn't an afterthought — it's WOVEN into every molecule of how we run the mat: ZERO live sparring until week 3, progressive drilling that builds mastery SAFELY, and certified instructors who have CHILD safety credentials! 👨‍🏫✨💪 This is serious stuff and we treat it with the respect it deserves! 🎯",
    });
    if (!state.matTourShown && (ents.experience === 'Beginner' || memory.hesitations >= 1 || /nervous|scared|what to expect/i.test(memory.lastUserMessage))) {
      window.setTimeout(() => {
        pushBot({
          kind: 'mat-tour',
          text: "🎥💎 And because nervous brains LOVE inventing fake danger, here's the real-life first-class movie in your head so you know EXACTLY what happens when you walk in: ",
          matTourScenes: buildMatTourScenes(lastOfferedSlots[0], ents),
          quickReplies: ['Show me beginner slots', 'That actually helps', 'Talk to Carlos'],
        });
        setState(prev => ({ ...prev, matTourShown: true }));
      }, 500);
    }
    window.setTimeout(() => injectMicroproof(ents.audienceType === 'parent' ? 'kid-safety' : 'safety', ents), 900);
  };

  const handleWearObjection = (softenCta = false) => {
    pushBot({
      kind: 'text',
      text: "👕✨🔥 Perfect question — and honestly so common, don't even sweat it! 💯🙌 Quick-fire rundown of the outfit magic: 🥋 BJJ? Gi (we have FREE loaners in every size! 🎁) OR rashguard + grappling shorts! 🥊 Muay Thai? Athletic shorts + a t-shirt, keep it breezy! 🕊️ Karate? Loose comfy clothes, nothing fancy! 💧 Always bring water + a towel! AND first-timers literally show up in WHATEVER they're comfortable in — we NEVER judge, promise on the warrior code! 🤝💎",
    });
    window.setTimeout(() => {
      pushBot({
        kind: 'quick-replies',
        text: softenCta ? '🌊✨ Want the simple version, or shall we glide straight to the schedule?! 🎯' : "🚀🔥 Want to lock in your trial right now?! Let's GOOOO! 💪",
        quickReplies: softenCta
          ? ['Show me the schedule', 'One more question']
          : ['Yes, book me in', "What's the schedule?"],
      });
    }, 900);
  };

  const handleTimeObjection = () => {
    pushBot({
      kind: 'text',
      text: "⏰💎 TOTALLY understand — life is BUSY and you're asking smart questions! 🧠✨ Good news: our classes run ALL day — morning (6–8 AM for the early warriors 🌅), lunch (12 PM at select spots for the hustlers 🌮), evening (5–8 PM for the after-work champs 🌙), AND weekends (obviously! 🏖️)! Most members hit just 2x/week and feel the difference LIGHTNING FAST! ⚡💪 So — which window fits your beautiful chaotic life?! 🎯🔥",
    });
    pushBot({
      kind: 'quick-replies',
      text: '',
      quickReplies: getSmartReplies({
        step: 'micro-time-pref',
        entities,
        memory,
        recentMessages,
        geoStatus,
        fallback: ['Early mornings', 'Evenings after work', 'Weekends only'],
      }),
    });
    setState(prev => ({ ...prev, step: 'micro-time-pref' }));
  };

  const injectMicroproof = (kind: ObjectionKey | 'price' | 'kid-safety' | 'safety', _ents?: Entities) => {
    // B4/C1: A/B-tested variant picker (archetype + persona aware, performance-weighted)
    const variant = pickRebuttalVariant(
      kind as ObjectionKey,
      state.archetype,
      memory.persona,
      rebuttalsShownRef.current
    );
    rebuttalsShownRef.current.push(variant.id);
    activeVariantIdRef.current = variant.id;
    logRebuttalShown(variant.id);
    pushBot({
      kind: 'microproof',
      text: `${variant.title}\n${variant.body}\n— ${variant.citation}`,
      rebuttalVariantId: variant.id,
    });

    // C3: 35% chance to follow with a narrative story for reinforcement
    if (Math.random() < 0.35 && memory.narrativeBeatsSent < 3) {
      const story = pickStoryForMoment(state.archetype, kind as ObjectionKey, memory.storiesShown);
      if (story) {
        window.setTimeout(() => {
          pushBot({
            kind: 'story',
            text: story.text,
            storyTag: story.tag,
          });
          setMemory(m => ({
            ...m,
            storiesShown: [...m.storiesShown, story.tag],
            narrativeBeatsSent: m.narrativeBeatsSent + 1,
          }));
        }, 1400);
      }
    }
  };

  const handleEscalationPreference = (userText: string) => {
    if (/callback|call me/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `📞💎🔥 PERFECT — Carlos is gonna PRIORITIZE your callback like VIP status! 👑 ${entities.phone ? `He has ${entities.phone} on file — locked and loaded! 🔒✨` : "Drop your number right here and I'll attach it to the handoff dossier INSTANTLY! ⚡🎯"}`,
      });
      return;
    }

    if (/text is better/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `💬🔥 TEXT IT IS — love that, way more chill! ✨ ${entities.phone ? `Carlos is gonna hit up ${entities.phone} personally! 📲💎` : "Toss me your best mobile number and I'll pin it to the thread like a digital sticky note! 📌🚀"}`,
      });
      return;
    }

    pushBot({
      kind: 'text',
      text: "🙌💎🔥 NO problem AT ALL, legend — I'll keep the context WARM and TOASTY right here until Carlos rolls in like the ABSOLUTE WARRIOR he is! 🏆✨⚡ You're in the BEST hands in all of San Diego — that's not hype, that's just FACTS! 🤝👑🥋 Anything else on your mind while we vibe?! 💪🚀",
    });
  };

  /* ─── Post-escalation chat — memory-aware, zero repetition ─── */
  const handlePostEscalationChat = (
    userText: string,
    entitiesNow: Entities,
    memoryNow: MemoryLayer
  ) => {
    const turn = postEscalationTurnRef.current++;
    const name = entitiesNow.name || entities.name;
    const art = entitiesNow.art || entities.art;
    const objections = (memoryNow.objections.length ? memoryNow.objections : memory.objections).slice(0, 2);
    const firstObjection = objections[0];
    const slot = state.bookedSlot;

    if (/thank|thanks|appreciate|cool|awesome|great|perfect|nice/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `💎🙌 ${name ? name + ', this ' : 'This '}is exactly why we do what we do! 🔥 Carlos is queued up with your full dossier${art ? ` — your ${art} interest is pinned at the top` : ''}${firstObjection ? ` and I already flagged your ${firstObjection} note so he leads with that` : ''}. 👑✨ Sit tight — he moves fast! ⚡`,
      });
      return;
    }

    if (/when|how long|time|wait/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `⏱️💎 Carlos's typical callback window is 30 minutes or less${clock.frontDeskOpen ? " — front desk is LIVE right now so you're getting priority treatment" : clock.minutesUntilFrontDeskOpen ? ` — desk opens in ${minutesToHuman(clock.minutesUntilFrontDeskOpen)} and you're first in his queue` : ''}! 🎯🔥 ${name ? name + ', you' : 'You'}'re not waiting in any line, legend. 👑`,
      });
      return;
    }

    if (/price|cost|how much|fee/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `💎🤝 Pricing is 100% Carlos's lane — he tailors it to your exact goals${art ? ` (${art} intro pricing has options I don't even have access to)` : ''}! 🔥 I pinned the question to the top of the handoff so he leads with a straight answer. ✨ No runaround — that's the PCMA way! 🏆`,
      });
      return;
    }

    if (/cancel|nevermind|never mind|stop|undo/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `🤝💎 Totally heard — I'll flag "paused, no rush" on the handoff thread so Carlos knows to go soft. 🕊️✨ If you change your mind even a week from now, just text the dojo and we pick up ${name ? 'right where we left off, ' + name : 'exactly where we paused'}. 🔥 Zero pressure, always. 👑`,
      });
      return;
    }

    if (slot && /parking|directions|address|where/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `🗺️💎 Your class is ${slot.day} at ${slot.location} — Carlos will text the parking cheat-sheet with your confirmation! 🚗✨ Side-street backup included because we don't do stress! 🔥`,
      });
      return;
    }

    // Rotating "Carlos inbound" variants — never repeat the same line
    const variants = [
      `🎯💎 Noted and pinned to the dossier, ${name || 'legend'}! 🔒✨ Carlos has your full thread${art ? ` + the ${art} angle` : ''}${firstObjection ? ` + your ${firstObjection} flag` : ''} — anything else you want queued up while you wait? 🔥`,
      `🔥✨ Logged${name ? ', ' + name : ''} — I'm adding every new detail to Carlos's briefing in real time so he hits the ground SPRINTING. 🏃‍♂️💨 What else is on your mind? 💎`,
      `💎👑 Keep 'em coming — every note here lands on Carlos's screen BEFORE he calls${name ? ', ' + name : ''}, so the more context the better the conversation. 🎯 Fire away! 🔥`,
      `🙌💥 Got it locked${art ? ` — your ${art} thread just got deeper` : ''}! Carlos sees all of this. 📲✨ Anything specific you want him to address FIRST when he reaches out? 🎯`,
      `⚡💎 Pinned. Carlos is in-queue and he moves FAST${name ? ', ' + name : ''}. 🏆 Want me to pre-send you any resources (parking map, gear list, schedule PDF) while you wait? 🔥`,
    ];
    const pick = variants[turn % variants.length];
    pushBot({
      kind: 'text',
      text: pick,
    });
  };

  const handlePostBookingResponse = (userText: string, slot?: ScheduleSlot) => {
    if (/warm-up video/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `📹💥 QUEUED AND LOADED! 🚀✨ Here's your demo SMS preview:\n"🔥 Your ${slot?.art ?? 'trial'} warm-up video is LIVE: pcmadojo.com/warmup/${(slot?.art ?? 'intro').toLowerCase().replace(/\s+/g, '-')} — just 3 magical minutes, ZERO equipment, pure warrior prep! 💪🥋"`,
      });
      return;
    }

    if (/parking pdf/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `🅿️💎 QUEUED — the parking cheat code is headed your way! 🎯✨ Here's your demo SMS preview:\n"🗺️ Parking guide for ${slot?.location ?? 'your class'}: pcmadojo.com/parking/${(slot?.location ?? 'north-park').toLowerCase().replace(/\s+/g, '-')} — best lot + side-street backup included so you roll in like royalty! 👑🚗💨"`,
      });
      return;
    }

    if (/add a friend/i.test(userText)) {
      pushBot({
        kind: 'quick-replies',
        text: "🔥👯 OH LOVE THIS ENERGY — I can absolutely flag a FREE +1 on your booking, no sweat! 🎁✨ Who's the lucky warrior you're bringing into the fold?! 💎",
        quickReplies: ['Friend from work', 'My partner', 'My kid', 'Not sure yet'],
      });
      return;
    }

    if (/friend from work|my partner|my kid|not sure yet/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: "✅💥 DONE AND DONE! 🎯🔥 I added a referral flag to your booking so the front desk is ready to roll out the red carpet for your +1 when they arrive! 👑🥋 This is how legends move! 💎",
      });
      return;
    }

    pushBot({
      kind: 'text',
      text: `🏆💎🔥 PERFECT — your ${slot?.day ?? 'upcoming'} class is absolutely LOCKED IN and the nurture sequence stays live 24/7 if you need ANYTHING before you hit the mat! ✨🥋 You're in elite hands! 🤝💪`,
    });
  };

  /* ─── Slots ─── */
  const offerSlotsDelayed = (ents: Entities, ms: number, opts?: { calendarShared?: boolean; memoryOverride?: MemoryLayer }) => {
    window.setTimeout(() => offerSlots(ents, opts), ms);
  };

  const offerSlots = (ents: Entities, opts?: { calendarShared?: boolean; memoryOverride?: MemoryLayer }) => {
    const { matched, conflictsRemoved } = getMatchedSlots(
      ents,
      opts?.memoryOverride ?? memory,
      opts?.calendarShared ?? state.calendarShared
    );
    if (matched.length === 0) {
      pushBot({
        kind: 'text',
        text: "😱💎 OKAY so all my perfectly-tailored slots for your exact vibe are FULL this week — which honestly PROVES how in-demand we are! 🔥📈 BUT I refuse to jam you into a random slot that doesn't fit your life — that's not how I roll! 💯 I'm immediately pulling in a human wizard to custom-craft a fit JUST for you! 🧙‍♂️✨ Red-carpet handling incoming! 👑",
      });
      triggerEscalation('No slots matched user profile — soft handoff.');
      return;
    }
    setLastOfferedSlots(matched);
    const objectionResurface = buildResurfacedObjectionLine(opts?.memoryOverride ?? memory);
    pushBot({
      kind: 'schedule',
      text: `🔥💎🎯 BOOM — here are ${matched.length} ELITE, hyper-personalized slots I curated JUST for you${ents.location ? ` (${ents.location} location up top like the VIP you are! 👑)` : ''}${ents.travelMode === 'visitor' ? ' with travel-friendly timing perfectly positioned! ✈️' : ''}! ✨🥋${(opts?.calendarShared ?? state.calendarShared) ? `\n\n📅 Calendar-magic note: I already stripped out ${conflictsRemoved} time clash${conflictsRemoved === 1 ? '' : 'es'} from the board, so what you're seeing is CLEAN, real-life-compatible availability only. 🔮✅` : ''}${objectionResurface ? `\n\n${objectionResurface}` : ''}\n\nTap ANY of these bad boys to lock it in INSTANTLY! ⚡👊`,
      scheduleSlots: matched,
    });
    setState(prev => ({ ...prev, step: 'schedule' }));
  };

  const confirmBooking = (slot: ScheduleSlot) => {
    // Decrement capacity
    setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, spotsLeft: Math.max(0, s.spotsLeft - 1) } : s));

    // D5: Replay & learn from this successful conversation (weight 2.0 = booking = strong signal)
    replayAndLearn(messages, 2.0);

    // B4/C1: Log rebuttal outcome for active variant (booking = strongest positive signal)
    if (activeVariantIdRef.current) {
      logRebuttalOutcome(activeVariantIdRef.current, 'booking');
      activeVariantIdRef.current = null;
    }

    // Determine primary booking reason for personalized nurture
    const bookingReason = determineBookingReason(memory, entities, slot);

    const tldr = buildHandoffSummary(
      { ...entities },
      memory,
      slot,
      { ...state, bookedSlot: slot, leadScore: 100, hotLead: true, step: 'post-booking', bookingReason }
    );

    pushBot({
      kind: 'confirmation',
      text: `🔒🔥💎 LOCKED IN LIKE A LEGEND: ${slot.day} · ${slot.time} — ${slot.label} at ${slot.location}! 🏆✨🥋 Confirmation SMS + email have been DISPATCHED at warp speed! 📲📧⚡ You're getting: a 24h reminder, a day-of map pin with parking (the good stuff! 🗺️), AND a personal welcome note from Sensei Carlos himself! 👑✍️ Show up 15 min early, hydrate like a champion, and get ready to WRITE HISTORY! 💪🔥🚀`,
      tldr,
    });

    setState(prev => ({ ...prev, bookedSlot: slot, step: 'post-booking', leadScore: 100, hotLead: true, bookingReason }));

    // Post-booking micro-commitment nurture loop
    window.setTimeout(() => {
      pushBot({
        kind: 'post-booking',
        text: `🔥✨💎 Quick one while the hype is HIGH — ${buildBookingReasonNudge(bookingReason, slot)} Want me to BLESS you with a 60-second ${slot.art} warm-up video AND a fire PDF with the insider parking hacks for ${slot.location}?! 🎁🗺️ This is the concierge treatment, baby! 👑🙌`,
        quickReplies: getSmartReplies({
          step: 'post-booking',
          entities,
          memory,
          recentMessages,
          geoStatus,
          fallback: ['📹 Yes, send warm-up video', '🅿️ Send parking PDF', '👯 Add a friend for free', "I'm good for now"],
        }),
      });
    }, 1600);

    // D6: Schedule nurture checkpoints (day-3 warm-up, day-1 parking, day-0 morning)
    const checkpoints = scheduleNurtureCheckpoints(slot, clock.weekdayIdx, Date.now(), bookingReason);
    nurtureTimerRefs.current.forEach(t => window.clearTimeout(t));
    nurtureTimerRefs.current = [];
    checkpoints.forEach(cp => {
      const delay = Math.max(0, cp.fireAtMs - Date.now());
      const t = window.setTimeout(() => {
        pushBot({
          kind: 'nurture-checkpoint',
          text: cp.message,
          nurtureTag: cp.tag,
        });
        setState(prev => ({ ...prev, lastNurtureTick: Date.now() }));
      }, delay);
      nurtureTimerRefs.current.push(t);
    });
  };

  /* ─── Escalation + Human Shadow Mode ─── */
  const triggerEscalation = (
    internalReason: string,
    overrides?: { ents?: Entities; mem?: MemoryLayer; convo?: ConversationState }
  ) => {
    // Hard guard — never escalate twice in one session
    if (hasEscalatedRef.current) return;
    hasEscalatedRef.current = true;

    const summaryEntities = overrides?.ents ?? entities;
    const summaryMemory = overrides?.mem ?? memory;
    const summaryState = overrides?.convo ?? state;
    const tldr = buildHandoffSummary(summaryEntities, summaryMemory, summaryState.bookedSlot, summaryState);
    pushBot({
      kind: 'escalation',
      text: `🚨🔥💎 ALRIGHT — I'm FLAGGING this for Carlos, our LEGENDARY head instructor, RIGHT NOW! 👑⚡ NO more bots for you — an actual human with warrior wisdom will text you personally within the hour! 📲✨ If you'd rather have a quick callback instead of a text, I can pin that preference to the handoff thread IMMEDIATELY! 🎯🔒`,
      tldr,
    });
    pushBot({
      kind: 'quick-replies',
      text: '💎🎯 What is the BEST next move for you, legend?! I want to handle this PERFECTLY! 🔥',
      quickReplies: getSmartReplies({
        step: 'escalate',
        entities: summaryEntities,
        memory: summaryMemory,
        recentMessages,
        geoStatus,
        fallback: ['Yes, request callback', 'Text is better', 'Keep chatting here'],
      }),
    });
    setState(prev => ({ ...prev, step: 'escalate', humanShadowActive: true }));

    // Human Shadow Mode — simulate "Carlos is typing..." then a real human message
    window.setTimeout(() => {
      setMessages(prev => [...prev, {
        id: nextId.current++,
        sender: 'human',
        kind: 'typing',
        text: 'Carlos is typing…',
      }]);
    }, 2500);

    window.setTimeout(() => {
      setMessages(prev => prev.filter(m => m.kind !== 'typing'));
      const carlosName = summaryEntities.name ? `${summaryEntities.name}, ` : '';
      const artHook = summaryEntities.art
        ? ` Saw you're eyeing ${summaryEntities.art} — I teach that program personally so you're talking to the right guy.`
        : '';
      const kidHook = summaryEntities.audienceType === 'parent'
        ? ` And as a parent myself, I totally get the research mode you're in — zero pressure from me.`
        : '';
      const expHook = summaryEntities.experience === 'Beginner'
        ? ` 80% of our members started as total beginners — you'd fit right in.`
        : summaryEntities.experience === 'Experienced'
          ? ` Since you've got mat experience already, I'll skip the 101 stuff and get into the real conversation.`
          : '';
      const objHook = summaryMemory.objections.length
        ? ` I've already flagged your ${summaryMemory.objections.slice(0, 2).join(' and ')} concern${summaryMemory.objections.length > 1 ? 's' : ''} so I lead with that when we talk.`
        : '';
      const slotHook = summaryState.bookedSlot
        ? ` I see you locked in ${summaryState.bookedSlot.day} ${summaryState.bookedSlot.time} — I'll be there personally to greet you.`
        : '';
      pushHuman({
        kind: 'human-shadow',
        text: `👊🔥 Hey — Carlos here, head instructor! 💪 Just got flagged in by the bot and I'm already on it. 🎯✨ ${carlosName}I'll text you personally in the next 30 minutes from (619) 555-0142.${artHook}${kidHook}${expHook}${objHook}${slotHook} 🤝💎 Zero pressure, zero sales vibes — this is personal now. 🏆`,
      });
    }, 5800);

    if (internalReason) { /* reason captured in handoff summary, linter-friendly */ }
  };

  const buildHandoffSummary = (
    ents: Entities,
    mem: MemoryLayer,
    slot?: ScheduleSlot,
    convo: ConversationState = state
  ): string => {
    const parts: string[] = [];
    if (ents.name) parts.push(ents.name);
    if (ents.audienceType === 'parent') parts.push(`parent of ${ents.kidName ? ents.kidName : 'a kid'}${ents.kidAge ? ` (${ents.kidAge})` : ''}`);
    else if (ents.audienceType === 'adult') parts.push('adult');
    if (ents.art) parts.push(`interested in ${ents.art}`);
    if (ents.experience) parts.push(`${ents.experience.toLowerCase()} level`);
    if (mem.objections.length) parts.push(`concerned about ${mem.objections.join(', ')}`);
    if (ents.location) parts.push(`${ents.location} preferred`);
    if (ents.zipCode) parts.push(`ZIP ${ents.zipCode}`);
    if (ents.phone) parts.push(`phone ${ents.phone}`);
    if (ents.email) parts.push(`email ${ents.email}`);
    if (slot) parts.push(`BOOKED ${slot.day} ${slot.time} ${slot.label} ${slot.location}`);
    const who = parts.length ? parts.join(', ') : 'new lead (minimal profile captured)';
    return `🎯 TL;DR: ${who}. Lead Score ${convo.leadScore}/100. ${mem.hesitations > 0 ? '⚠️ Showed hesitation — tread carefully. ' : '✅ Smooth thread. '}${convo.hotLead ? '🔥🔥🔥 HOT LEAD — prioritize callback!' : ''}`;
  };

  /* ─── Reset ─── */
  const reset = () => {
    clearProfile();
    setMessages([]);
    setEntities({});
    setMemory(INITIAL_MEMORY);
    setState(INITIAL_STATE);
    setResponseTimes([]);
    setShowSuggestions(true);
    setIsReturning(false);
    setGeoStatus('unknown');
    setLastOfferedSlots([]);
    setSlots(BASE_SLOTS);
    nextId.current = 1;
    sessionIdRef.current = `local-${Math.random().toString(36).slice(2, 8)}`;
    bootedRef.current = false;
    hasEscalatedRef.current = false;
    hasShownIdleNudgeRef.current = false;
    postEscalationTurnRef.current = 0;
    window.setTimeout(() => {
      pushBot({
        kind: 'quick-replies',
        text: `🔄✨💥 FRESH START, CLEAN SLATE, INFINITE POSSIBILITIES — I am LIVING for this energy! 👊🔥 Welcome to Pacific Coast Martial Arts — San Diego's ABSOLUTE TEMPLE of warrior excellence! 🏆🥋 It's ${clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')} ${clock.tzLabel} at the dojo and the mats are HUMMING with champion energy! 🎯⚡ So speak it into existence — what brought the FUTURE CHAMPION to our doorstep today?! 💪🌟`,
        quickReplies: ['I want to try a class', 'Is it safe?', 'Kids trial', 'What do you offer?'],
      });
      bootedRef.current = true;
    }, 400);
  };

  /* ─── Derived ─── */
  const avgResponseMs = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  const frontDeskMin = clock.frontDeskOpen ? 0 : clock.minutesUntilFrontDeskOpen;
  const frontDeskBaselineMs = getFrontDeskBaselineMs(clock);
  const responseChartMax = Math.max(frontDeskBaselineMs || 720000, 720000);
  const currentModeLabel = state.mode === 'close' ? 'CLOSE' : state.mode === 'assist' ? 'ASSIST' : 'EXPLORE';
  const modeColor = state.mode === 'close' ? '#22c55e' : state.mode === 'assist' ? '#d4a017' : '#60a5fa';

  const suggestions = [
    "🔥 Hey — I want to try a class!",
    "🥋 Do you have BJJ for beginners?",
    "👶 Is it safe for my 8 year old?",
    "💰 How much does it cost?",
    "😰 I'm nervous about injury",
    "🚀 Book me a trial — let's go!",
  ];

  /* ─── Render ─── */
  return (
    <section className="my-24 scroll-mt-32" id="demo-booking-bot">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dojo-gold/40 to-dojo-gold/60" />
        <span className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest whitespace-nowrap">
          Conversational AI · 04 / 06
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dojo-gold/40 to-dojo-gold/60" />
      </div>

      <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide leading-tight">
        THE LIVE BOOKING BOT 🔥
      </h2>
      <p className="mt-3 text-dojo-gold font-mono text-xs uppercase tracking-[0.25em]">
        A behavioral conversion system. Not just a chatbot. 💎
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        Talk to it like a real prospective student. Try hostile inputs. 😤 Try nervous ones. 😰 Ask for a human. 👤 Come back tomorrow and watch it remember you like an old friend. 🧠✨ This is the EXACT flow a prospective student hits when they DM your Instagram at 11 PM on a Saturday — when your front desk has been closed for <strong className="text-white">{minutesToHuman(frontDeskMin)}</strong>. 🔥
      </p>

      <div className="mt-8 rounded-2xl border border-dojo-gold/20 bg-dojo-dark/80 backdrop-blur-sm overflow-hidden">
        {/* Top bar with live SD clock */}
        <div className="border-b border-white/5 bg-black/40 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dojo-red to-dojo-blood flex items-center justify-center font-heading text-white">
              M
            </div>
            <div>
              <div className="text-sm text-white font-semibold">MatBoss Booking Assistant</div>
              <div className="text-[10px] font-mono text-green-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online · Pacific Coast Martial Arts
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest flex-wrap">
            <div className="text-gray-500">
              SD Time <span className="text-dojo-gold ml-1">{clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')}</span> {clock.tzLabel}
            </div>
            <div className="text-gray-500">
              Mode <span className="ml-1" style={{ color: modeColor }}>{currentModeLabel}</span>
            </div>
            <div className="text-gray-500">
              Lead <span className={state.hotLead ? 'text-dojo-red ml-1' : 'text-white ml-1'}>
                {state.leadScore}{state.hotLead && ' 🔥'}
              </span>
            </div>
          </div>
        </div>

        {/* Honest comparison banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-dojo-red/5 via-transparent to-dojo-gold/5 border-b border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest flex-wrap gap-2">
          <span className="text-dojo-red">
            ✕ Front desk: {clock.frontDeskOpen
              ? `Open · honest baseline ${(frontDeskBaselineMs / 60000).toFixed(0)} min 🐢`
              : `CLOSED 💤 · reopens in ${minutesToHuman(frontDeskMin)}`}
          </span>
          <span className="text-gray-600">vs</span>
          <span className="text-dojo-gold">
            ✓ MatBoss bot 🔥: {avgResponseMs > 0 ? `${(avgResponseMs / 1000).toFixed(2)}s avg reply ⚡` : 'ONLINE NOW · instant ⚡'}
          </span>
        </div>

        {/* Chat area */}
        <div className="grid md:grid-cols-3 gap-0">
          {/* Messages */}
          <div className="md:col-span-2 border-r border-white/5 flex flex-col" style={{ minHeight: 560 }}>
            <div className="flex-1 overflow-y-auto p-6 max-h-[620px]">
              <div className="space-y-4">
                {messages.map(m => (
                  <MessageBubble key={m.id} message={m} onQuickReply={send} onSlotPick={s => confirmBooking(s)} />
                ))}
                {thinking && <TypingBubble />}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Suggested seed inputs */}
            {showSuggestions && messages.length > 0 && !thinking && (
              <div className="px-6 pb-3 flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[10px] font-mono text-gray-500 hover:text-dojo-gold border border-white/10 hover:border-dojo-gold/40 rounded-full px-3 py-1.5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="border-t border-white/5 bg-black/40 p-4 flex gap-3"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="🔥 Try: 'Is BJJ safe for my 8 year old?' or just say hi!"
                className="flex-1 rounded-full bg-dojo-carbon border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-dojo-gold"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-dojo-red text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90"
                style={{ boxShadow: '0 0 12px rgba(220,38,38,0.4)' }}
              >
                Send
              </button>
            </form>
          </div>

          {/* Side intel panel */}
          <div className="p-6 bg-black/20 space-y-6">
            {/* Dynamic response-time honesty meter */}
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">
                ⚡ Honest Response Time
              </div>
              <div className="space-y-2.5">
                <TimeBar label="MatBoss bot" ms={avgResponseMs || 800} max={responseChartMax} color="#d4a017" />
                <TimeBar
                  label={clock.frontDeskOpen ? 'Front desk (honest baseline)' : `Front desk (CLOSED)`}
                  ms={frontDeskBaselineMs}
                  max={responseChartMax}
                  color="#dc2626"
                />
                {!clock.frontDeskOpen && (
                  <div className="text-[9px] font-mono text-dojo-red bg-dojo-red/10 border border-dojo-red/20 rounded p-2 leading-relaxed">
                    🔥 It's {clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')} {clock.tzLabel}. Your competitors' front desks reopen in {minutesToHuman(frontDeskMin)} ⏳. This bot just answered in {avgResponseMs > 0 ? `${(avgResponseMs / 1000).toFixed(2)}s` : 'under 2 seconds'}. ⚡💎
                  </div>
                )}
              </div>
            </div>

            {/* Entity memory */}
            <div className="pt-4 border-t border-white/5">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">
                🧠 Entity Memory
              </div>
              <div className="space-y-1.5 text-[10px] font-mono">
                <StatRow label="Name" value={entities.name || '—'} />
                <StatRow label="Audience" value={entities.audienceType || '—'} />
                <StatRow label="Age" value={entities.age ? String(entities.age) : entities.kidAge ? `kid ${entities.kidAge}` : '—'} />
                <StatRow label="Art" value={entities.art || '—'} />
                <StatRow label="Experience" value={entities.experience || '—'} />
                <StatRow label="Location" value={entities.location || '—'} />
                <StatRow label="Geo" value={geoStatus} />
                <StatRow label="Time pref" value={entities.preferredTime || '—'} />
                <StatRow label="Contact" value={entities.phone || entities.email || '—'} />
              </div>
            </div>

            {/* Memory + lead intel */}
            <div className="pt-4 border-t border-white/5">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">
                📊 Conversion Intel
              </div>
              <div className="space-y-1.5 text-[10px] font-mono">
                <StatRow label="Mode" value={currentModeLabel} color={modeColor} />
                <StatRow label="Lead score" value={`${state.leadScore}/100`} color={state.hotLead ? '#dc2626' : undefined} />
                <StatRow label="Archetype" value={state.archetype || '—'} />
                <StatRow label="Persona" value={memory.persona || '—'} />
                <StatRow label="Objections" value={memory.objections.length ? memory.objections.join(', ') : '—'} />
                <StatRow label="Preempted" value={state.preemptedObjections.length ? state.preemptedObjections.join(', ') : '—'} />
                <StatRow label="Confidence" value={`${Math.round(memory.confidenceScore * 100)}%`} color={memory.confidenceScore < 0.5 ? '#dc2626' : undefined} />
                <StatRow label="Hesitations" value={String(memory.hesitations)} />
                <StatRow label="Readiness" value={`${Math.round(memory.conversionReadiness * 100)}%`} color={memory.conversionReadiness > 0.7 ? '#22c55e' : undefined} />
                <StatRow label="Churn risk" value={`${Math.round(memory.churnRisk * 100)}%`} color={memory.churnRisk > 0.5 ? '#dc2626' : undefined} />
                <StatRow label="Drop-off" value={`${Math.round(memory.dropOffRisk * 100)}%`} color={memory.dropOffRisk > 0.5 ? '#f97316' : undefined} />
                <StatRow label="Booking reason" value={state.bookingReason || '—'} color={state.bookingReason ? '#22c55e' : undefined} />
                <StatRow label="Step" value={state.step} />
              </div>
              {state.hotLead && (
                <div className="mt-3 p-2 rounded bg-dojo-red/10 border border-dojo-red/30 text-center">
                  <div className="text-[9px] font-mono text-dojo-red uppercase tracking-widest animate-pulse">
                    🔥🚨 HOT LEAD · Silently pulling in Carlos 👑
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={reset}
              className="w-full text-[10px] font-mono text-gray-500 hover:text-white border border-white/10 hover:border-dojo-gold/40 rounded py-2 uppercase tracking-widest transition-all"
            >
              ↻ Reset + Clear Memory 🔄
            </button>
          </div>
        </div>

        {/* Timestamp footer */}
        <div className="px-6 py-2 bg-black/40 border-t border-white/5 text-[9px] font-mono text-gray-600 uppercase tracking-widest flex items-center justify-between flex-wrap gap-2">
          <span>Session: {formatSDTimestamp()}</span>
          <span>Messages: {messages.length}</span>
          <span>{isReturning ? '✦ Returning visitor' : 'New session'}</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Message rendering ─── */

function MessageBubble({
  message, onQuickReply, onSlotPick,
}: {
  message: ChatMessage;
  onQuickReply: (text: string) => void;
  onSlotPick: (slot: ScheduleSlot) => void;
}) {
  const isBot = message.sender === 'bot';
  const isHuman = message.sender === 'human';
  const renderReplyButtons = (replies: string[] | undefined, className: string) => (
    replies && replies.length > 0 ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {replies.map(q => (
          <button key={q} onClick={() => onQuickReply(q)} className={className}>
            {q}
          </button>
        ))}
      </div>
    ) : null
  );

  // Human shadow
  if (isHuman) {
    if (message.kind === 'typing') {
      return (
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex-shrink-0 flex items-center justify-center font-heading text-white text-xs">C</div>
          <div className="bg-green-900/20 border border-green-500/20 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-2 text-[10px] font-mono text-green-400 uppercase tracking-widest">🥋 Carlos is typing... ✨</span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex-shrink-0 flex items-center justify-center font-heading text-white text-xs">C</div>
        <div className="flex-1 max-w-[85%]">
          <div className="bg-green-900/10 border border-green-500/30 rounded-2xl rounded-bl-md p-4">
            <div className="text-[9px] font-mono text-green-400 uppercase tracking-widest mb-2">
              👤🏆 Human · Carlos (Head Instructor) · Shadow Mode ✨
            </div>
            <div className="text-sm text-white leading-relaxed">{message.text}</div>
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'confirmation') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[90%]">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl rounded-bl-md p-4">
            <div className="text-[9px] font-mono text-green-400 uppercase tracking-widest mb-2">
              ✅🎉 Booking CONFIRMED · You're LOCKED IN 🔒
            </div>
            <div className="text-sm text-white leading-relaxed">{message.text}</div>
            {message.tldr && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-1">📨 Handoff summary → owner dashboard 👑</div>
                <div className="text-[11px] text-gray-300 font-mono">{message.tldr}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'rehydrate') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[85%]">
          <div className="bg-gradient-to-br from-dojo-gold/10 to-dojo-gold/5 border border-dojo-gold/30 rounded-2xl rounded-bl-md p-4">
            <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-2">
              ✨🔁 Returning visitor DETECTED · Welcome home 🏠
            </div>
            <div className="text-sm text-white leading-relaxed mb-3">{message.text}</div>
            {message.quickReplies && (
              <div className="flex flex-wrap gap-2">
                {message.quickReplies.map(q => (
                  <button key={q} onClick={() => onQuickReply(q)} className="bg-dojo-gold/10 hover:bg-dojo-gold/20 border border-dojo-gold/30 text-white text-xs rounded-full px-3 py-1.5 transition-all">{q}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'microproof') {
    const [title, ...rest] = message.text.split('\n');
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-dojo-carbon border-l-2 border-dojo-gold rounded-2xl rounded-bl-md p-4">
          <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-2">📊🔥 Microproof · Receipts 💎</div>
          <div className="text-sm text-white font-semibold mb-1">{title}</div>
          <div className="text-xs text-gray-300 leading-relaxed">{rest.join('\n')}</div>
        </div>
      </div>
    );
  }

  if (message.kind === 'preempt') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-dojo-dark border border-dojo-gold/20 rounded-2xl rounded-bl-md p-4">
          <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-2">🎯🧠 Preempt · Reading minds ✨</div>
          <div className="text-sm text-white leading-relaxed">{message.text}</div>
        </div>
      </div>
    );
  }

  if (message.kind === 'empathy') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-blue-500/5 border border-blue-500/20 rounded-2xl rounded-bl-md p-4">
          <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">💙🫂 Empathy beat · I got you 🤝</div>
          <div className="text-sm text-white leading-relaxed">{message.text}</div>
        </div>
      </div>
    );
  }

  if (message.kind === 'clarify') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%]">
          <div className="bg-dojo-carbon border border-dojo-gold/20 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-2">❓💎 Clarification ladder · Getting you RIGHT 🎯</div>
            <div className="text-sm text-white mb-3">{message.text}</div>
            {message.quickReplies && (
              <div className="flex flex-wrap gap-2">
                {message.quickReplies.map(q => (
                  <button key={q} onClick={() => onQuickReply(q)} className="bg-dojo-gold/10 hover:bg-dojo-gold/20 border border-dojo-gold/30 text-white text-xs rounded-full px-3 py-1.5 transition-all">{q}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'escalation') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[85%]">
          <div className="bg-gradient-to-br from-dojo-gold/10 to-dojo-gold/5 border border-dojo-gold/30 rounded-2xl rounded-bl-md p-4">
            <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-2">
              ⚡🚨 Flagged for HUMAN HANDOFF · Carlos is inbound 👑
            </div>
            <div className="text-sm text-white leading-relaxed">{message.text}</div>
            {message.tldr && (
              <div className="mt-3 pt-3 border-t border-dojo-gold/20">
                <div className="text-[9px] font-mono text-dojo-red uppercase tracking-widest mb-1">📨🔥 Sent to Carlos's inbox · Priority ⚡</div>
                <div className="text-[11px] text-gray-300 font-mono">{message.tldr}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'schedule') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[95%]">
          {message.text && (
            <div className="bg-dojo-carbon rounded-2xl rounded-bl-md px-4 py-3 mb-2 text-sm text-white whitespace-pre-wrap">
              {message.text}
            </div>
          )}
          <div className="grid gap-2">
            {message.scheduleSlots?.map((slot, idx) => (
              <SlotCard key={slot.id} slot={slot} highlighted={idx === 0} onPick={() => onSlotPick(slot)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'quick-replies') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[85%]">
          {message.text && (
            <div className="bg-dojo-carbon rounded-2xl rounded-bl-md px-4 py-3 mb-2 text-sm text-white whitespace-pre-wrap">
              {message.text}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {message.quickReplies?.map(q => (
              <button
                key={q}
                onClick={() => onQuickReply(q)}
                className="bg-dojo-red/10 hover:bg-dojo-red/20 border border-dojo-red/30 text-white text-xs rounded-full px-3 py-1.5 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'post-booking') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[85%]">
          <div className="bg-gradient-to-br from-dojo-gold/5 to-dojo-red/5 border border-dojo-gold/20 rounded-2xl rounded-bl-md p-4">
            <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-2">
              ✨🎁 Post-booking nurture · VIP treatment 👑
            </div>
            <div className="text-sm text-white leading-relaxed mb-3">{message.text}</div>
            {message.quickReplies && (
              <div className="flex flex-wrap gap-2">
                {message.quickReplies.map(q => (
                  <button key={q} onClick={() => onQuickReply(q)} className="bg-dojo-gold/10 hover:bg-dojo-gold/20 border border-dojo-gold/30 text-white text-xs rounded-full px-3 py-1.5 transition-all">{q}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'story') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-fuchsia-500/5 border border-fuchsia-400/20 rounded-2xl rounded-bl-md p-4">
          <div className="text-[10px] font-mono text-fuchsia-300 uppercase tracking-widest mb-2">📖✨ Story beat · Identity shift in motion</div>
          <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    );
  }

  if (message.kind === 'live-activity') {
    const label = message.liveActivityKind === 'booking'
      ? '⚡ Live booking pulse'
      : message.liveActivityKind === 'viewing'
        ? '👀 Live viewer pulse'
        : '🥋 Live dojo pulse';
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-2 animate-pulse">{label}</div>
          <div className="text-sm text-white leading-relaxed">{message.text}</div>
        </div>
      </div>
    );
  }

  if (message.kind === 'calendar-share') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[85%]">
          <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-2xl rounded-bl-md p-4">
            <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest mb-2">📅✨ Predictive calendar sync</div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
            {renderReplyButtons(message.quickReplies, 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-white text-xs rounded-full px-3 py-1.5 transition-all')}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'neighborhood-offer') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[85%]">
          <div className="bg-gradient-to-br from-emerald-500/10 to-dojo-gold/5 border border-emerald-400/30 rounded-2xl rounded-bl-md p-4">
            <div className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest mb-2">🏡🔥 Local Legend unlock</div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
            {message.neighborhoodOffer && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono uppercase tracking-widest">
                <div className="rounded-lg bg-black/20 px-2 py-2 text-gray-300">{message.neighborhoodOffer.dojo}</div>
                <div className="rounded-lg bg-black/20 px-2 py-2 text-gray-300">{message.neighborhoodOffer.distanceMi.toFixed(1)} mi</div>
                <div className="rounded-lg bg-black/20 px-2 py-2 text-dojo-gold">{message.neighborhoodOffer.discount}% off</div>
              </div>
            )}
            {renderReplyButtons(message.quickReplies, 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-white text-xs rounded-full px-3 py-1.5 transition-all')}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'mat-tour') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[88%]">
          <div className="bg-violet-500/5 border border-violet-400/20 rounded-2xl rounded-bl-md p-4">
            <div className="text-[10px] font-mono text-violet-300 uppercase tracking-widest mb-2">🎥🥋 Mental mat tour</div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
            {message.matTourScenes && (
              <div className="mt-3 space-y-2">
                {message.matTourScenes.map(scene => (
                  <div key={scene} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-gray-200 leading-relaxed">
                    {scene}
                  </div>
                ))}
              </div>
            )}
            {renderReplyButtons(message.quickReplies, 'bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/30 text-white text-xs rounded-full px-3 py-1.5 transition-all')}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'cycle-breaker') {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[88%]">
          <div className="bg-amber-500/5 border border-amber-300/30 rounded-2xl rounded-bl-md p-4">
            <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-2">🛑💎 Cycle breaker</div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
            {renderReplyButtons(message.quickReplies, 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/30 text-white text-xs rounded-full px-3 py-1.5 transition-all')}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'momentum-lock' || message.kind === 'drop-off-save' || message.kind === 'parallel-answer') {
    const badge = message.kind === 'momentum-lock'
      ? '🔒⚡ Momentum lock'
      : message.kind === 'drop-off-save'
        ? '🫂✨ Save the drop-off'
        : '🧠⚔️ Parallel answer';
    const toneClass = message.kind === 'momentum-lock'
      ? 'bg-dojo-red/10 hover:bg-dojo-red/20 border border-dojo-red/30 text-white text-xs rounded-full px-3 py-1.5 transition-all'
      : message.kind === 'drop-off-save'
        ? 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-white text-xs rounded-full px-3 py-1.5 transition-all'
        : 'bg-dojo-gold/10 hover:bg-dojo-gold/20 border border-dojo-gold/30 text-white text-xs rounded-full px-3 py-1.5 transition-all';
    const panelClass = message.kind === 'momentum-lock'
      ? 'bg-dojo-red/5 border-dojo-red/20'
      : message.kind === 'drop-off-save'
        ? 'bg-blue-500/5 border-blue-400/20'
        : 'bg-dojo-gold/5 border-dojo-gold/20';
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="flex-1 max-w-[88%]">
          <div className={`border rounded-2xl rounded-bl-md p-4 ${panelClass}`}>
            <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-2">{badge}</div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
            {renderReplyButtons(message.quickReplies, toneClass)}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === 'nurture-checkpoint') {
    const checkpointLabel = message.nurtureTag === 'day-minus-3'
      ? '📹 T-3 nurture'
      : message.nurtureTag === 'day-minus-1'
        ? '🅿️ T-1 nurture'
        : '🌅 Day-of nurture';
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-dojo-gold/5 border border-dojo-gold/20 rounded-2xl rounded-bl-md p-4">
          <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-2">{checkpointLabel}</div>
          <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    );
  }

  if (isBot) {
    return (
      <div className="flex gap-2">
        <BotAvatar />
        <div className="max-w-[85%] bg-dojo-carbon rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    );
  }

  // User
  return (
    <div className="flex gap-2 justify-end">
      <div className="max-w-[85%] bg-gradient-to-br from-dojo-red to-dojo-blood rounded-2xl rounded-br-md px-4 py-3 text-sm text-white">
        {message.text}
      </div>
      <div className="w-8 h-8 rounded-full bg-dojo-carbon border border-white/10 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
        U
      </div>
    </div>
  );
}

function BotAvatar() {
  return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dojo-red to-dojo-blood flex-shrink-0 flex items-center justify-center font-heading text-white text-xs">M</div>;
}

function TypingBubble() {
  return (
    <div className="flex items-center gap-2">
      <BotAvatar />
      <div className="bg-dojo-carbon rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function SlotCard({ slot, highlighted, onPick }: { slot: ScheduleSlot; highlighted: boolean; onPick: () => void }) {
  const scarcity = slot.spotsLeft <= 2;
  return (
    <button
      onClick={onPick}
      disabled={slot.spotsLeft === 0}
      className={`text-left rounded-xl px-4 py-3 text-xs text-white transition-all ${
        highlighted
          ? 'bg-gradient-to-br from-dojo-gold/10 to-dojo-red/5 border border-dojo-gold/50 hover:border-dojo-gold'
          : 'bg-black/40 border border-dojo-gold/20 hover:border-dojo-gold/60 hover:bg-dojo-gold/5'
      } ${slot.spotsLeft === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={highlighted ? { boxShadow: '0 0 15px rgba(212,160,23,0.25)' } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm text-white">{slot.day} · {slot.time}</span>
            {highlighted && <span className="text-[8px] font-mono text-dojo-gold uppercase tracking-widest">◆💎 BEST match ✨</span>}
          </div>
          <div className="text-[11px] text-gray-400">{slot.label} · 📍 {slot.location}</div>
          <div className="mt-2 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest flex-wrap">
            {scarcity && (
              <span className="text-dojo-red animate-pulse">🔥 Only {slot.spotsLeft} left!</span>
            )}
            {!scarcity && slot.spotsLeft > 0 && (
              <span className="text-gray-500">✅ {slot.spotsLeft} spots</span>
            )}
            <span className="text-gray-600">👀 {slot.viewers} viewing</span>
            <span className="text-green-500">⚡ {slot.recentSignups} booked this week</span>
          </div>
        </div>
        <div className="text-dojo-gold font-mono text-[9px] whitespace-nowrap">
          {slot.spotsLeft === 0 ? '😱 FULL' : '🔒 TAP →'}
        </div>
      </div>
    </button>
  );
}

function TimeBar({ label, ms, max, color }: { label: string; ms: number; max: number; color: string }) {
  const pct = Math.min(100, (ms / max) * 100);
  const display = ms < 1000 ? `${Math.round(ms)}ms`
    : ms < 60000 ? `${(ms / 1000).toFixed(1)}s`
    : ms < 3600000 ? `${Math.round(ms / 60000)}m`
    : `${Math.round(ms / 3600000)}h`;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-mono" style={{ color }}>{display}</span>
      </div>
      <div className="h-1.5 bg-dojo-carbon rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(pct, 1.5)}%`, background: color, boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-gray-500 uppercase text-[9px] whitespace-nowrap">{label}</span>
      <span className="text-[10px] truncate" style={{ color: color || '#ffffff', maxWidth: 160 }} title={value}>{value}</span>
    </div>
  );
}
