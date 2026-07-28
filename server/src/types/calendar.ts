export type DayStatus = "BOOKED" | "BLOCKED" | "AVAILABLE";

export interface CalendarDay {
  date: string;  
  status: DayStatus;
  nightlyRate: number;
  isOverride: boolean;
  bookingId: number | null;
  guestName: string | null;
}
