import { getTheProperty } from "../repositories/propertyRepository";
import {
  cancelBooking,
  createBooking,
  findActiveBookingsOverlapping,
  findByExternalId,
} from "../repositories/bookingRepository";
import { findBlocksOverlapping } from "../repositories/blockRepository";
import { formatDateOnly, parseDateOnly } from "../utils/dateUtils";
import { ImportReservationInput } from "../validation/schemas";

export type ImportOutcome = "IMPORTED" | "CANCELLED" | "DUPLICATE" | "CONFLICT";

export interface ImportResultRow {
  externalId: string;
  guest: string;
  outcome: ImportOutcome;
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

export async function importReservations(
  reservations: ImportReservationInput[]
): Promise<ImportSummary> {
  const property = await getTheProperty();
  const results: ImportResultRow[] = [];

  for (const reservation of reservations) {
    const existing = await findByExternalId(property.id, reservation.id);

    if (reservation.status === "CANCELLED") {
      if (existing && existing.status === "ACTIVE") {
        await cancelBooking(existing.id);
        results.push({
          externalId: reservation.id,
          guest: reservation.guest,
          outcome: "CANCELLED",
          reason: "Existing active booking cancelled; nights released.",
        });
      } else if (existing && existing.status === "CANCELLED") {
        results.push({
          externalId: reservation.id,
          guest: reservation.guest,
          outcome: "DUPLICATE",
          reason: "Cancellation already recorded.",
        });
      } else {
        await createBooking({
          propertyId: property.id,
          externalId: reservation.id,
          guestName: reservation.guest,
          checkIn: parseDateOnly(reservation.checkIn),
          checkOut: parseDateOnly(reservation.checkOut),
          source: "CHANNEL",
        }).then((b) => cancelBooking(b.id));
        results.push({
          externalId: reservation.id,
          guest: reservation.guest,
          outcome: "CANCELLED",
          reason: "Recorded as cancelled (no prior booking on file).",
        });
      }
      continue;
    }

    if (existing) {
      results.push({
        externalId: reservation.id,
        guest: reservation.guest,
        outcome: "DUPLICATE",
        reason: "Reservation already imported.",
      });
      continue;
    }

    const checkIn = parseDateOnly(reservation.checkIn);
    const checkOut = parseDateOnly(reservation.checkOut);

    const overlappingBookings = await findActiveBookingsOverlapping(property.id, checkIn, checkOut);
    if (overlappingBookings.length > 0) {
      const clash = overlappingBookings[0];
      results.push({
        externalId: reservation.id,
        guest: reservation.guest,
        outcome: "CONFLICT",
        reason: `Overlaps existing booking #${clash.id} (${clash.guestName}, ${formatDateOnly(
          clash.checkIn
        )} - ${formatDateOnly(clash.checkOut)}). Existing booking kept.`,
      });
      continue;
    }

    const overlappingBlocks = await findBlocksOverlapping(property.id, checkIn, checkOut);
    if (overlappingBlocks.length > 0) {
      results.push({
        externalId: reservation.id,
        guest: reservation.guest,
        outcome: "CONFLICT",
        reason: "Overlaps a blocked date range.",
      });
      continue;
    }

    await createBooking({
      propertyId: property.id,
      externalId: reservation.id,
      guestName: reservation.guest,
      checkIn,
      checkOut,
      source: "CHANNEL",
    });
    results.push({ externalId: reservation.id, guest: reservation.guest, outcome: "IMPORTED" });
  }

  return {
    totalProcessed: results.length,
    imported: results.filter((r) => r.outcome === "IMPORTED").length,
    cancelled: results.filter((r) => r.outcome === "CANCELLED").length,
    duplicate: results.filter((r) => r.outcome === "DUPLICATE").length,
    conflict: results.filter((r) => r.outcome === "CONFLICT").length,
    results,
  };
}
