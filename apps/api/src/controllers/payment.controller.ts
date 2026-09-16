import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { PaymentService } from "../services/payment/payment.service.js";
import { PaymentVerificationService } from "../services/payment/payment-verification.service.js";
import { RazorpayAdapter } from "../services/payment/adapters/razorpay.js";
import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const paymentService = new PaymentService();
const verificationService = new PaymentVerificationService();

function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.bookingId;
    const bookingId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!bookingId || typeof bookingId !== "string") {
      throw new AppError("Booking ID is required", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError("Booking not found or access denied", 404);
    }

    const authReq = req as AuthenticatedRequest;
    const authUserId = authReq.user?.sub;

    if (booking.userId) {
      if (!authUserId || booking.userId !== authUserId) {
        throw new AppError("Booking not found or access denied", 404);
      }
    } else {
      const token = getCookieValue(req.headers.cookie, `guest_booking_${bookingId}`);
      if (!token || token !== booking.guestAccessToken) {
        throw new AppError("Booking not found or access denied", 404);
      }
    }

    const result = await paymentService.createPaymentIntent(bookingId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature || typeof signature !== "string") {
      throw new AppError("Missing Razorpay signature", 400);
    }

    const rawBody = (req as Request & { rawBody?: string }).rawBody;
    if (!rawBody) {
      throw new AppError("Missing raw body for signature verification", 400);
    }

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET || !env.RAZORPAY_WEBHOOK_SECRET) {
      throw new AppError("Gateway is not fully configured", 500);
    }

    const adapter = new RazorpayAdapter(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);

    const isValid = adapter.verifyWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
      throw new AppError("Invalid webhook signature", 400);
    }

    const normalizedEvent = adapter.parseWebhookEvent(rawBody);

    // Safely acknowledge unhandled events so gateway stops retrying
    if (normalizedEvent.eventType === "unknown") {
      res.status(200).json({ received: true });
      return;
    }

    const result = await verificationService.processEvent(normalizedEvent);

    // Send 200 OK back to the provider in all handled cases so they don't retry unnecessarily
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
