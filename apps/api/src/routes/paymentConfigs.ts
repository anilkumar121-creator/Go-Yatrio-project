import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminCreatePaymentConfig,
  adminDeletePaymentConfig,
  adminListPaymentConfigs,
  adminUpdatePaymentConfig,
} from "../controllers/paymentConfig.controller.js";

export const paymentConfigsRouter = Router();
export const adminPaymentConfigsRouter = Router();

adminPaymentConfigsRouter.use(authenticate, requireAdmin);
adminPaymentConfigsRouter.get("/", adminListPaymentConfigs);
adminPaymentConfigsRouter.post("/", adminCreatePaymentConfig);
adminPaymentConfigsRouter.put("/:id", adminUpdatePaymentConfig);
adminPaymentConfigsRouter.delete("/:id", adminDeletePaymentConfig);
