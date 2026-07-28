import { Property } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export async function getTheProperty(): Promise<Property> {
  const property = await prisma.property.findFirst({ orderBy: { id: "asc" } });
  if (!property) {
    throw new AppError(
      "No property configured. Run `npm run seed` to initialize StaySync.",
      500
    );
  }
  return property;
}
