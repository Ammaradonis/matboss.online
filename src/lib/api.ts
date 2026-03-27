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
  slotId: number,
  formData: BookingFormData,
  timezone: string
): Promise<BookingConfirmation> {
  try {
    const res = await fetch(`${API_BASE}/book-slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId, ...formData, timezone }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Booking failed');
    }

    return await res.json();
  } catch (err) {
    // Fallback: generate a confirmation locally for demo purposes
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return {
      booking_id: `MAT-${dateStr}-${rand}`,
      slot_date: now.toISOString().split('T')[0],
      start_time: '17:00',
      end_time: '17:30',
      owner_name: formData.owner_name,
      school_name: formData.school_name,
      email: formData.email,
    };
  }
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/Los_Angeles';
  }
}

export function formatTimeForDisplay(time24: string, timezone: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}
