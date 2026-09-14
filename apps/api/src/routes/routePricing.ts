import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminCreateRoutePricing,
  adminDeleteRoutePricing,
  adminListRoutePricings,
  adminUpdateRoutePricing,
  publicListRoutePricings,
} from "../controllers/routePricing.controller.js";
import { publicCacheControl } from "../middleware/cache-control.js";

export const routePricingRouter = Router();

routePricingRouter.get("/", publicCacheControl(300, 600), publicListRoutePricings);

export const adminRoutePricingRouter = Router();

adminRoutePricingRouter.use(authenticate, requireAdmin);
adminRoutePricingRouter.get("/", adminListRoutePricings);
adminRoutePricingRouter.post("/", adminCreateRoutePricing);
adminRoutePricingRouter.put("/:id", adminUpdateRoutePricing);
adminRoutePricingRouter.delete("/:id", adminDeleteRoutePricing);
