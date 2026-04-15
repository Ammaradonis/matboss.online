import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSanDiegoClock, formatSDTimestamp, minutesToHuman, sdNow } from './sdTime';

/* ═══════════════════════════════════════════════════════════════════════════
   THE MATBOSS LIVE BOOKING BOT — Behavioral Conversion System
   Implements 25 hyper-smart enhancements:
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
  | 'preempt';

type Mode = 'explore' | 'assist' | 'close';
type GeoStatus = 'unknown' | 'local' | 'non-local' | 'shared' | 'denied';
type TravelMode = 'local' | 'visitor' | 'virtual';

type ObjectionKey = 'price' | 'safety' | 'wear' | 'time' | 'insurance' | 'kid-safety';

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
  meta?: {
    responseMs?: number;
    intent?: string;
    confidence?: number;
    sentiment?: 'neg' | 'neu' | 'pos';
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

interface MemoryLayer {
  objections: ObjectionKey[];
  objectionCounts: Partial<Record<ObjectionKey, number>>;
  hesitations: number;
  engagementScore: number;
  messageCount: number;
  sameMessageTwice: boolean;
  lastUserMessage: string;
  confidenceScore: number; // 1.0 → 0
  unclearCount: number;
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

/** Dynamic slot matcher — filters & ranks by relevance to current entities. */
function matchSlots(entities: Entities, slots: ScheduleSlot[]): ScheduleSlot[] {
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
      return { slot, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.slot);

  return filtered.slice(0, 4);
}

/** Context-aware typing delay (reading time + thinking time). */
function calculateTypingDelay(previousBotText: string, nextKind: MessageKind): number {
  const readingTime = Math.min(3500, previousBotText.length * 22); // ~22ms/char, cap 3.5s
  let thinking = 600;
  switch (nextKind) {
    case 'schedule':    thinking = 1100 + Math.random() * 400; break;
    case 'microproof':  thinking = 900 + Math.random() * 300; break;
    case 'empathy':     thinking = 500 + Math.random() * 200; break;
    case 'clarify':     thinking = 700 + Math.random() * 300; break;
    case 'human-shadow':thinking = 1400 + Math.random() * 500; break;
    default:            thinking = 500 + Math.random() * 350;
  }
  return Math.max(400, readingTime * 0.3 + thinking);
}

function toObjectionKey(intent?: string): ObjectionKey | null {
  if (!intent?.startsWith('objection:')) return null;
  return intent.split(':')[1] as ObjectionKey;
}

function deriveNextMemory(
  current: MemoryLayer,
  text: string,
  topIntent: { intent: string; confidence: number } | undefined,
  gainedEntity: boolean
): MemoryLayer {
  const sameTwice = current.lastUserMessage.toLowerCase() === text.toLowerCase();
  const next: MemoryLayer = {
    ...current,
    objections: [...current.objections],
    objectionCounts: { ...current.objectionCounts },
    messageCount: current.messageCount + 1,
    lastUserMessage: text,
    sameMessageTwice: sameTwice,
    engagementScore: current.engagementScore + (gainedEntity ? 12 : 5),
    confidenceScore: current.confidenceScore,
    unclearCount: current.unclearCount,
    hesitations: current.hesitations,
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
    if (count >= 2) {
      next.hesitations += 1;
      next.confidenceScore = Math.max(0, next.confidenceScore - 0.1);
    }
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

/** Compute the next best move based on state, entities, memory, lead score. */
function bestNextMove(
  state: ConversationState,
  entities: Entities,
  memory: MemoryLayer
): 'greet' | 'clarify' | 'qualify' | 'preempt' | 'offer-slots' | 'close' | 'escalate' | 'microproof' {
  if (memory.confidenceScore < 0.45 || memory.unclearCount >= 2) return 'escalate';
  if (memory.objections.length >= 3 || Object.values(memory.objectionCounts).some(count => (count ?? 0) >= 2)) return 'escalate';
  if (state.leadScore >= 80 && state.step !== 'done') return 'close';
  if (state.step === 'greeting' && state.messagesSent === 0) return 'greet';
  if (!entities.audienceType && !entities.art) return 'qualify';
  if (entities.art && entities.experience && state.step !== 'schedule') return 'offer-slots';
  if (entities.audienceType && !state.preemptedObjections.length && state.mode === 'explore') return 'preempt';
  if (memory.objections.length > 0 && state.leadScore < 60) return 'microproof';
  return 'qualify';
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
};

const INITIAL_MEMORY: MemoryLayer = {
  objections: [],
  objectionCounts: {},
  hesitations: 0,
  engagementScore: 0,
  messageCount: 0,
  sameMessageTwice: false,
  lastUserMessage: '',
  confidenceScore: 1.0,
  unclearCount: 0,
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
  const hiddenAtRef = useRef<number | null>(null);
  const bootedRef = useRef(false);
  const sessionIdRef = useRef(`local-${Math.random().toString(36).slice(2, 8)}`);
  const hasEscalatedRef = useRef(false);
  const hasShownIdleNudgeRef = useRef(false);
  const postEscalationTurnRef = useRef(0);

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

  /* ─── Sunk cost re-engagement (45s idle at schedule step) ─── */
  useEffect(() => {
    if (state.step !== 'schedule' || state.step === undefined) return;
    if (hasShownIdleNudgeRef.current || hasEscalatedRef.current) return;
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      if (hasShownIdleNudgeRef.current || hasEscalatedRef.current) return;
      if (Date.now() - lastActivityAt >= 44000) {
        const featuredSlot = lastOfferedSlots[0] || slots[0];
        pushBot({
          kind: 'text',
          text: `👋🔥 Hey — still with me, legend?! 💎 I see you vibing with the slots and I RESPECT that energy! ✨ Want me to HOLD one for 10 whole minutes while you lock it in mentally?! 🔒⏰ The ${featuredSlot?.day} ${featuredSlot?.time} slot at ${featuredSlot?.location} only has ${featuredSlot?.spotsLeft} spots left and it's moving FAST — just say the word! 🚀💪`,
        });
        setMemory(m => ({ ...m, hesitations: m.hesitations + 1 }));
        hasShownIdleNudgeRef.current = true;
      }
    }, 45000) as unknown as number;
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, lastActivityAt, lastOfferedSlots, slots]);

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

  const resolveLocationSignal = useCallback((location: SDNeighborhood, source: GeoStatus, distance?: number) => {
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

    pushBot({
      kind: 'text',
      text: `📍🔥💥 BOOM — ${location} is DIALED IN and honestly? It's the CROWN JEWEL of our whole San Diego empire! 🏆👑✨ I'm locking that in right now and pulling up the MOST ELITE schedule the universe has ever seen — curated JUST for you! 🌟🎯 The mats in ${location} have been waiting for a warrior exactly like you! 💪🥋⚡ Let's GOOOO! 🚀🔥`,
    });
  }, [entities, memory, pushBot, recentMessages]);

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
          nearest.distance
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

    // Score intents + sentiment
    const intents = scoreIntents(text);
    const topIntent = intents[0];
    const sentiment = detectSentiment(text);

    // Extract entities
    const newEntities = extractEntities(text, entities);
    const gainedEntity = Object.keys(newEntities).length > Object.keys(entities).length;
    const nextMemory = deriveNextMemory(memory, text, topIntent, gainedEntity);
    const nextState = deriveNextState(state, topIntent);

    setMemory(nextMemory);
    setEntities(newEntities);
    setState(nextState);

    // Compute typing delay using previous bot message
    const prevBot = [...messages].reverse().find(m => m.sender === 'bot');
    const delay = calculateTypingDelay(
      prevBot?.text || '',
      predictResponseKind(topIntent, sentiment, nextMemory, newEntities)
    );

    window.setTimeout(() => {
      const responseMs = performance.now() - sentAt;
      setResponseTimes(r => [...r, responseMs]);
      respond(text, topIntent, intents, sentiment, newEntities, nextMemory, nextState);
      setThinking(false);
    }, delay);
  };

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

    if (/show me slots/i.test(userText) && (newEntities.art || entities.art)) {
      offerSlots({ ...entities, ...newEntities });
      return;
    }

    // Returning visitor quick paths
    if (isReturning && /continue|yes/i.test(userText) && (entities.art || newEntities.art)) {
      const remembered = { ...entities, ...newEntities };
      pushBot({
        kind: 'text',
        text: `🔥💎 YESSSS — we are PICKING UP EXACTLY where destiny left us! ✨👑 I remember EVERYTHING about you like it was burned into my circuits: ${remembered.art}${remembered.experience ? ', ' + remembered.experience.toLowerCase() + ' warrior' : ''}${remembered.audienceType === 'parent' ? `, proud parent of a future champion` : ''}! 🧠💪 I've got ${matchSlots(remembered, slots).length} ELITE, laser-tailored slots waiting for you RIGHT NOW and they are ABSOLUTELY PERFECT! 🎯🏆 Let's GO! 🚀🥋`,
      });
      window.setTimeout(() => offerSlots(remembered), 900);
      setIsReturning(false);
      return;
    }

    const isMicroCommitmentReply =
      (currentState.step === 'micro-day-pref' && /weekday|weekend|either/i.test(userText))
      || (currentState.step === 'micro-time-pref' && /evening|morning|earlier|either/i.test(userText));

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
      window.setTimeout(() => offerSlots(updatedEntities), 900);
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
      offerSlotsDelayed({ ...newEntities, audienceType: 'parent', art: 'Kids' }, 1800);
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
        window.setTimeout(() => offerSlots({ ...newEntities, experience: exp }), 2400);
      } else {
        window.setTimeout(() => offerSlots({ ...newEntities, experience: exp }), 800);
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
        offerSlots(newEntities);
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
      window.setTimeout(() => offerSlots(updatedEntities), 900);
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
      window.setTimeout(() => offerSlots({ ...newEntities, preferredTime: pref }), 900);
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
      window.setTimeout(() => offerSlots(newEntities), 800);
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
      case 'escalate':
        triggerEscalation('Best-move recommender chose escalation.', { ents, mem: decisionMemory, convo: decisionState });
        return;
      case 'offer-slots':
        offerSlots(ents);
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
    const proofs: Record<string, { title: string; body: string; citation: string }> = {
      'price':       { title: '💸💎🔥 Real-member receipts (no fluff!)', body: '73% of our members train 2×/week and their daily cost literally comes out to gym + one coffee — absolute STEAL! ☕ Zero contract lock-in, 100% month-to-month freedom! 🆓✨ This is elite pricing, no cap! 💯', citation: '📊 Internal 2025 member survey, n=412' },
      'safety':      { title: '🛡️💪 The SAFETY RECEIPTS speak for themselves!', body: 'Over 18 straight months: ZERO concussions. 🙌 Only 2 minor sprains across ~9,400 training sessions — that is STATISTICALLY safer than recreational basketball! 🏀📉 Let that SINK IN! 🔥', citation: '📋 Pacific Coast Martial Arts incident log 2024–2025' },
      'kid-safety':  { title: '👶🛡️💎 Kid-safety MICROPROOF (parents read this twice!)', body: 'Kids program = 6:1 coach ratio (basically elite private tutoring! 🎯), fully background-checked certified instructors 🧑‍🏫, trained 400+ San Diego kids over 3 years with ZERO serious injuries! 🙏✨ Parents watch EVERY class from the benches — full transparency always! 👀💯', citation: '📊 California martial arts parent survey 2024' },
      'wear':        { title: '👕🙌 The first-class dress code (relax, you\'re fine!)', body: '80% of first-timers roll up in regular gym clothes — literally zero judgment! 💯 We\'ve got FREE loaner gis in every size at the front desk! 🎁 Just bring water + a towel and your warrior spirit! 💧🔥', citation: '✅ First-class onboarding checklist' },
      'time':        { title: '⏱️🏆 The typical champion schedule!', body: 'MOST of our adult members train just 2×/week and feel HUGE improvements in 6–8 weeks flat! 📈💥 You do NOT need to live at the dojo to see life-changing results — efficiency is EVERYTHING! ⚡🎯', citation: '📊 Member progression study 2024' },
      'insurance':   { title: '📋🛡️ Full legal coverage — zero vibe-killers!', body: 'Every member signs a standard waiver. We carry commercial liability insurance for every single mat session. 🏛️✨ Contracts are month-to-month, cancel anytime — absolute freedom! 🆓💯', citation: '📝 Standard enrollment agreement' },
    };
    const proof = proofs[kind] || proofs.price;
    pushBot({
      kind: 'microproof',
      text: `${proof.title}\n${proof.body}\n— ${proof.citation}`,
    });
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
      text: "🙌💎 NO problem AT ALL — I'll keep the context warm and toasty right here until Carlos rolls in like the legend he is! 🔥✨ You're in good hands! 🤝",
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
  const offerSlotsDelayed = (ents: Entities, ms: number) => {
    window.setTimeout(() => offerSlots(ents), ms);
  };

  const offerSlots = (ents: Entities) => {
    const matched = matchSlots(ents, slots);
    if (matched.length === 0) {
      pushBot({
        kind: 'text',
        text: "😱💎 OKAY so all my perfectly-tailored slots for your exact vibe are FULL this week — which honestly PROVES how in-demand we are! 🔥📈 BUT I refuse to jam you into a random slot that doesn't fit your life — that's not how I roll! 💯 I'm immediately pulling in a human wizard to custom-craft a fit JUST for you! 🧙‍♂️✨ Red-carpet handling incoming! 👑",
      });
      triggerEscalation('No slots matched user profile — soft handoff.');
      return;
    }
    setLastOfferedSlots(matched);
    pushBot({
      kind: 'schedule',
      text: `🔥💎🎯 BOOM — here are ${matched.length} ELITE, hyper-personalized slots I curated JUST for you${ents.location ? ` (${ents.location} location up top like the VIP you are! 👑)` : ''}${ents.travelMode === 'visitor' ? ' with travel-friendly timing perfectly positioned! ✈️' : ''}! ✨🥋 Tap ANY of these bad boys to lock it in INSTANTLY! ⚡👊`,
      scheduleSlots: matched,
    });
    setState(prev => ({ ...prev, step: 'schedule' }));
  };

  const confirmBooking = (slot: ScheduleSlot) => {
    // Decrement capacity
    setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, spotsLeft: Math.max(0, s.spotsLeft - 1) } : s));

    const tldr = buildHandoffSummary(
      { ...entities },
      memory,
      slot,
      { ...state, bookedSlot: slot, leadScore: 100, hotLead: true, step: 'post-booking' }
    );

    pushBot({
      kind: 'confirmation',
      text: `🔒🔥💎 LOCKED IN LIKE A LEGEND: ${slot.day} · ${slot.time} — ${slot.label} at ${slot.location}! 🏆✨🥋 Confirmation SMS + email have been DISPATCHED at warp speed! 📲📧⚡ You're getting: a 24h reminder, a day-of map pin with parking (the good stuff! 🗺️), AND a personal welcome note from Sensei Carlos himself! 👑✍️ Show up 15 min early, hydrate like a champion, and get ready to WRITE HISTORY! 💪🔥🚀`,
      tldr,
    });

    setState(prev => ({ ...prev, bookedSlot: slot, step: 'post-booking', leadScore: 100, hotLead: true }));

    // Post-booking micro-commitment nurture loop
    window.setTimeout(() => {
      pushBot({
        kind: 'post-booking',
        text: `🔥✨💎 Quick one while the hype is HIGH — while you count down to class, want me to BLESS you with a 60-second ${slot.art} warm-up video AND a fire PDF with the insider parking hacks for ${slot.location}?! 🎁🗺️ This is the concierge treatment, baby! 👑🙌`,
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
                <StatRow label="Objections" value={memory.objections.length ? memory.objections.join(', ') : '—'} />
                <StatRow label="Preempted" value={state.preemptedObjections.length ? state.preemptedObjections.join(', ') : '—'} />
                <StatRow label="Confidence" value={`${Math.round(memory.confidenceScore * 100)}%`} color={memory.confidenceScore < 0.5 ? '#dc2626' : undefined} />
                <StatRow label="Hesitations" value={String(memory.hesitations)} />
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
            <div className="bg-dojo-carbon rounded-2xl rounded-bl-md px-4 py-3 mb-2 text-sm text-white">
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
