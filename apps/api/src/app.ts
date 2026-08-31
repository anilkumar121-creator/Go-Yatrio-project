import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { health } from "./controllers/health.controller.js";
import { notFound } from "./middleware/not-found.js";
import { authRouter } from "./routes/auth.js";
import { adminBlogsRouter, blogsRouter } from "./routes/blogs.js";
import { adminCabsRouter, cabsRouter } from "./routes/cabs.js";
import { adminDestinationsRouter, destinationsRouter } from "./routes/destinations.js";
import { adminHotelsRouter, hotelsRouter } from "./routes/hotels.js";
import { inquiriesRouter, adminInquiriesRouter } from "./routes/inquiries.js";
import { adminItinerariesRouter, itinerariesRouter } from "./routes/itineraries.js";
import { adminMediaRouter, mediaRouter } from "./routes/media.js";
import { adminLookupsRouter, lookupsRouter } from "./routes/lookups.js";
import { adminPackagesRouter, packagesRouter } from "./routes/packages.js";
import { adminSeoRouter, seoRouter } from "./routes/seo.js";

import { apiLimiter } from "./middleware/rate-limiter.js";

export function createApp() {
  const app = express();

  // Trust first proxy hop (e.g. Next.js rewrite proxy, Cloudflare, load balancers)
  // Ensures correct client IP detection for rate limiting and auditing
  app.set("trust proxy", 1);

  // Security Headers via Helmet
  app.use(helmet());

  // CORS configuration supporting single or comma-separated origins
  const allowedOrigins = env.API_CORS_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl/server-side fetches)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS policy"));
        }
      },
      credentials: true,
    }),
  );

  // Parse request bodies with safe 1mb limit
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Health APIs (exempt from rate limiting for probes / uptime monitors)
  app.get("/health", health);
  app.get("/api/status", health);
  app.use("/api/health", healthRouter);

  // General rate limiter for all /api endpoints
  app.use("/api", apiLimiter);

  // Core domain API routes
  app.use("/api/auth", authRouter);
  app.use("/api/destinations", destinationsRouter);
  app.use("/api/admin/destinations", adminDestinationsRouter);
  app.use("/api/packages", packagesRouter);
  app.use("/api/admin/packages", adminPackagesRouter);
  app.use("/api/itineraries", itinerariesRouter);
  app.use("/api/admin/itineraries", adminItinerariesRouter);
  app.use("/api/hotels", hotelsRouter);
  app.use("/api/admin/hotels", adminHotelsRouter);
  app.use("/api/cabs", cabsRouter);
  app.use("/api/admin/cabs", adminCabsRouter);
  app.use("/api/inquiries", inquiriesRouter);
  app.use("/api/admin/inquiries", adminInquiriesRouter);
  app.use("/api/blogs", blogsRouter);
  app.use("/api/admin/blogs", adminBlogsRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/admin/media", adminMediaRouter);
  app.use("/api/lookups", lookupsRouter);
  app.use("/api/admin/lookups", adminLookupsRouter);
  app.use("/api/seo-metadata", seoRouter);
  app.use("/api/admin/seo-metadata", adminSeoRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
