import type { Context } from '@netlify/functions';
import pool from './db';
import { filterBookableSlots } from '../../src/lib/bookingRules';

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get('year') || '');
  const month = parseInt(url.searchParams.get('month') || '');

  if (!year || !month || month < 1 || month > 12) {
    return new Response(
      JSON.stringify({ error: 'Invalid year or month parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const result = await pool.query(
      `SELECT id, slot_date::text, start_time::text, end_time::text, is_booked
       FROM availability
       WHERE slot_date >= $1 AND slot_date < $2
       ORDER BY slot_date, start_time`,
      [startDate, endDate]
    );

    return new Response(
      JSON.stringify({ slots: filterBookableSlots(result.rows) }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (err: any) {
    console.error('DB error fetching availability:', err.message);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
