import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { createBookingSchema } from "../validation/schemas";
import { createManualBooking, listBookings } from "../services/bookingService";
import { formatDateOnly } from "../utils/dateUtils";
import { Booking } from "@prisma/client";

function serializeBooking(b: Booking) {
  return {
    id: b.id,
    externalId: b.externalId,
    guestName: b.guestName,
    checkIn: formatDateOnly(b.checkIn),
    checkOut: formatDateOnly(b.checkOut),
    source: b.source,
    status: b.status,
    createdAt: b.createdAt,
  };
}

export const getBookings = asyncHandler(async (_req: Request, res: Response) => {
  const bookings = await listBookings();
  res.json(bookings.map(serializeBooking));
});

export const postBooking = asyncHandler(async (req: Request, res: Response) => {
  const input = createBookingSchema.parse(req.body);
  const booking = await createManualBooking(input, input.source);
  res.status(201).json(serializeBooking(booking));
});
