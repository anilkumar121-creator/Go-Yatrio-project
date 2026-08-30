import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  deleteSeoMetadata,
  getSeoMetadataByPage,
  listSeoMetadata,
  upsertSeoMetadata,
} from "../controllers/seo.controller.js";

export const seoRouter = Router();

// Public routes
seoRouter.get("/by-page", getSeoMetadataByPage);

// Admin-only routes
export const adminSeoRouter = Router();
adminSeoRouter.use(authenticate, requireAdmin);

adminSeoRouter.get("/", listSeoMetadata);
adminSeoRouter.post("/", upsertSeoMetadata);
adminSeoRouter.delete("/:id", deleteSeoMetadata);
