export type DayStatus = 'BOOKED' | 'BLOCKED' | 'AVAILABLE';
export type BookingSource = 'MANUAL' | 'CHANNEL';
export type BookingStatus = 'ACTIVE' | 'CANCELLED';

export interface Property {
  id: number;
  name: string;
  baseRate: number;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  status: DayStatus;
  nightlyRate: number;
  isOverride: boolean;
  bookingId: number | null;
  guestName: string | null;
}

export interface CalendarResponse {
  start: string;
  end: string;
  days: CalendarDay[];
}

export interface Booking {
  id: number;
  externalId: string | null;
  guestName: string;
  checkIn: string;
  checkOut: string;
  source: BookingSource;
  status: BookingStatus;
  createdAt: string;
}

export interface ImportResultRow {
  externalId: string;
  guest: string;
  outcome: 'IMPORTED' | 'CANCELLED' | 'DUPLICATE' | 'CONFLICT';
  reason?: string;
}

export interface ImportSummary {
  totalProcessed: number;
  imported: number;
  cancelled: number;
  duplicate: number;
  conflict: number;
  results: ImportResultRow[];
}

export interface DateRangeSelection {
  start: string;
  end: string;
}

export interface ApiErrorPayload {
  error: string;
  message: string;
  details?: unknown;
}
