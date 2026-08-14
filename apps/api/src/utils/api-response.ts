import type { Response } from "express";

export function sendSuccess<T>(response: Response, data: T, statusCode = 200) {
  response.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendMessage(response: Response, message: string, statusCode = 200) {
  response.status(statusCode).json({
    success: true,
    message,
  });
}
