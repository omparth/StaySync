import { Booking } from "@prisma/client";
import { prisma } from "../lib/prisma";

export function findActiveBookingsOverlapping(
  propertyId: number,
  rangeStart: Date,
  rangeEnd: Date
): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      propertyId,
      status: "ACTIVE",
      checkIn: { lt: rangeEnd },
      checkOut: { gt: rangeStart },
    },
    orderBy: { checkIn: "asc" },
  });
}

export function findAllBookings(propertyId: number): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: { propertyId },
    orderBy: { checkIn: "asc" },
  });
}

export function findByExternalId(propertyId: number, externalId: string): Promise<Booking | null> {
  return prisma.booking.findFirst({ where: { propertyId, externalId } });
}

export function createBooking(data: {
  propertyId: number;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  source: string;
  externalId?: string | null;
}): Promise<Booking> {
  return prisma.booking.create({ data });
}

export function cancelBooking(id: number): Promise<Booking> {
  return prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
}
