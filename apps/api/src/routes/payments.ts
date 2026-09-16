import { Router } from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const paymentsRouter = Router();

// Guest booking and authenticated user booking share this endpoint.
// We use optionalAuth because auth depends on booking.userId vs guestAccessToken.
paymentsRouter.post("/:bookingId/intent", optionalAuth, createPaymentIntent);

export { paymentsRouter };
