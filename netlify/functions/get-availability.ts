import type { Context } from '@netlify/functions';
import { filterBookableSlots } from '../../src/lib/bookingRules';
import { generateSlotsForMonth } from './slotGenerator';

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
    const slots = generateSlotsForMonth(year, month);
    return new Response(
      JSON.stringify({ slots: filterBookableSlots(slots) }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (err: any) {
    console.error('Error generating availability:', err?.message || err);
    return new Response(
      JSON.stringify({ error: 'Failed to generate availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
