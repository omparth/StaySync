import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";

export function parseDateOnly(value: string): Date {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    throw new Error(`Invalid date: ${value}`);
  }
  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
}

export function formatDateOnly(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function getOccupiedNights(checkIn: Date, checkOut: Date): Date[] {
  const nights = differenceInCalendarDays(checkOut, checkIn);
  const result: Date[] = [];
  for (let i = 0; i < nights; i++) {
    result.push(addDays(checkIn, i));
  }
  return result;
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

export function getDateRangeInclusive(start: Date, end: Date): Date[] {
  const days = differenceInCalendarDays(end, start);
  const result: Date[] = [];
  for (let i = 0; i <= days; i++) {
    result.push(addDays(start, i));
  }
  return result;
}

export function isSameOrBefore(a: Date, b: Date): boolean {
  return a.getTime() <= b.getTime();
}
