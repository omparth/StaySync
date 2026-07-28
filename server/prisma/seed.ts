import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


function d(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

async function main() {
  console.log("Seeding StaySync...");

  await prisma.booking.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.rateOverride.deleteMany();
  await prisma.property.deleteMany();

  const property = await prisma.property.create({
    data: {
      name: "Seaside Cottage",
      baseRate: 120,
    },
  });

  await prisma.blockedDate.create({
    data: {
      propertyId: property.id,
      startDate: d("2026-08-05"),
      endDate: d("2026-08-08"), 
    },
  });

 
  await prisma.rateOverride.create({
    data: {
      propertyId: property.id,
      startDate: d("2026-08-21"),
      endDate: d("2026-08-24"),
      nightlyRate: 199,
    },
  });

  await prisma.booking.create({
    data: {
      propertyId: property.id,
      guestName: "Prashant B.",
      checkIn: d("2026-08-24"),
      checkOut: d("2026-08-28"),
      source: "MANUAL",
      status: "ACTIVE",
    },
  });

  await prisma.booking.create({
    data: {
      propertyId: property.id,
      guestName: "Anurag S.",
      checkIn: d("2026-09-02"),
      checkOut: d("2026-09-05"),
      source: "MANUAL",
      status: "ACTIVE",
    },
  });

  console.log(`Seeded property "${property.name}" (id=${property.id})`);
  console.log("Seeded 1 blocked range, 1 rate override, 2 manual bookings.");
  console.log("Run POST /api/import (or click Import in the UI) to load reservations.json.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
