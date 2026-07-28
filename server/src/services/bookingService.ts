import { getTheProperty } from "../repositories/propertyRepository";
import { findBlocksOverlapping } from "../repositories/blockRepository";
import {
  createBooking,
  findActiveBookingsOverlapping,
  findAllBookings,
} from "../repositories/bookingRepository";
import { formatDateOnly, parseDateOnly } from "../utils/dateUtils";
import { AppError } from "../utils/AppError";
import { CreateBookingInput } from "../validation/schemas";

export async function listBookings() {
  const property = await getTheProperty();
  return findAllBookings(property.id);
}

export async function createManualBooking(

  input: CreateBookingInput,
  
  source: string = "MANUAL"
  
  ) {
  const property = await getTheProperty();
  const checkIn = parseDateOnly(input.checkIn);
  const checkOut = parseDateOnly(input.checkOut);

  if (checkOut.getTime() <= checkIn.getTime()) {
    throw AppError.badRequest("checkOut must be after checkIn");
  }

  const overlappingBookings = await findActiveBookingsOverlapping(property.id, checkIn, checkOut);
  if (overlappingBookings.length > 0) {
    throw AppError.conflict("Selected dates overlap an existing booking.", {
      conflictingBookings: overlappingBookings.map((b) => ({
        id: b.id,
        guestName: b.guestName,
        checkIn: formatDateOnly(b.checkIn),
        checkOut: formatDateOnly(b.checkOut),
      })),
    });
  }

  const overlappingBlocks = await findBlocksOverlapping(property.id, checkIn, checkOut);
  if (overlappingBlocks.length > 0) {
    throw AppError.conflict("Selected dates include blocked dates.", {
      blockedRanges: overlappingBlocks.map((b) => ({
        startDate: formatDateOnly(b.startDate),
        endDate: formatDateOnly(b.endDate),
      })),
    });
  }

  return createBooking({
    propertyId: property.id,
    guestName: input.guestName,
    checkIn,
    checkOut,
    source,
  });
}
