import { getTheProperty } from "../repositories/propertyRepository";
import { createBlock, unblockRange } from "../repositories/blockRepository";
import { findActiveBookingsOverlapping } from "../repositories/bookingRepository";
import { formatDateOnly, parseDateOnly } from "../utils/dateUtils";
import { AppError } from "../utils/AppError";
import { BlockRangeInput } from "../validation/schemas";

export async function blockDates(input: BlockRangeInput) {
  const property = await getTheProperty();
  const startDate = parseDateOnly(input.startDate);
  const endDate = parseDateOnly(input.endDate);

  
  const clashingBookings = await findActiveBookingsOverlapping(property.id, startDate, endDate);
  if (clashingBookings.length > 0) {
    throw AppError.conflict(
      "Cannot block dates that overlap an existing active booking.",
      clashingBookings.map((b) => ({
        bookingId: b.id,
        guestName: b.guestName,
        checkIn: formatDateOnly(b.checkIn),
        checkOut: formatDateOnly(b.checkOut),
      }))
    );
  }

  return createBlock(property.id, startDate, endDate);
}

export async function unblockDates(input: BlockRangeInput) {
  const property = await getTheProperty();
  const startDate = parseDateOnly(input.startDate);
  const endDate = parseDateOnly(input.endDate);
  await unblockRange(property.id, startDate, endDate);
  return { startDate: input.startDate, endDate: input.endDate, unblocked: true };
}
