import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { getTheProperty } from "../repositories/propertyRepository";

export const getProperty = asyncHandler(async (_req: Request, res: Response) => {
  const property = await getTheProperty();
  res.json(property);
});
