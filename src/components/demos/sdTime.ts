import { useEffect, useState } from 'react';

export const SD_TZ = 'America/Los_Angeles';

export interface SDNow {
  iso: string;         // 2026-04-11T14:32:05-07:00
  hhmmss: string;      // 14:32:05
  hhmm: string;        // 14:32
  clock12: string;     // 2:32:05 PM
  dayOfWeek: string;   // Saturday
  shortDate: string;   // Apr 11
  fullDate: string;    // Saturday, April 11, 2026
  hour24: number;      // 14
  minute: number;      // 32
  weekdayIdx: number;  // 0=Sun..6=Sat
  tzLabel: string;     // PDT / PST
  frontDeskOpen: boolean;
  minutesUntilFrontDeskOpen: number; // 0 if currently open
  isWeekend: boolean;
}

function parts(date: Date): SDNow {
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: SD_TZ, ...opts });

  const pieces = fmt({
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, weekday: 'long', timeZoneName: 'short',
  }).formatToParts(date);

  const get = (type: string) => pieces.find(p => p.type === type)?.value ?? '';

  const hour24 = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  const second = Number(get('second'));
  const weekday = get('weekday');
  const tzLabel = get('timeZoneName') || 'PT';

  const weekdayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const weekdayIdx = weekdayMap[weekday] ?? 0;
  const isWeekend = weekdayIdx === 0 || weekdayIdx === 6;

  // Front desk: Mon-Fri 9AM-8PM, Sat 9AM-4PM, Sun closed
  const openHour = 9;
  const closeHour = weekdayIdx === 6 ? 16 : weekdayIdx === 0 ? -1 : 20;
  const frontDeskOpen = closeHour > 0 && hour24 >= openHour && hour24 < closeHour;

  // Compute minutes until next open
  let minutesUntilOpen = 0;
  if (!frontDeskOpen) {
    // Build minutes-of-week offset
    const nowOfWeekMin = weekdayIdx * 24 * 60 + hour24 * 60 + minute;
    // Next opening slot loop up to 7 days
    for (let addDays = 0; addDays <= 7; addDays++) {
      const testDayIdx = (weekdayIdx + addDays) % 7;
      if (testDayIdx === 0) continue; // Sun closed
      const testOpenHour = 9;
      const testOfWeekMin = ((weekdayIdx + addDays) % 7) * 24 * 60 + testOpenHour * 60;
      const candidate = addDays === 0
        ? (hour24 < openHour ? testOfWeekMin - nowOfWeekMin : null)
        : (weekdayIdx + addDays) * 24 * 60 + testOpenHour * 60 - nowOfWeekMin;
      if (candidate !== null && candidate > 0) {
        minutesUntilOpen = candidate;
        break;
      }
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const hhmmss = `${pad(hour24)}:${pad(minute)}:${pad(second)}`;
  const hhmm = `${pad(hour24)}:${pad(minute)}`;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const h12 = ((hour24 + 11) % 12) + 1;
  const clock12 = `${h12}:${pad(minute)}:${pad(second)} ${period}`;

  const shortDate = new Intl.DateTimeFormat('en-US', {
    timeZone: SD_TZ, month: 'short', day: 'numeric',
  }).format(date);

  const fullDate = new Intl.DateTimeFormat('en-US', {
    timeZone: SD_TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(date);

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const approxUtc = new Date(Date.UTC(year, month - 1, day, hour24, minute, second));
  const offsetMs = approxUtc.getTime() - date.getTime();
  const offsetMin = -Math.round(offsetMs / 60000);
  const offsetH = Math.trunc(offsetMin / 60);
  const offsetM = Math.abs(offsetMin % 60);
  const offsetStr = `${offsetH >= 0 ? '+' : '-'}${pad(Math.abs(offsetH))}:${pad(offsetM)}`;
  const iso = `${year}-${pad(month)}-${pad(day)}T${hhmmss}${offsetStr}`;

  return {
    iso, hhmmss, hhmm, clock12, dayOfWeek: weekday, shortDate, fullDate,
    hour24, minute, weekdayIdx, tzLabel, frontDeskOpen, minutesUntilFrontDeskOpen: minutesUntilOpen,
    isWeekend,
  };
}

export function sdNow(): SDNow {
  return parts(new Date());
}

export function formatSDTimestamp(d: Date = new Date()): string {
  const p = parts(d);
  return `${p.hhmmss} ${p.tzLabel}`;
}

export function formatSDClockDate(d: Date = new Date()): string {
  const p = parts(d);
  return `${p.fullDate} · ${p.clock12} ${p.tzLabel}`;
}

export function minutesToHuman(mins: number): string {
  if (mins <= 0) return 'now';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

/** Reactive clock hook — updates every `tickMs` ms. */
export function useSanDiegoClock(tickMs = 1000): SDNow {
  const [now, setNow] = useState<SDNow>(() => sdNow());
  useEffect(() => {
    const iv = setInterval(() => setNow(sdNow()), tickMs);
    return () => clearInterval(iv);
  }, [tickMs]);
  return now;
}
