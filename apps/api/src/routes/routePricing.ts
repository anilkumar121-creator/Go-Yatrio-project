import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminCreateRoutePricing,
  adminDeleteRoutePricing,
  adminListRoutePricings,
  adminUpdateRoutePricing,
} from "../controllers/routePricing.controller.js";

export const routePricingRouter = Router();
export const adminRoutePricingRouter = Router();

adminRoutePricingRouter.use(authenticate, requireAdmin);
adminRoutePricingRouter.get("/", adminListRoutePricings);
adminRoutePricingRouter.post("/", adminCreateRoutePricing);
adminRoutePricingRouter.put("/:id", adminUpdateRoutePricing);
adminRoutePricingRouter.delete("/:id", adminDeleteRoutePricing);
