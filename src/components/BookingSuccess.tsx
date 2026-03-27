import type { BookingConfirmation } from '../types';

interface Props {
  confirmation: BookingConfirmation;
  onReset: () => void;
}

export default function BookingSuccess({ confirmation, onReset }: Props) {
  const dateDisplay = new Date(confirmation.slot_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Generate .ics calendar content
  function downloadCalendarInvite() {
    const startDate = confirmation.slot_date.replace(/-/g, '');
    const startTime = confirmation.start_time.replace(':', '') + '00';
    const endTime = confirmation.end_time.replace(':', '') + '00';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MatBoss//Enrollment Diagnosis//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}T${startTime}`,
      `DTEND:${startDate}T${endTime}`,
      `SUMMARY:MatBoss Leakage Diagnosis — ${confirmation.school_name}`,
      `DESCRIPTION:Enrollment Leakage Diagnosis Call with Ammar Alkheder\\nBooking ID: ${confirmation.booking_id}\\nSchool: ${confirmation.school_name}`,
      'LOCATION:Zoom (link will be emailed)',
      `ORGANIZER:mailto:alkhederammar147@gmail.com`,
      `ATTENDEE:mailto:${confirmation.email}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matboss-diagnosis-${confirmation.booking_id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="bg-dojo-dark/80 backdrop-blur-sm border border-dojo-gold/30 rounded-2xl p-6 md:p-8 gold-glow text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dojo-gold/10 border-2 border-dojo-gold flex items-center justify-center">
          <svg className="w-8 h-8 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="font-heading text-2xl md:text-3xl tracking-wider text-white mb-2">
          You're Locked In.
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Your Leakage Diagnosis Call is confirmed, {confirmation.owner_name}.
        </p>

        {/* Booking Details */}
        <div className="bg-dojo-black/50 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Booking ID</span>
            <span className="font-mono text-sm text-dojo-gold font-bold">{confirmation.booking_id}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
            <span className="text-sm text-white">{dateDisplay}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">School</span>
            <span className="text-sm text-white">{confirmation.school_name}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Confirmation Sent To</span>
            <span className="text-sm text-white">{confirmation.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadCalendarInvite}
            className="flex-1 py-3 rounded-lg bg-dojo-gold/10 border border-dojo-gold/30
                       text-dojo-gold font-heading tracking-wider text-sm
                       hover:bg-dojo-gold/20 transition-all duration-200"
          >
            Download Calendar Invite
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10
                       text-gray-400 font-heading tracking-wider text-sm
                       hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            Book Another Slot
          </button>
        </div>

        <p className="text-[10px] text-gray-600 mt-4">
          Save your Booking ID: <strong className="text-gray-400">{confirmation.booking_id}</strong>
          — you'll need it if you reschedule.
        </p>
      </div>
    </div>
  );
}
