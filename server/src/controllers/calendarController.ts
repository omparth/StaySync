import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { calendarQuerySchema } from "../validation/schemas";
import { parseDateOnly } from "../utils/dateUtils";
import { getCalendar } from "../services/calendarService";

export const getCalendarRange = asyncHandler(async (req: Request, res: Response) => {
  const { start, end } = calendarQuerySchema.parse(req.query);
  const days = await getCalendar(parseDateOnly(start), parseDateOnly(end));
  res.json({ start, end, days });
});
