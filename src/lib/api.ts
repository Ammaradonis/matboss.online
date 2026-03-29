import type { TimeSlot, BookingFormData, BookingConfirmation } from '../types';

const API_BASE = '/.netlify/functions';

// Fallback: generate slots client-side when backend is unavailable
function generateFallbackSlots(year: number, month: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let id = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Skip past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) continue;

    // Weekdays: 7-9 AM and 5-8 PM
    if (dow >= 1 && dow <= 5) {
      for (let h = 7; h < 9; h++) {
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00`,
          end_time: `${String(h).padStart(2, '0')}:30`,
          is_booked: Math.random() > 0.75,
        });
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:30`,
          end_time: `${String(h + 1).padStart(2, '0')}:00`,
          is_booked: Math.random() > 0.75,
        });
      }
      for (let h = 17; h < 20; h++) {
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00`,
          end_time: `${String(h).padStart(2, '0')}:30`,
          is_booked: Math.random() > 0.7,
        });
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:30`,
          end_time: `${String(h + 1).padStart(2, '0')}:00`,
          is_booked: Math.random() > 0.7,
        });
      }
    }
    // Saturday: 8-11 AM
    else if (dow === 6) {
      for (let h = 8; h < 11; h++) {
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00`,
          end_time: `${String(h).padStart(2, '0')}:30`,
          is_booked: Math.random() > 0.65,
        });
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:30`,
          end_time: `${String(h + 1).padStart(2, '0')}:00`,
          is_booked: Math.random() > 0.65,
        });
      }
    }
    // Sunday: 9-11 AM
    else if (dow === 0) {
      for (let h = 9; h < 11; h++) {
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00`,
          end_time: `${String(h).padStart(2, '0')}:30`,
          is_booked: Math.random() > 0.6,
        });
        slots.push({
          id: id++,
          slot_date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:30`,
          end_time: `${String(h + 1).padStart(2, '0')}:00`,
          is_booked: Math.random() > 0.6,
        });
      }
    }
  }

  return slots;
}

export async function fetchAvailability(year: number, month: number): Promise<TimeSlot[]> {
  try {
    const res = await fetch(`${API_BASE}/get-availability?year=${year}&month=${month + 1}`);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    return data.slots;
  } catch {
    return generateFallbackSlots(year, month);
  }
}

export async function bookSlot(
  slot: TimeSlot,
  formData: BookingFormData,
  timezone: string
): Promise<BookingConfirmation> {
  try {
    const res = await fetch(`${API_BASE}/book-slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slot.id, ...formData, timezone }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Booking failed');
    }

    const confirmation: BookingConfirmation = await res.json();
    sendToWebhook(formData, confirmation, slot);
    return confirmation;
  } catch (err) {
    // Fallback: generate a confirmation locally for demo purposes
    const dateStr = slot.slot_date.replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    const confirmation: BookingConfirmation = {
      booking_id: `MAT-${dateStr}-${rand}`,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      owner_name: formData.owner_name,
      school_name: formData.school_name,
      email: formData.email,
    };
    sendToWebhook(formData, confirmation, slot);
    return confirmation;
  }
}

const WEBHOOK_URL = 'https://hook.eu1.make.com/yibfibqog07hbmut2jizf71k9u1jsqxy';

function toSanDiegoTimestamp(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`;
}

function sendToWebhook(
  formData: BookingFormData,
  confirmation: BookingConfirmation,
  slot: TimeSlot,
): void {
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_id: confirmation.booking_id,
      school_name: formData.school_name,
      owner_name: formData.owner_name,
      email: formData.email,
      phone: formData.phone,
      num_students: formData.num_students,
      current_software: formData.current_software,
      website: formData.website || '',
      monthly_trial_volume: formData.monthly_trial_volume || 0,
      biggest_challenge: formData.biggest_challenge || '',
      slot_date: toSanDiegoTimestamp(slot.slot_date, '00:00'),
      start_time: toSanDiegoTimestamp(slot.slot_date, slot.start_time),
      end_time: toSanDiegoTimestamp(slot.slot_date, slot.end_time),
      timezone: 'Pacific',
    }),
  }).catch(() => {});
}

export const SD_TIMEZONE = 'America/Los_Angeles';

export function detectTimezone(): string {
  return SD_TIMEZONE;
}

export function formatTimeForDisplay(time24: string, timezone: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}
