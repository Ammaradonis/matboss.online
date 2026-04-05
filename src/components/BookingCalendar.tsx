import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { TimeSlot, CalendarDay } from '../types';
import { fetchAvailability, formatTimeForDisplay, detectTimezone } from '../lib/api';
import { filterBookableSlots, getSanDiegoDateObject } from '../lib/bookingRules';
import BookingModal from './BookingModal';
import BookingSuccess from './BookingSuccess';
import type { BookingConfirmation } from '../types';

const DAYS = [
  { mobile: 'MO', desktop: 'MON' },
  { mobile: 'TU', desktop: 'TUE' },
  { mobile: 'WE', desktop: 'WED' },
  { mobile: 'TH', desktop: 'THU' },
  { mobile: 'FR', desktop: 'FRI' },
  { mobile: 'SA', desktop: 'SAT' },
  { mobile: 'SU', desktop: 'SUN' },
];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(() => getSanDiegoDateObject());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [now, setNow] = useState(() => new Date());
  const selectedTimesRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const bookableSlots = useMemo(() => filterBookableSlots(slots, now), [slots, now]);

  useEffect(() => {
    if (!selectedSlot) return;

    const stillBookable = bookableSlots.some((slot) => slot.id === selectedSlot.id);
    if (stillBookable) return;

    setSelectedSlot(null);
    setShowModal(false);
  }, [bookableSlots, selectedSlot]);

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

    const today = getSanDiegoDateObject(now);
    today.setHours(0, 0, 0, 0);

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = formatDateStr(d);
      const daySlots = bookableSlots.filter((s) => s.slot_date === dateStr);
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
  }, [year, month, bookableSlots, now]);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return bookableSlots.filter((s) => s.slot_date === selectedDate);
  }, [selectedDate, bookableSlots]);

  useEffect(() => {
    if (!selectedDate || typeof window === 'undefined' || window.innerWidth >= 640) return;

    const timeoutId = window.setTimeout(() => {
      selectedTimesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [selectedDate]);

  function formatDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function navigateMonth(delta: number) {
    const maxDate = getSanDiegoDateObject(now);
    maxDate.setDate(maxDate.getDate() + 91);

    const newDate = new Date(year, month + delta, 1);
    const today = getSanDiegoDateObject(now);
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
    <div id="booking" className="w-full max-w-lg mx-auto scroll-mt-32">
      {/* Calendar Card */}
      <div className="bg-dojo-dark/80 backdrop-blur-sm border border-dojo-red/20 rounded-[1.75rem] p-4 sm:p-5 md:p-6 red-glow">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-gray-400 hover:text-white hover:bg-dojo-red/20
                       transition-all duration-200"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-base sm:text-lg md:text-xl font-heading tracking-wider text-white">
            {MONTH_NAMES[month]} {year}
          </h3>

          <button
            onClick={() => navigateMonth(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-gray-400 hover:text-white hover:bg-dojo-red/20
                       transition-all duration-200"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-center text-[11px] leading-relaxed text-gray-500 sm:text-xs">
          Tap any highlighted date to reveal the available Pacific Time booking windows.
        </p>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 sm:gap-1">
          {DAYS.map((day) => (
            <div
              key={day.desktop}
              className="py-1 text-center text-[10px] font-semibold text-gray-500 sm:text-xs"
            >
              <span className="sm:hidden">{day.mobile}</span>
              <span className="hidden sm:inline">{day.desktop}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-1">
          {loading
            ? Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="flex aspect-square items-center justify-center">
                  <div className="h-8 w-8 rounded-xl bg-dojo-carbon animate-pulse sm:h-9 sm:w-9" />
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
                  <div key={i} className="flex aspect-square items-center justify-center">
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
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeWidth="1.5" d="M12 6v6l4 2" />
          </svg>
          <span>
            San Diego, CA — Pacific Time ({now.toLocaleTimeString('en-US', {
              timeZone: timezone,
              hour: '2-digit',
              minute: '2-digit',
            })})
          </span>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div id="booking-times" ref={selectedTimesRef} className="mt-4 animate-fade-in scroll-mt-32">
          <div className="bg-dojo-dark/60 backdrop-blur-sm border border-dojo-red/10 rounded-2xl p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-400 font-medium">
                Available times for{' '}
                <span className="text-white">{formattedSelectedDate}</span>
              </p>
              <span className="inline-flex w-fit items-center rounded-full border border-dojo-red/20 bg-dojo-red/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-dojo-red">
                {selectedDateSlots.length} {selectedDateSlots.length === 1 ? 'slot' : 'slots'} open
              </span>
            </div>

            {selectedDateSlots.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No available slots for this date.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
