import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { setRateSchema } from "../validation/schemas";
import { setRate } from "../services/rateService";
import { formatDateOnly } from "../utils/dateUtils";

export const postRate = asyncHandler(async (req: Request, res: Response) => {
  const input = setRateSchema.parse(req.body);
  const override = await setRate(input);
  res.status(201).json({
    id: override.id,
    startDate: formatDateOnly(override.startDate),
    endDate: formatDateOnly(override.endDate),
    nightlyRate: override.nightlyRate,
  });
});
