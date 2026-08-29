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

export function sendPaginated<T>(
  response: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  response.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
