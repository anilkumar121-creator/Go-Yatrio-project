import { Router } from "express";
import { createPaymentIntent, handleRazorpayWebhook } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const paymentsRouter = Router();

// Webhook relies on rawBody injected by express.json verify hook
paymentsRouter.post("/webhook", handleRazorpayWebhook);

// We use optionalAuth because auth depends on booking.userId vs guestAccessToken.
paymentsRouter.post("/:bookingId/intent", optionalAuth, createPaymentIntent);

export { paymentsRouter };
