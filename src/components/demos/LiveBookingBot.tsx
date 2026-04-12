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
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      if (Date.now() - lastActivityAt >= 44000) {
        const featuredSlot = lastOfferedSlots[0] || slots[0];
        pushBot({
          kind: 'text',
          text: `Still there? I can see you're checking out the slots — want me to hold one for 10 minutes while you decide? The ${featuredSlot?.day} ${featuredSlot?.time} slot at ${featuredSlot?.location} has only ${featuredSlot?.spotsLeft} spots left.`,
        });
        setMemory(m => ({ ...m, hesitations: m.hesitations + 1 }));
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
        && hiddenAtRef.current
        && Date.now() - hiddenAtRef.current >= 45000
      ) {
        const featuredSlot = lastOfferedSlots[0];
        pushBot({
          kind: 'text',
          text: featuredSlot
            ? `Welcome back — I kept the ${featuredSlot.day} ${featuredSlot.time} ${featuredSlot.label} option at the top for you. Want me to hold it while you check your calendar?`
            : 'Welcome back — want me to keep the best beginner slot warm while you decide?',
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
      text: `📍🔥 PERFECT — ${location} is your nearest dojo and it is INCREDIBLE! 🏆✨ I'm locking that in and pulling up the BEST schedule just for you! Let's get you on the mat! 💪🥋`,
    });
  }, [entities, memory, pushBot, recentMessages]);

  const requestPreciseLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      pushBot({
        kind: 'quick-replies',
        text: "This browser won't share location, but ZIP code works too. Drop your ZIP or pick the nearest area:",
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
          text: "No problem — if you'd rather not share precise location, give me a ZIP code or tap the nearest area.",
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
          text: "🆕✨ Fresh slate, clean energy — I LOVE IT! 💪🔥 I'm the MatBoss bot and I'm FIRED UP to help you! 🥋⚡ So what's calling your warrior spirit today?! 👊💥",
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
        text: "Travel-friendly mode on. I'll surface weekend slots first and keep the schedule tight.",
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
    // Escalation checks FIRST
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

    if (currentState.step === 'post-booking') {
      handlePostBookingResponse(userText, currentState.bookedSlot);
      return;
    }

    if (currentState.step === 'escalate' && /callback|call me|text is better|keep chatting/i.test(userText)) {
      handleEscalationPreference(userText);
      return;
    }

    if (
      currentState.step === 'escalate'
      && (newEntities.phone || newEntities.email)
      && (newEntities.phone !== entities.phone || newEntities.email !== entities.email)
    ) {
      pushBot({
        kind: 'text',
        text: `Perfect — I pinned ${newEntities.phone || newEntities.email} to Carlos's handoff summary so he reaches out on the right channel.`,
      });
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
        text: `Perfect — picking up where we left off. Based on what I remember (${remembered.art}${remembered.experience ? ', ' + remembered.experience.toLowerCase() : ''}${remembered.audienceType === 'parent' ? `, parent of a kid` : ''}), I've got ${matchSlots(remembered, slots).length} tailored slots ready.`,
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
          text: `Got it — I want to make sure I help with the right thing. Is this more about ${optA}, or ${optB}?`,
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
        text: "Totally fair — let me make it simpler. Pick one and I'll take it from there:",
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
        text: 'Got it. Evening or earlier in the day?',
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
        text: `${preferredTime === 'evening' ? 'Evenings' : preferredTime === 'morning' ? 'Earlier sessions' : 'Flexible timing'} — noted. Pulling matching slots now…`,
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
        text: `Totally hear you — everyone feels a bit of that at first. Let me answer directly, no sales pitch.`,
      });
    }

    if (currentState.hotLead && !state.hotLead && !currentState.humanShadowActive) {
      pushBot({
        kind: 'text',
        text: "You're moving fast, so I'm quietly pulling Carlos into the background in case you want a 30-second callback after this.",
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
        text: "Great question — and exactly the kind of thing a human should answer personally. Our contracts are month-to-month, full waiver on file, and we carry commercial liability insurance on every mat. I'll have our GM shoot you the specifics. What's the best way to reach you?",
      });
      return;
    }

    // Kid path
    if (topIntent.intent === 'age:Kid' || newEntities.audienceType === 'parent') {
      pushBot({
        kind: 'text',
        text: `Amazing — kids martial arts is the backbone of what we do. Our program is 4–12 years old, 6:1 coach ratio, parents watch from the benches, zero pressure. ${newEntities.kidName ? `What ${newEntities.kidName} will get on day one: ` : 'What kids get on day one: '}discipline drills, games, basic movement, and a free gi after the trial.`,
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
        text: `${art} — love that choice. We run ${art} ${art === 'BJJ' ? '5 days a week' : '4 days a week'} across North Park, PB, La Jolla, and Hillcrest. What's your experience level?`,
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
        ? "Everyone starts there — you'll be with 4–5 other first-timers, not thrown to the wolves."
        : exp === 'Some'
          ? "Solid foundation to build on — you'll slot right into our intermediate classes."
          : "You'll fit right into advanced. Let me find the open-mat times.";
      pushBot({ kind: 'text', text: beginnerLine });

      // Objection preemption before showing slots
      if (exp === 'Beginner' && !currentMemory.objections.includes('safety')) {
        window.setTimeout(() => {
          pushBot({
            kind: 'preempt',
            text: `Before I show you slots — most beginners also quietly worry about safety. Quick heads-up: we drill technique for 3 weeks before any live sparring, and 100% of our first-timers finish their first class uninjured. Wanted to mention it up front.`,
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
          text: "If you're not in San Diego yet, I can do this two ways: travel-friendly weekend slots or a quick virtual intro first.",
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
          text: `Let's do it. Quick — what's your experience with ${newEntities.art}?`,
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
        text: `Let's do it. Quick question first — are you looking for weekdays or weekends?`,
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
        text: 'Got it. Evening or earlier in the day?',
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
        text: `${preferredTime === 'evening' ? 'Evenings' : preferredTime === 'morning' ? 'Earlier sessions' : 'Flexible timing'} — noted. Pulling matching slots now…`,
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
          text: 'Got it. Evening or earlier in the day?',
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
      pushBot({ kind: 'text', text: `${pref === 'weekend' ? 'Weekend' : pref === 'evening' ? 'Evenings' : 'Mornings'} — noted. Pulling matching slots now…` });
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
        text: `Welcome! ${currentMemory.messageCount > 0 ? 'Still here for you' : 'What brings you in today?'}`,
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
        text: `${newEntities.location} — we have a location right there. Pulling the closest slots for you now…`,
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
          text: "You sound ready. Let's lock in your trial — spots fill fast at this hour.",
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
            text: 'Want me to pull up open trial slots?',
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
          text: "Want me to walk you through options or go straight to booking a trial?",
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
      text: "Real talk — pricing depends on program and days/week. Your first class is always free, no strings. Most of our adult memberships land between what you'd spend on a decent gym plus a coffee habit.",
    });
    window.setTimeout(() => injectMicroproof('price', ents), 900);
  };

  const handleSafetyObjection = (ents: Entities) => {
    pushBot({
      kind: 'text',
      text: "100% understood. We've trained 3,000+ San Diego beginners and safety is baked into how we run the mat: no live sparring until week 3, progressive drilling, certified instructors.",
    });
    window.setTimeout(() => injectMicroproof(ents.audienceType === 'parent' ? 'kid-safety' : 'safety', ents), 900);
  };

  const handleWearObjection = (softenCta = false) => {
    pushBot({
      kind: 'text',
      text: "BJJ: gi (we have loaners) or rashguard + grappling shorts. Muay Thai: athletic shorts + t-shirt. Karate: loose clothes. Water + towel. First-timers show up in whatever — we don't judge.",
    });
    window.setTimeout(() => {
      pushBot({
        kind: 'quick-replies',
        text: softenCta ? 'Want the simple version or the schedule next?' : "Want to lock in a trial?",
        quickReplies: softenCta
          ? ['Show me the schedule', 'One more question']
          : ['Yes, book me in', "What's the schedule?"],
      });
    }, 900);
  };

  const handleTimeObjection = () => {
    pushBot({
      kind: 'text',
      text: "Totally get it — our classes run morning (6–8 AM), lunch (12 PM at select locations), evening (5–8 PM), and weekends. Most members train 2x/week and feel the difference fast. Which window fits your life?",
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
      'price':       { title: '💸 Real-member benchmarks', body: '73% of our members train 2×/week. Daily cost comes out to roughly what you\'d spend on a gym + one coffee. No contract lock-in — month-to-month.', citation: 'Internal 2025 member survey, n=412' },
      'safety':      { title: '🛡️ Safety record', body: 'Over 18 months: 0 concussions. 2 minor sprains in ~9,400 training sessions. That\'s safer than recreational basketball, statistically.', citation: 'Pacific Coast Martial Arts incident log 2024-2025' },
      'kid-safety':  { title: '👶 Kid-safety microproof', body: 'Our kids program has a 6:1 coach ratio, certified background-checked instructors, and has trained 400+ San Diego kids over the past 3 years with zero serious injuries. Parents watch every class from the benches.', citation: 'California martial arts parent survey 2024' },
      'wear':        { title: '👕 First-class dress code', body: '80% of first-timers show up in gym clothes. We have loaner gis in all sizes at the front desk. Bring water + a towel.', citation: 'First-class onboarding checklist' },
      'time':        { title: '⏱️ Typical member schedule', body: 'Most adult members train 2×/week and feel huge improvements in 6-8 weeks. You don\'t need 5 days a week to see results.', citation: 'Member progression study 2024' },
      'insurance':   { title: '📋 Coverage', body: 'All members sign a standard waiver. We carry commercial liability insurance for every mat session. Contracts are month-to-month, cancel anytime.', citation: 'Standard enrollment agreement' },
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
        text: `Perfect — Carlos will prioritize a callback. ${entities.phone ? `He has ${entities.phone} on file.` : 'If you drop your number here, I’ll attach it to the handoff immediately.'}`,
      });
      return;
    }

    if (/text is better/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `Text it is. ${entities.phone ? `Carlos will use ${entities.phone}.` : 'Drop your best mobile number and I’ll pin it to the thread.'}`,
      });
      return;
    }

    pushBot({
      kind: 'text',
      text: "No problem — I'll keep the context warm here until Carlos jumps in.",
    });
  };

  const handlePostBookingResponse = (userText: string, slot?: ScheduleSlot) => {
    if (/warm-up video/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `Queued. Demo SMS:\n“Your ${slot?.art ?? 'trial'} warm-up video is ready: pcmadojo.com/warmup/${(slot?.art ?? 'intro').toLowerCase().replace(/\s+/g, '-')}. 3 minutes, no equipment.”`,
      });
      return;
    }

    if (/parking pdf/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: `Queued. Demo SMS:\n“Parking guide for ${slot?.location ?? 'your class'}: pcmadojo.com/parking/${(slot?.location ?? 'north-park').toLowerCase().replace(/\s+/g, '-')}. Best lot + side-street backup included.”`,
      });
      return;
    }

    if (/add a friend/i.test(userText)) {
      pushBot({
        kind: 'quick-replies',
        text: "Nice. I can note a free +1 on the booking. Who are they likely to be?",
        quickReplies: ['Friend from work', 'My partner', 'My kid', 'Not sure yet'],
      });
      return;
    }

    if (/friend from work|my partner|my kid|not sure yet/i.test(userText)) {
      pushBot({
        kind: 'text',
        text: "Done — I added a referral flag to the booking so the front desk expects a +1 if they come.",
      });
      return;
    }

    pushBot({
      kind: 'text',
      text: `Perfect. Your ${slot?.day ?? 'upcoming'} class is locked and the nurture sequence stays live if you need anything before you hit the mat.`,
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
        text: "All my tailored slots are full this week — but I'll pull in a human to find you a custom fit. That's way better than forcing you into a random slot.",
      });
      triggerEscalation('No slots matched user profile — soft handoff.');
      return;
    }
    setLastOfferedSlots(matched);
    pushBot({
      kind: 'schedule',
      text: `Here are ${matched.length} slots tailored to you${ents.location ? ` (${ents.location} first)` : ''}${ents.travelMode === 'visitor' ? ' with travel-friendly timing up top' : ''}. Tap one to lock it in:`,
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
      text: `🔒 Locked in: ${slot.day} · ${slot.time} — ${slot.label} at ${slot.location}. Confirmation SMS + email dispatched. You'll get a 24h reminder, a day-of map pin with parking, and a welcome note from Sensei Carlos. Show up 15 min early.`,
      tldr,
    });

    setState(prev => ({ ...prev, bookedSlot: slot, step: 'post-booking', leadScore: 100, hotLead: true }));

    // Post-booking micro-commitment nurture loop
    window.setTimeout(() => {
      pushBot({
        kind: 'post-booking',
        text: `Quick one — while you wait for class, want me to send you a 60-second ${slot.art} warm-up video + a PDF with parking hacks for ${slot.location}?`,
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
    const summaryEntities = overrides?.ents ?? entities;
    const summaryMemory = overrides?.mem ?? memory;
    const summaryState = overrides?.convo ?? state;
    const tldr = buildHandoffSummary(summaryEntities, summaryMemory, summaryState.bookedSlot, summaryState);
    pushBot({
      kind: 'escalation',
      text: `Flagging this for Carlos (head instructor). No bots — a human will text you within the hour. If you'd rather get a callback, I can pin that to the thread right now.`,
      tldr,
    });
    pushBot({
      kind: 'quick-replies',
      text: 'Best next move?',
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
      pushHuman({
        kind: 'human-shadow',
        text: `Hey — Carlos here, head instructor. Just got flagged in. Saw your thread. ${entities.name ? entities.name + ', ' : ''}I'll text you personally in the next 30 min from (619) 555-0142. No pressure — just want to make sure you get the right info.`,
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
    const who = parts.length ? parts.join(', ') : 'new lead (minimal profile)';
    return `TL;DR: ${who}. Score ${convo.leadScore}/100. ${mem.hesitations > 0 ? 'Showed hesitation. ' : ''}${convo.hotLead ? '🔥 HOT LEAD' : ''}`;
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
    window.setTimeout(() => {
      pushBot({
        kind: 'quick-replies',
        text: `Fresh start — 👊 Welcome to Pacific Coast Martial Arts. It's ${clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')} ${clock.tzLabel} at the dojo. What brings you in?`,
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
    "Hey, I'm interested in trying a class",
    "Do you have BJJ for beginners?",
    "Is it safe for my 8 year old?",
    "How much does it cost?",
    "I'm nervous about injury",
    "Book me a trial",
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
        THE LIVE BOOKING BOT
      </h2>
      <p className="mt-3 text-dojo-gold font-mono text-xs uppercase tracking-[0.25em]">
        A behavioral conversion system. Not a chatbot.
      </p>
      <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
        Talk to it like you would a real student. Try hostile inputs. Try nervous ones. Ask for a human. Come back tomorrow and watch it remember you. This is the exact flow a prospective student hits when they DM your Instagram at 11 PM on a Saturday — when your front desk has been closed for <strong className="text-white">{minutesToHuman(frontDeskMin)}</strong>.
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
              ? `Open · honest baseline ${(frontDeskBaselineMs / 60000).toFixed(0)} min`
              : `CLOSED · reopens in ${minutesToHuman(frontDeskMin)}`}
          </span>
          <span className="text-gray-600">vs</span>
          <span className="text-dojo-gold">
            ✓ MatBoss bot: {avgResponseMs > 0 ? `${(avgResponseMs / 1000).toFixed(2)}s avg reply` : 'online now · instant'}
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
                placeholder="Try: 'Is BJJ safe for my 8 year old?' or just say hi..."
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
                    It's {clock.clock12.replace(/:\d\d (AM|PM)$/, ' $1')} {clock.tzLabel}. Your competitors' front desks reopen in {minutesToHuman(frontDeskMin)}. This bot just answered in {avgResponseMs > 0 ? `${(avgResponseMs / 1000).toFixed(2)}s` : 'under 2 seconds'}.
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
                    🔥 HOT LEAD · Silently pulling in Carlos
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={reset}
              className="w-full text-[10px] font-mono text-gray-500 hover:text-white border border-white/10 hover:border-dojo-gold/40 rounded py-2 uppercase tracking-widest transition-all"
            >
              ↻ Reset + Clear Memory
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
            <span className="ml-2 text-[10px] font-mono text-green-400 uppercase tracking-widest">Carlos is typing...</span>
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
              👤 Human · Carlos (Head Instructor) · Shadow Mode
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
              ✓ Booking Confirmed
            </div>
            <div className="text-sm text-white leading-relaxed">{message.text}</div>
            {message.tldr && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-1">Handoff summary → owner dashboard</div>
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
              ✦ Returning visitor detected
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
          <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-2">📊 Microproof</div>
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
          <div className="text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-2">🎯 Preempt</div>
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
          <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">💙 Empathy beat</div>
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
            <div className="text-[9px] font-mono text-dojo-gold uppercase tracking-widest mb-2">❓ Clarification ladder</div>
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
              ⚡ Flagged for human handoff
            </div>
            <div className="text-sm text-white leading-relaxed">{message.text}</div>
            {message.tldr && (
              <div className="mt-3 pt-3 border-t border-dojo-gold/20">
                <div className="text-[9px] font-mono text-dojo-red uppercase tracking-widest mb-1">Sent to Carlos's inbox</div>
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
              ✨ Post-booking nurture
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
            {highlighted && <span className="text-[8px] font-mono text-dojo-gold uppercase tracking-widest">◆ Best match</span>}
          </div>
          <div className="text-[11px] text-gray-400">{slot.label} · {slot.location}</div>
          <div className="mt-2 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest flex-wrap">
            {scarcity && (
              <span className="text-dojo-red animate-pulse">🔥 {slot.spotsLeft} left</span>
            )}
            {!scarcity && slot.spotsLeft > 0 && (
              <span className="text-gray-500">{slot.spotsLeft} spots</span>
            )}
            <span className="text-gray-600">{slot.viewers} viewing</span>
            <span className="text-green-500">{slot.recentSignups} booked this week</span>
          </div>
        </div>
        <div className="text-dojo-gold font-mono text-[9px] whitespace-nowrap">
          {slot.spotsLeft === 0 ? 'FULL' : 'TAP →'}
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
