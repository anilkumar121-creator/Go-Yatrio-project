import type { Request, Response } from "express";

export function notFound(request: Request, response: Response) {
  response.status(404).json({
    success: false,
    message: "Route not found",
    error: "Not Found",
    path: request.path,
  });
}
