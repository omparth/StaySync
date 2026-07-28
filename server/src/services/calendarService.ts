import { addDays } from "date-fns";
import { getTheProperty } from "../repositories/propertyRepository";
import { findOverridesOverlapping } from "../repositories/rateRepository";
import { findBlocksOverlapping } from "../repositories/blockRepository";
import { findActiveBookingsOverlapping } from "../repositories/bookingRepository";
import { formatDateOnly, getDateRangeInclusive } from "../utils/dateUtils";
import { computeDynamicRate, roundCurrency } from "../utils/pricing";
import { CalendarDay } from "../types/calendar";

export async function getCalendar(start: Date, end: Date): Promise<CalendarDay[]> {
  const property = await getTheProperty();

  const queryEnd = addDays(end, 1);

  const [overrides, blocks, bookings] = await Promise.all([
    findOverridesOverlapping(property.id, start, queryEnd),
    findBlocksOverlapping(property.id, start, queryEnd),
    findActiveBookingsOverlapping(property.id, start, queryEnd),
  ]);

  const days = getDateRangeInclusive(start, end);

  return days.map((day) => {
    const dayTime = day.getTime();
    const nextDayTime = addDays(day, 1).getTime();


    const booking = bookings.find(
      (b) => b.checkIn.getTime() <= dayTime && b.checkOut.getTime() > dayTime
    );

    const isBlocked = blocks.some(
      (b) => b.startDate.getTime() <= dayTime && b.endDate.getTime() > dayTime
    );

    const override = [...overrides]
      .filter((o) => o.startDate.getTime() <= dayTime && o.endDate.getTime() > dayTime)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    const nightlyRate = override
      ? roundCurrency(override.nightlyRate)
      : computeDynamicRate(property.baseRate, day);

    const status: CalendarDay["status"] = booking ? "BOOKED" : isBlocked ? "BLOCKED" : "AVAILABLE";

    void nextDayTime; 

    return {
      date: formatDateOnly(day),
      status,
      nightlyRate,
      isOverride: Boolean(override),
      bookingId: booking?.id ?? null,
      guestName: booking?.guestName ?? null,
    };
  });
}
