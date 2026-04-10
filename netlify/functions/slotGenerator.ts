import type { TimeSlot } from '../../src/types';
import rawConfig from '../../availability-config.json';

interface Block {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  blocks: Block[];
}

interface AvailabilityConfig {
  timezone: string;
  slot_duration_minutes: number;
  booking_window_days: number;
  weekly_schedule: Record<string, DaySchedule>;
  blackout_dates: string[];
}

const config = rawConfig as unknown as AvailabilityConfig;

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Deterministic numeric ID: YYYYMMDDHHMM (e.g., 2026-04-15 17:30 → 202604151730)
// Stays well under Number.MAX_SAFE_INTEGER, decodable back to date + time.
export function encodeSlotId(dateStr: string, startTime: string): number {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = startTime.split(':').map(Number);
  return y * 100000000 + mo * 1000000 + d * 10000 + h * 100 + mi;
}

export function decodeSlotId(
  id: number
): { dateStr: string; startTime: string } | null {
  if (!Number.isInteger(id) || id < 202001010000 || id > 209912312359) {
    return null;
  }
  const mi = id % 100;
  const h = Math.floor(id / 100) % 100;
  const d = Math.floor(id / 10000) % 100;
  const mo = Math.floor(id / 1000000) % 100;
  const y = Math.floor(id / 100000000);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const dateStr = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const startTime = `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
  return { dateStr, startTime };
}

export function generateSlotsForMonth(year: number, month: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const blackout = new Set(config.blackout_dates);
  const duration = config.slot_duration_minutes;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (blackout.has(dateStr)) continue;

    const dow = new Date(year, month - 1, day).getDay();
    const daySchedule = config.weekly_schedule[DAY_KEYS[dow]];
    if (!daySchedule || !daySchedule.enabled) continue;

    for (const block of daySchedule.blocks) {
      const startMin = timeToMinutes(block.start);
      const endMin = timeToMinutes(block.end);
      for (let m = startMin; m + duration <= endMin; m += duration) {
        const startTime = minutesToTime(m);
        const endTime = minutesToTime(m + duration);
        slots.push({
          id: encodeSlotId(dateStr, startTime),
          slot_date: dateStr,
          start_time: startTime,
          end_time: endTime,
          is_booked: false,
        });
      }
    }
  }
  return slots;
}

export function findSlotById(id: number): TimeSlot | null {
  const decoded = decodeSlotId(id);
  if (!decoded) return null;

  const { dateStr, startTime } = decoded;
  if (config.blackout_dates.includes(dateStr)) return null;

  const [y, mo, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, mo - 1, d).getDay();
  const daySchedule = config.weekly_schedule[DAY_KEYS[dow]];
  if (!daySchedule || !daySchedule.enabled) return null;

  const duration = config.slot_duration_minutes;
  const startMin = timeToMinutes(startTime);

  const inBlock = daySchedule.blocks.some((block) => {
    const bStart = timeToMinutes(block.start);
    const bEnd = timeToMinutes(block.end);
    return (
      startMin >= bStart &&
      startMin + duration <= bEnd &&
      (startMin - bStart) % duration === 0
    );
  });
  if (!inBlock) return null;

  return {
    id,
    slot_date: dateStr,
    start_time: startTime,
    end_time: minutesToTime(startMin + duration),
    is_booked: false,
  };
}
