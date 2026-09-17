import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { PaymentReconciliationService } from "../services/payment/payment-reconciliation.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== "string") throw new AppError("Booking ID is required", 400);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cabBooking: {
          include: {
            vehicle: {
              select: {
                vehicleName: true,
                vehicleType: true,
                baseFare: true,
                extraKmCharge: true,
                image: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      // Generic 404 to avoid leaking existence
      throw new AppError("Booking not found or access denied", 404);
    }

    const authReq = req as AuthenticatedRequest;
    const authUserId = authReq.user?.sub;

    // Auth Check
    if (booking.userId) {
      // Authenticated booking, must match userId
      if (!authUserId || booking.userId !== authUserId) {
        throw new AppError("Booking not found or access denied", 404); // IDOR protection
      }
    } else {
      // Guest booking, must have valid cookie token
      const token = getCookieValue(req.headers.cookie, `guest_booking_${id}`);
      if (!token || token !== booking.guestAccessToken) {
        throw new AppError("Booking not found or access denied", 404); // IDOR protection
      }
    }

    const reconciliation = PaymentReconciliationService.reconcile(booking, booking.payments);

    // Strip internal/sensitive data
    const safeResponse = {
      id: booking.id,
      bookingReference: booking.bookingReference,
      serviceType: booking.serviceType,
      status: booking.status,
      createdAt: booking.createdAt,
      cabBooking: booking.cabBooking
        ? {
            ...booking.cabBooking,
            id: undefined, // internal
            bookingId: undefined, // internal
          }
        : null,
      payments: booking.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt,
      })),
      paymentSummary: {
        totalAmount: Number(reconciliation.totalAmount),
        advanceAmount: Number(reconciliation.advanceAmount),
        successfulPaymentsSum: Number(reconciliation.successfulPaymentsSum),
        outstandingAmount: Number(reconciliation.outstandingAmount),
        payableAmount: Number(reconciliation.payableAmount),
        isAdvanceSatisfied: reconciliation.isAdvanceSatisfied,
        isFullyPaid: reconciliation.isFullyPaid,
      },
    };

    res.json(safeResponse);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const authUserId = authReq.user?.sub;

    if (!authUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [totalCount, bookings] = await Promise.all([
      prisma.booking.count({
        where: { userId: authUserId },
      }),
      prisma.booking.findMany({
        where: { userId: authUserId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          cabBooking: {
            include: {
              vehicle: {
                select: {
                  vehicleName: true,
                  vehicleType: true,
                },
              },
              pickupCity: { select: { name: true } },
              dropCity: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const safeBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      serviceType: booking.serviceType,
      status: booking.status,
      createdAt: booking.createdAt,
      totalAmount: booking.cabBooking?.pricingSnapshot
        ? (booking.cabBooking.pricingSnapshot as unknown as { totalFare?: number }).totalFare
        : null, // Just a simple amount representation for list
      cabBooking: booking.cabBooking
        ? {
            tripType: booking.cabBooking.tripType,
            pickupCity: booking.cabBooking.pickupCity,
            dropCity: booking.cabBooking.dropCity,
            pickupDate: booking.cabBooking.pickupDate,
            vehicle: booking.cabBooking.vehicle,
          }
        : null,
    }));

    res.json({
      data: safeBookings,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
