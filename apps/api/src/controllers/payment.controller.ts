import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { PaymentService } from "../services/payment/payment.service.js";
import { PaymentVerificationService } from "../services/payment/payment-verification.service.js";
import { PaymentReconciliationService } from "../services/payment/payment-reconciliation.service.js";
import { NotificationService } from "../services/notification/notification.service.js";
import { RazorpayAdapter } from "../services/payment/adapters/razorpay.js";
import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const paymentService = new PaymentService();
const verificationService = new PaymentVerificationService();
const notificationService = new NotificationService();

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

    // After responding to the gateway, send the confirmation notification if this was a new success
    if (result.status === "success" && "bookingId" in result && "paymentId" in result) {
      // Fetch required data asynchronously
      setImmediate(async () => {
        try {
          const bookingId = result.bookingId as string;
          const paymentId = result.paymentId as string;

          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { cabBooking: true, payments: true },
          });

          if (!booking) return;

          const payment = booking.payments.find((p) => p.id === paymentId);
          if (!payment) return;

          const paymentSummary = PaymentReconciliationService.reconcile(booking, booking.payments);

          const priorSuccessPayments = await prisma.payment.findMany({
            where: {
              bookingId: booking.id,
              status: "SUCCESS",
              id: { not: paymentId },
              createdAt: {
                lt: payment.createdAt,
              },
            },
          });

          const priorSuccessSum = priorSuccessPayments.reduce(
            (sum, p) => sum.add(new Prisma.Decimal(p.amount)),
            new Prisma.Decimal(0),
          );

          const paymentType = priorSuccessSum.lt(booking.advanceAmount) ? "ADVANCE" : "BALANCE";

          await notificationService.sendBookingConfirmation({
            booking,
            cabBooking: booking.cabBooking,
            paymentSummary,
            paymentType,
          });
        } catch (error) {
          console.error("[Notification] Best-effort notification failed:", error);
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.paymentId;
    const paymentId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!paymentId || typeof paymentId !== "string") {
      throw new AppError("Payment ID is required", 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new AppError("Payment not found or access denied", 404);
    }

    const booking = payment.booking;
    const authReq = req as AuthenticatedRequest;
    const authUserId = authReq.user?.sub;

    if (booking.userId) {
      if (!authUserId || booking.userId !== authUserId) {
        throw new AppError("Payment not found or access denied", 404);
      }
    } else {
      const token = getCookieValue(req.headers.cookie, `guest_booking_${booking.id}`);
      if (!token || token !== booking.guestAccessToken) {
        throw new AppError("Payment not found or access denied", 404);
      }
    }

    const priorSuccessPayments = await prisma.payment.findMany({
      where: {
        bookingId: payment.bookingId,
        status: "SUCCESS",
        createdAt: {
          lt: payment.createdAt,
        },
      },
    });

    const priorSuccessSum = priorSuccessPayments.reduce(
      (sum, p) => sum.add(new Prisma.Decimal(p.amount)),
      new Prisma.Decimal(0),
    );

    const paymentType = priorSuccessSum.lt(booking.advanceAmount) ? "ADVANCE" : "BALANCE";

    res.status(200).json({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      paymentType,
    });
  } catch (error) {
    next(error);
  }
};
