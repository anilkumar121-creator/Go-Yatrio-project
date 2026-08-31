import { rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Standard error response formatter for rate limit violations.
 */
function createRateLimitHandler(message: string, code = "RATE_LIMIT_EXCEEDED") {
  return (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message,
      error: code,
    });
  };
}

/**
 * Strict rate limiter for authentication endpoints (login, register, password changes).
 * Protects against brute-force credential stuffing and password guessing attacks.
 * Limit: 10 attempts per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many authentication attempts. Please try again after 15 minutes.",
    "AUTH_RATE_LIMIT_EXCEEDED",
  ),
});

/**
 * Rate limiter for public lead and inquiry submissions.
 * Prevents automated form spam, database bloat, and email notification flood.
 * Limit: 10 submissions per 1-hour window per IP.
 */
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many inquiry submissions from this IP. Please try again after an hour.",
    "INQUIRY_RATE_LIMIT_EXCEEDED",
  ),
});

/**
 * General rate limiter for all public API endpoints.
 * Defends against scrapers, high-frequency crawling, and general DoS abuse.
 * Limit: 120 requests per 1-minute window per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many API requests. Please slow down.",
    "API_RATE_LIMIT_EXCEEDED",
  ),
});
