import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  addPackageOffer,
  addPackageSeasonalPrice,
  adminListPackages,
  createPackage,
  deletePackage,
  deletePackageOffer,
  deletePackageSeasonalPrice,
  getPackageBySlug,
  listPackages,
  updatePackage,
  updatePackageAvailability,
  updatePackageFeatured,
  updatePackageOffer,
  updatePackageSeasonalPrice,
  updatePackageStatus,
} from "../controllers/package.controller.js";

import { publicCacheControl } from "../middleware/cache-control.js";

export const packagesRouter = Router();

// Public routes
packagesRouter.get("/", publicCacheControl(300, 600), listPackages);
packagesRouter.get("/:slug", publicCacheControl(300, 600), getPackageBySlug);

// Admin-only routes
export const adminPackagesRouter = Router();
adminPackagesRouter.use(authenticate, requireAdmin);

adminPackagesRouter.get("/", adminListPackages);
adminPackagesRouter.post("/", createPackage);
adminPackagesRouter.put("/:id", updatePackage);
adminPackagesRouter.delete("/:id", deletePackage);
adminPackagesRouter.patch("/:id/status", updatePackageStatus);
adminPackagesRouter.patch("/:id/featured", updatePackageFeatured);
adminPackagesRouter.patch("/:id/availability", updatePackageAvailability);

// Seasonal pricing
adminPackagesRouter.post("/:id/seasonal-prices", addPackageSeasonalPrice);
adminPackagesRouter.put("/seasonal-prices/:id", updatePackageSeasonalPrice);
adminPackagesRouter.delete("/seasonal-prices/:id", deletePackageSeasonalPrice);

// Offers
adminPackagesRouter.post("/:id/offers", addPackageOffer);
adminPackagesRouter.put("/offers/:id", updatePackageOffer);
adminPackagesRouter.delete("/offers/:id", deletePackageOffer);
