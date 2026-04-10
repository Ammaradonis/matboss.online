import type { Context } from '@netlify/functions';
import { isSlotBookable, SLOT_POLICY_ERROR } from '../../src/lib/bookingRules';
import { findSlotById } from './slotGenerator';

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const {
      slot_id,
      school_name,
      owner_name,
      email,
      phone,
      num_students,
      current_software,
    } = body;

    if (
      !slot_id ||
      !school_name ||
      !owner_name ||
      !email ||
      !phone ||
      !num_students ||
      !current_software
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slot = findSlotById(Number(slot_id));
    if (!slot) {
      return new Response(
        JSON.stringify({ error: 'Slot not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isSlotBookable(slot)) {
      return new Response(
        JSON.stringify({ error: SLOT_POLICY_ERROR }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const dateStr = slot.slot_date.replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const bookingId = `MAT-${dateStr}-${rand}`;

    return new Response(
      JSON.stringify({
        booking_id: bookingId,
        slot_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        owner_name,
        school_name,
        email,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Booking error:', err?.message || err);
    return new Response(
      JSON.stringify({ error: 'Booking failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
