import { RateOverride } from "@prisma/client";
import { prisma } from "../lib/prisma";

export function findOverridesOverlapping(
  propertyId: number,
  rangeStart: Date,
  rangeEnd: Date
): Promise<RateOverride[]> {
  return prisma.rateOverride.findMany({
    where: {
      propertyId,
      startDate: { lt: rangeEnd },
      endDate: { gt: rangeStart },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertRateOverride(
  propertyId: number,
  startDate: Date,
  endDate: Date,
  nightlyRate: number
): Promise<RateOverride> {
  const existing = await prisma.rateOverride.findFirst({
    where: { propertyId, startDate, endDate },
  });

  if (existing) {
    return prisma.rateOverride.update({
      where: { id: existing.id },
      data: { nightlyRate },
    });
  }

  return prisma.rateOverride.create({
    data: { propertyId, startDate, endDate, nightlyRate },
  });
}
