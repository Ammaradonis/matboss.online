import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TimeSlot, CalendarDay } from '../types';
import { fetchAvailability, formatTimeForDisplay, detectTimezone } from '../lib/api';
import BookingModal from './BookingModal';
import BookingSuccess from './BookingSuccess';
import type { BookingConfirmation } from '../types';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const timezone = useMemo(() => detectTimezone(), []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const data = await fetchAvailability(year, month);
    setSlots(data);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Build calendar grid
  const calendarDays: CalendarDay[] = useMemo(() => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // getDay() returns 0 for Sunday. We want Monday=0.
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLast - i);
      days.push({
        date: d,
        dateStr: formatDateStr(d),
        isCurrentMonth: false,
        isToday: false,
        hasSlots: false,
        slotCount: 0,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = formatDateStr(d);
      const daySlots = slots.filter((s) => s.slot_date === dateStr && !s.is_booked);
      const isToday = d.getTime() === today.getTime();

      days.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
        hasSlots: daySlots.length > 0 && d >= today,
        slotCount: daySlots.length,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: formatDateStr(d),
        isCurrentMonth: false,
        isToday: false,
        hasSlots: false,
        slotCount: 0,
      });
    }

    return days;
  }, [year, month, slots]);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter((s) => s.slot_date === selectedDate && !s.is_booked);
  }, [selectedDate, slots]);

  function formatDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function navigateMonth(delta: number) {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 91);

    const newDate = new Date(year, month + delta, 1);
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);

    if (newDate < today) return;
    if (newDate > maxDate) return;

    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  function handleDayClick(day: CalendarDay) {
    if (!day.isCurrentMonth || !day.hasSlots) return;
    setSelectedDate(day.dateStr);
    setSelectedSlot(null);
  }

  function handleSlotClick(slot: TimeSlot) {
    setSelectedSlot(slot);
    setShowModal(true);
  }

  function handleBookingComplete(conf: BookingConfirmation) {
    setShowModal(false);
    setConfirmation(conf);
  }

  if (confirmation) {
    return <BookingSuccess confirmation={confirmation} onReset={() => setConfirmation(null)} />;
  }

  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div id="booking" className="w-full max-w-lg mx-auto">
      {/* Calendar Card */}
      <div className="bg-dojo-dark/80 backdrop-blur-sm border border-dojo-red/20 rounded-2xl p-5 md:p-6 red-glow">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       text-gray-400 hover:text-white hover:bg-dojo-red/20
                       transition-all duration-200"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-lg md:text-xl font-heading tracking-wider text-white">
            {MONTH_NAMES[month]} {year}
          </h3>

          <button
            onClick={() => navigateMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       text-gray-400 hover:text-white hover:bg-dojo-red/20
                       transition-all duration-200"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {loading
            ? Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center h-10">
                  <div className="w-8 h-8 rounded-full bg-dojo-carbon animate-pulse" />
                </div>
              ))
            : calendarDays.map((day, i) => {
                const isSelected = day.dateStr === selectedDate;

                let cls = 'calendar-day';
                if (!day.isCurrentMonth) cls += ' other-month';
                else if (day.hasSlots) cls += ' available';
                else cls += ' unavailable';
                if (isSelected) cls += ' selected';
                if (day.isToday) cls += ' today';

                return (
                  <div key={i} className="flex items-center justify-center h-10">
                    <button
                      className={cls}
                      onClick={() => handleDayClick(day)}
                      disabled={!day.isCurrentMonth || !day.hasSlots}
                      aria-label={`${day.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}${day.hasSlots ? `, ${day.slotCount} slots available` : ', unavailable'}`}
                    >
                      {day.date.getDate()}
                    </button>
                  </div>
                );
              })}
        </div>

        {/* Timezone */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeWidth="1.5" d="M12 6v6l4 2" />
          </svg>
          <span>
            San Diego, CA — Pacific Time ({new Date().toLocaleTimeString('en-US', {
              timeZone: timezone,
              hour: '2-digit',
              minute: '2-digit',
            })})
          </span>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mt-4 animate-fade-in">
          <div className="bg-dojo-dark/60 backdrop-blur-sm border border-dojo-red/10 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-3 font-medium">
              Available times for{' '}
              <span className="text-white">{formattedSelectedDate}</span>
            </p>

            {selectedDateSlots.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No available slots for this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedDateSlots.map((slot) => (
                  <button
                    key={slot.id}
                    className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {formatTimeForDisplay(slot.start_time, timezone)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showModal && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          timezone={timezone}
          onClose={() => setShowModal(false)}
          onComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
