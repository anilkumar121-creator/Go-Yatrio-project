import cors from "cors";
import express from "express";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import { notFound } from "./middleware/not-found.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use(notFound);

  return app;
}
