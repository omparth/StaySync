import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-MM-dd format");

export const calendarQuerySchema = z
  .object({
    start: dateOnly,
    end: dateOnly,
  })
  .refine((v) => v.start <= v.end, {
    message: "start must be on or before end",
    path: ["start"],
  });

export const setRateSchema = z
  .object({
    startDate: dateOnly,
    endDate: dateOnly,
    nightlyRate: z.number().positive("nightlyRate must be greater than 0"),
  })
  .refine((v) => v.startDate < v.endDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const blockRangeSchema = z
  .object({
    startDate: dateOnly,
    endDate: dateOnly,
  })
  .refine((v) => v.startDate < v.endDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const createBookingSchema = z
  .object({
    guestName: z.string().trim().min(1, "guestName is required"),
    checkIn: dateOnly,
    checkOut: dateOnly,
    source: z.enum(["MANUAL", "CHANNEL"]).optional().default("MANUAL"),
  })
  .refine((v) => v.checkIn < v.checkOut, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

const importReservationSchema = z.object({
  id: z.string(),
  guest: z.string(),
  checkIn: dateOnly,
  checkOut: dateOnly,
  status: z.enum(["ACTIVE", "CANCELLED"]),
});

export const importReservationsSchema = z.array(importReservationSchema);

export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
export type SetRateInput = z.infer<typeof setRateSchema>;
export type BlockRangeInput = z.infer<typeof blockRangeSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ImportReservationInput = z.infer<typeof importReservationSchema>;
