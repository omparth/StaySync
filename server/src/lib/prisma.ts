import { PrismaClient } from "@prisma/client";

declare global {
  var __staysyncPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__staysyncPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__staysyncPrisma = prisma;
}
