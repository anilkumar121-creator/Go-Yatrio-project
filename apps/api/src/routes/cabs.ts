import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminGetCab,
  adminListCabs,
  createCab,
  deleteCab,
  getCabAmenities,
  getCabBySlug,
  getCabsByDestination,
  getFeaturedCabs,
  listCabs,
  searchCabs,
  submitCabInquiry,
  updateCab,
  updateCabFeatured,
  updateCabStatus,
} from "../controllers/cab.controller.js";

import { publicCacheControl } from "../middleware/cache-control.js";

export const cabsRouter = Router();

// Public Cab Routes
cabsRouter.get("/", publicCacheControl(300, 600), listCabs);
cabsRouter.get("/search", publicCacheControl(180, 360), searchCabs);
cabsRouter.get("/featured", publicCacheControl(300, 600), getFeaturedCabs);
cabsRouter.get("/destination/:slug", publicCacheControl(300, 600), getCabsByDestination);
cabsRouter.get("/:slug", publicCacheControl(300, 600), getCabBySlug);
cabsRouter.post("/:id/inquiry", submitCabInquiry);

// Admin Cab Routes
export const adminCabsRouter = Router();
adminCabsRouter.use(authenticate, requireAdmin);

adminCabsRouter.get("/", adminListCabs);
adminCabsRouter.get("/amenities", getCabAmenities);
adminCabsRouter.get("/:id", adminGetCab);
adminCabsRouter.post("/", createCab);
adminCabsRouter.put("/:id", updateCab);
adminCabsRouter.delete("/:id", deleteCab);
adminCabsRouter.patch("/:id/status", updateCabStatus);
adminCabsRouter.patch("/:id/featured", updateCabFeatured);
