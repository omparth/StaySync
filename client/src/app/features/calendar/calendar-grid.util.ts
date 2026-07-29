import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function buildMonthGrid(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function chunkIntoWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function firstGridDay(anchor: Date): Date {
  return buildMonthGrid(anchor)[0];
}

export function lastGridDay(anchor: Date): Date {
  const grid = buildMonthGrid(anchor);
  return grid[grid.length - 1];
}

export function addDaysSafe(date: Date, amount: number): Date {
  return addDays(date, amount);
}
