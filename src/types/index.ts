export interface TimeSlot {
  id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface BookingFormData {
  school_name: string;
  owner_name: string;
  email: string;
  phone: string;
  num_students: number;
  current_software: string;
  website?: string;
  monthly_trial_volume?: number;
  biggest_challenge?: string;
}

export interface BookingConfirmation {
  booking_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  owner_name: string;
  school_name: string;
  email: string;
}

export interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasSlots: boolean;
  slotCount: number;
}
