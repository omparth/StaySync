import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}


export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Request failed validation",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong. Please try again.",
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "NotFound",
    message: `No route for ${req.method} ${req.path}`,
  });
}
