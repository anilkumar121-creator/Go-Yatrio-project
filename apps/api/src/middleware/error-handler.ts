import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  void _next;

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      error: "VALIDATION_ERROR",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.code,
    });
    return;
  }

  const message = env.NODE_ENV === "production" ? "Internal server error" : "Internal server error";

  response.status(500).json({
    success: false,
    message,
    error: "INTERNAL_SERVER_ERROR",
  });
}
