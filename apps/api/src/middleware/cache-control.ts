import type { Request, Response, NextFunction } from "express";

/**
 * Cache-control middleware for public GET endpoints.
 * Sets standard caching headers to allow reverse proxies and browsers
 * to cache public data while enabling background stale revalidations.
 */
export function publicCacheControl(maxAgeSeconds = 300, staleWhileRevalidateSeconds = 600) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Cache-Control",
      `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    );
    next();
  };
}
