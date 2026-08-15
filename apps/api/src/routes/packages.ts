import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminListPackages,
  createPackage,
  deletePackage,
  getPackageBySlug,
  listPackages,
  updatePackage,
  updatePackageFeatured,
  updatePackageStatus,
} from "../controllers/package.controller.js";

export const packagesRouter = Router();

// Public routes
packagesRouter.get("/", listPackages);
packagesRouter.get("/:slug", getPackageBySlug);

// Admin-only routes
export const adminPackagesRouter = Router();
adminPackagesRouter.use(authenticate, requireAdmin);

adminPackagesRouter.get("/", adminListPackages);
adminPackagesRouter.post("/", createPackage);
adminPackagesRouter.put("/:id", updatePackage);
adminPackagesRouter.delete("/:id", deletePackage);
adminPackagesRouter.patch("/:id/status", updatePackageStatus);
adminPackagesRouter.patch("/:id/featured", updatePackageFeatured);