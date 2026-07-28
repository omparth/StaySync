import { getDay } from "date-fns";


const WEEKEND_SURCHARGE = 0.25;
const DECEMBER_SURCHARGE = 0.2;

export function isWeekendNight(date: Date): boolean {
  const day = getDay(date); 
  return day === 0 || day === 5 || day === 6;
}

export function isDecemberNight(date: Date): boolean {
  return date.getUTCMonth() === 11; 
}

export function computeDynamicRate(baseRate: number, date: Date): number {
  let rate = baseRate;
  if (isWeekendNight(date)) rate += baseRate * WEEKEND_SURCHARGE;
  if (isDecemberNight(date)) rate += baseRate * DECEMBER_SURCHARGE;
  return roundCurrency(rate);
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
