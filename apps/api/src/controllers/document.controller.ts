import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { DocumentService, FullCabBooking } from "../services/document/document.service.js";
import { PaymentReconciliationService } from "../services/payment/payment-reconciliation.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const documentService = new DocumentService();

export const getVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== "string") throw new AppError("Booking ID is required", 400);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cabBooking: {
          include: {
            vehicle: true,
          },
        },
        payments: true, // Needed for reconciliation
      },
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
      const token = getCookieValue(req.headers.cookie, `guest_booking_${id}`);
      if (!token || token !== booking.guestAccessToken) {
        throw new AppError("Booking not found or access denied", 404);
      }
    }

    // Must be confirmed or completed to have a voucher
    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      throw new AppError("Voucher is not available for this booking status.", 400);
    }

    if (!booking.cabBooking) {
      throw new AppError("Only cab booking vouchers are supported currently.", 400);
    }

    const reconciliation = PaymentReconciliationService.reconcile(booking, booking.payments);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="GoYatrio-Voucher-${booking.bookingReference}.pdf"`,
    );

    const doc = documentService.generateCabVoucher(
      booking,
      booking.cabBooking as FullCabBooking,
      reconciliation,
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};

export const getPaymentReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== "string") throw new AppError("Booking ID is required", 400);

    const rawPaymentId = req.params.paymentId;
    const paymentId = Array.isArray(rawPaymentId) ? rawPaymentId[0] : rawPaymentId;
    if (!paymentId || typeof paymentId !== "string")
      throw new AppError("Payment ID is required", 400);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payments: true,
      },
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
      const token = getCookieValue(req.headers.cookie, `guest_booking_${id}`);
      if (!token || token !== booking.guestAccessToken) {
        throw new AppError("Booking not found or access denied", 404);
      }
    }

    const payment = booking.payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.status !== "SUCCESS") {
      throw new AppError("Receipts are only available for successful payments.", 400);
    }

    const reconciliation = PaymentReconciliationService.reconcile(booking, booking.payments);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="GoYatrio-Receipt-${payment.paymentReference || payment.id}.pdf"`,
    );

    const doc = documentService.generatePaymentReceipt(booking, payment, reconciliation);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};
