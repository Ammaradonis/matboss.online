import type { TimeSlot } from '../types';

export const SD_TIMEZONE = 'America/Los_Angeles';
export const MIN_BOOKING_LEAD_HOURS = 12;
export const MIN_BOOKING_LEAD_MS = MIN_BOOKING_LEAD_HOURS * 60 * 60 * 1000;
export const SLOT_POLICY_ERROR =
  `Time slots must be booked at least ${MIN_BOOKING_LEAD_HOURS} hours in advance. Please choose a later time.`;

type SlotLike = Pick<TimeSlot, 'slot_date' | 'start_time' | 'is_booked'>;

interface SanDiegoDateTimeParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

const sanDiegoDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SD_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getSanDiegoDateTimeParts(date = new Date()): SanDiegoDateTimeParts {
  const parts: Partial<SanDiegoDateTimeParts> = {};

  for (const part of sanDiegoDateTimeFormatter.formatToParts(date)) {
    if (
      part.type === 'year' ||
      part.type === 'month' ||
      part.type === 'day' ||
      part.type === 'hour' ||
      part.type === 'minute' ||
      part.type === 'second'
    ) {
      parts[part.type] = part.value;
    }
  }

  return {
    year: parts.year ?? '0000',
    month: parts.month ?? '01',
    day: parts.day ?? '01',
    hour: parts.hour ?? '00',
    minute: parts.minute ?? '00',
    second: parts.second ?? '00',
  };
}

function normalizeTime(time: string): string {
  const [hour = '00', minute = '00', second = '00'] = time.split(':');
  return [hour, minute, second].map((segment) => segment.padStart(2, '0').slice(-2)).join(':');
}

export function formatSanDiegoLocalDateTime(date = new Date()): string {
  const parts = getSanDiegoDateTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function getSanDiegoDateObject(date = new Date()): Date {
  const parts = getSanDiegoDateTimeParts(date);
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

export function getBookingCutoffLocalDateTime(now = new Date()): string {
  return formatSanDiegoLocalDateTime(new Date(now.getTime() + MIN_BOOKING_LEAD_MS));
}

export function getSlotStartLocalDateTime(slot: Pick<TimeSlot, 'slot_date' | 'start_time'>): string {
  return `${slot.slot_date}T${normalizeTime(slot.start_time)}`;
}

export function isSlotBookable(slot: SlotLike, now = new Date()): boolean {
  if (slot.is_booked) {
    return false;
  }

  return getSlotStartLocalDateTime(slot) >= getBookingCutoffLocalDateTime(now);
}

export function filterBookableSlots<T extends SlotLike>(slots: T[], now = new Date()): T[] {
  return slots.filter((slot) => isSlotBookable(slot, now));
}
