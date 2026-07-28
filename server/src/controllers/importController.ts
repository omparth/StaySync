import { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { asyncHandler } from "../middleware/errorHandler";
import { importReservationsSchema } from "../validation/schemas";
import { importReservations } from "../services/importService";
import { AppError } from "../utils/AppError";

const RESERVATIONS_FILE = path.resolve(__dirname, "../../../reservations.json");

export const postImport = asyncHandler(async (req: Request, res: Response) => {
  let raw: unknown;
  if (req.body && Array.isArray(req.body) && req.body.length > 0) {
    raw = req.body;
  } else {
    try {
      const fileContents = await fs.readFile(RESERVATIONS_FILE, "utf-8");
      raw = JSON.parse(fileContents);
    } catch (err) {
      throw AppError.badRequest(
        `Could not read reservations.json at ${RESERVATIONS_FILE}. Ensure the file exists at the project root.`
      );
    }
  }

  const reservations = importReservationsSchema.parse(raw);
  const summary = await importReservations(reservations);
  res.json(summary);
});
