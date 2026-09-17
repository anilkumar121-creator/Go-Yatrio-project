import { Router } from "express";
import { getBooking, getBookings } from "../controllers/booking.controller.js";
import { getVoucher, getPaymentReceipt } from "../controllers/document.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

export const bookingsRouter = Router();

bookingsRouter.get("/", authenticate, getBookings);
bookingsRouter.get("/:id", optionalAuth, getBooking);
bookingsRouter.get("/:id/voucher", optionalAuth, getVoucher);
bookingsRouter.get("/:id/payments/:paymentId/receipt", optionalAuth, getPaymentReceipt);
