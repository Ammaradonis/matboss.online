import type { Context } from '@netlify/functions';
import pool from './db';
import { isSlotBookable, SLOT_POLICY_ERROR } from '../../src/lib/bookingRules';

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
      website,
      monthly_trial_volume,
      biggest_challenge,
      timezone,
    } = body;

    // Validate required fields
    if (!slot_id || !school_name || !owner_name || !email || !phone || !num_students || !current_software) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check slot is still available
      const slotResult = await client.query(
        'SELECT id, slot_date::text, start_time::text, end_time::text, is_booked FROM availability WHERE id = $1 FOR UPDATE',
        [slot_id]
      );

      if (slotResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return new Response(
          JSON.stringify({ error: 'Slot not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const slot = slotResult.rows[0];

      if (slot.is_booked) {
        await client.query('ROLLBACK');
        return new Response(
          JSON.stringify({ error: 'Slot is no longer available. Please choose another time.' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!isSlotBookable(slot)) {
        await client.query('ROLLBACK');
        return new Response(
          JSON.stringify({ error: SLOT_POLICY_ERROR }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Generate booking ID: MAT-YYYYMMDD-XXXX
      const dateStr = slot.slot_date.replace(/-/g, '');
      const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const bookingId = `MAT-${dateStr}-${rand}`;

      // Mark slot as booked
      await client.query(
        'UPDATE availability SET is_booked = TRUE WHERE id = $1',
        [slot_id]
      );

      // Insert booking
      await client.query(
        `INSERT INTO bookings (
          booking_id, slot_id, school_name, owner_name, email, phone,
          num_students, current_software, website, monthly_trial_volume,
          biggest_challenge, timezone
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          bookingId, slot_id, school_name, owner_name, email, phone,
          num_students, current_software, website || null,
          monthly_trial_volume || null, biggest_challenge || null,
          timezone || 'America/Los_Angeles',
        ]
      );

      await client.query('COMMIT');

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
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Booking error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Booking failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
