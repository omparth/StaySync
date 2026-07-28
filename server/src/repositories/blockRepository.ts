import { BlockedDate } from "@prisma/client";
import { prisma } from "../lib/prisma";

export function findBlocksOverlapping(
  propertyId: number,
  rangeStart: Date,
  rangeEnd: Date
): Promise<BlockedDate[]> {
  return prisma.blockedDate.findMany({
    where: {
      propertyId,
      startDate: { lt: rangeEnd },
      endDate: { gt: rangeStart },
    },
    orderBy: { startDate: "asc" },
  });
}

export function createBlock(
  propertyId: number,
  startDate: Date,
  endDate: Date
): Promise<BlockedDate> {
  return prisma.blockedDate.create({ data: { propertyId, startDate, endDate } });
}

export async function unblockRange(
  propertyId: number,
  rangeStart: Date,
  rangeEnd: Date
): Promise<void> {
  const overlapping = await findBlocksOverlapping(propertyId, rangeStart, rangeEnd);
  if (overlapping.length === 0) return;

  const toCreate: { propertyId: number; startDate: Date; endDate: Date }[] = [];
  const idsToDelete: number[] = [];

  for (const block of overlapping) {
    idsToDelete.push(block.id);

    if (block.startDate.getTime() < rangeStart.getTime()) {
      toCreate.push({
        propertyId,
        startDate: block.startDate,
        endDate: new Date(Math.min(block.endDate.getTime(), rangeStart.getTime())),
      });
    }
    if (block.endDate.getTime() > rangeEnd.getTime()) {
      toCreate.push({
        propertyId,
        startDate: new Date(Math.max(block.startDate.getTime(), rangeEnd.getTime())),
        endDate: block.endDate,
      });
    }
  }

  await prisma.$transaction([
    prisma.blockedDate.deleteMany({ where: { id: { in: idsToDelete } } }),
    ...toCreate.map((data) => prisma.blockedDate.create({ data })),
  ]);
}
