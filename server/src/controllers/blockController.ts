import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { blockRangeSchema } from "../validation/schemas";
import { blockDates, unblockDates } from "../services/blockService";
import { formatDateOnly } from "../utils/dateUtils";

export const postBlock = asyncHandler(async (req: Request, res: Response) => {
  const input = blockRangeSchema.parse(req.body);
  const block = await blockDates(input);
  res.status(201).json({
    id: block.id,
    startDate: formatDateOnly(block.startDate),
    endDate: formatDateOnly(block.endDate),
  });
});

export const deleteBlock = asyncHandler(async (req: Request, res: Response) => {
  const input = blockRangeSchema.parse(req.body);
  const result = await unblockDates(input);
  res.json(result);
});
