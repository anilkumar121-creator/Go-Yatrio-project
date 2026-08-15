import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminListDestinations,
  createDestination,
  deleteDestination,
  getDestinationBySlug,
  listDestinations,
  updateDestination,
  updateDestinationFeatured,
  updateDestinationStatus,
} from "../controllers/destination.controller.js";

export const destinationsRouter = Router();

// Public routes
destinationsRouter.get("/", listDestinations);
destinationsRouter.get("/:slug", getDestinationBySlug);

// Admin-only routes
export const adminDestinationsRouter = Router();
adminDestinationsRouter.use(authenticate, requireAdmin);

adminDestinationsRouter.get("/", adminListDestinations);
adminDestinationsRouter.post("/", createDestination);
adminDestinationsRouter.put("/:id", updateDestination);
adminDestinationsRouter.delete("/:id", deleteDestination);
adminDestinationsRouter.patch("/:id/status", updateDestinationStatus);
adminDestinationsRouter.patch("/:id/featured", updateDestinationFeatured);