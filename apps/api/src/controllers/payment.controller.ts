import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { PaymentService } from "../services/payment/payment.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const paymentService = new PaymentService();

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
