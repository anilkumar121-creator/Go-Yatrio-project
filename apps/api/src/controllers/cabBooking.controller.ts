import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { cabBookingCreateSchema, cabBookingStatusSchema } from "../validators/schemas.js";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

const setGuestCookie = (res: Response, bookingId: string, token: string | null) => {
  if (token) {
    res.cookie(`guest_booking_${bookingId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });
  }
};

export const createCabBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = cabBookingCreateSchema.parse(req.body);

    const idempotencyKey = getParam(req.headers["idempotency-key"]);

    if (idempotencyKey) {
      const existingBooking = await prisma.booking.findUnique({
        where: { idempotencyKey },
        include: { cabBooking: true },
      });

      if (existingBooking && existingBooking.cabBooking) {
        const cb = existingBooking.cabBooking;

        const isSamePayload =
          cb.vehicleId === data.vehicleId &&
          cb.pickupLocation === data.pickupLocation &&
          cb.dropLocation === data.dropLocation &&
          cb.pickupDate.getTime() === data.pickupDate.getTime() &&
          (cb.pickupTime || "") === (data.pickupTime || "") &&
          (cb.returnDate?.getTime() || null) === (data.returnDate?.getTime() || null) &&
          (cb.returnTime || "") === (data.returnTime || "") &&
          cb.passengers === data.passengers &&
          (cb.luggageCount || null) === (data.luggageCount || null) &&
          cb.tripType === data.tripType &&
          cb.vehicleCategory === data.vehicleCategory &&
          JSON.stringify(cb.stops || null) === JSON.stringify(data.stops || null) &&
          cb.customerName === data.customerName &&
          cb.customerEmail === data.customerEmail &&
          cb.customerPhone === data.customerPhone &&
          (cb.notes || "") === (data.notes || "");

        if (!isSamePayload) {
          throw new AppError("Idempotency key already used with a different payload", 409);
        }

        if (existingBooking.guestAccessToken) {
          setGuestCookie(res, existingBooking.id, existingBooking.guestAccessToken);
        }
        return res.status(200).json(cb);
      }
    }

    const isGuest = !data.userId;
    const guestAccessToken = isGuest ? crypto.randomBytes(32).toString("hex") : null;

    const ref = `CAB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Server-Side Pricing Authority
    // Do NOT trust the client-provided calculatedFare, advanceAmount, remainingAmount.
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    let totalFare = 0;
    let appliedRoutePricingId = null;

    // Hierarchy A: Exact active RoutePricing match
    const exactRoute = await prisma.routePricing.findFirst({
      where: {
        origin: { equals: data.pickupLocation, mode: "insensitive" },
        destination: { equals: data.dropLocation, mode: "insensitive" },
        categoryId: vehicle.categoryId || "",
        isActive: true,
      },
    });

    if (exactRoute) {
      totalFare = Number(exactRoute.basePrice);
      appliedRoutePricingId = exactRoute.id;
    } else {
      if (data.distanceKm) {
        totalFare =
          Number(vehicle.baseFare) + Number(data.distanceKm) * Number(vehicle.extraKmCharge);
      } else {
        throw new AppError(
          "Authoritative fare cannot be calculated. Manual pricing required.",
          400,
        );
      }
    }

    // Payment Configuration
    // Obtain the applicable active/default payment configuration from the database.
    const paymentConfig = await prisma.paymentConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { isDefault: "desc" },
    });

    // Default to 100% advance if no config is found
    const advancePercent = paymentConfig ? Number(paymentConfig.advancePercent) : 100;

    // Server-side money validation
    const advance = Math.round(totalFare * (advancePercent / 100));
    const remaining = Math.max(0, totalFare - advance);

    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // 1. Create the new generic Booking parent
        const parentBooking = await tx.booking.create({
          data: {
            bookingReference: ref,
            idempotencyKey: idempotencyKey || null,
            guestAccessToken,
            userId: data.userId || null,
            serviceType: "CAB",
            status: "PENDING_PAYMENT",
            totalAmount: totalFare,
            advanceAmount: advance,
            remainingAmount: remaining,
            currency: "INR",
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
          },
        });

        // 2. Create the CabBooking child, retaining legacy fields for zero-downtime
        const cabBooking = await tx.cabBooking.create({
          data: {
            bookingReference: ref, // Legacy
            bookingId: parentBooking.id, // The new standard relation
            userId: data.userId || null, // Legacy
            vehicleId: data.vehicleId,
            routePricingId: appliedRoutePricingId,
            pickupLocation: data.pickupLocation,
            dropLocation: data.dropLocation,
            pickupDate: data.pickupDate,
            pickupTime: data.pickupTime,
            returnDate: data.returnDate,
            returnTime: data.returnTime,
            stops: data.stops ? JSON.parse(JSON.stringify(data.stops)) : undefined,
            passengers: data.passengers,
            luggageCount: data.luggageCount,
            tripType: data.tripType,
            vehicleCategory: data.vehicleCategory,
            calculatedFare: totalFare, // Legacy
            advanceAmount: advance, // Legacy
            remainingAmount: remaining, // Legacy
            customerName: data.customerName, // Legacy
            customerEmail: data.customerEmail, // Legacy
            customerPhone: data.customerPhone, // Legacy
            notes: data.notes,
            pricingSnapshot: {
              pricingMethod: appliedRoutePricingId ? "ROUTE_PRICING" : "DISTANCE_FALLBACK",
              vehicleId: vehicle.id,
              appliedRoutePricingId,
              vehicleBaseFare: vehicle.baseFare,
              vehicleExtraKmCharge: vehicle.extraKmCharge,
              originUsed: data.pickupLocation,
              destinationUsed: data.dropLocation,
              distanceKm: data.distanceKm || null,
              totalFare,
              advancePercentApplied: advancePercent,
              advanceAmount: advance,
              remainingAmount: remaining,
              paymentConfigurationId: paymentConfig?.id || null,
            },
            status: "PENDING", // Legacy
          },
        });

        return cabBooking;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        idempotencyKey
      ) {
        // Race condition check: Did another request with the same idempotency key beat us?
        const existingBooking = await prisma.booking.findUnique({
          where: { idempotencyKey },
          include: { cabBooking: true },
        });

        if (existingBooking && existingBooking.cabBooking) {
          const cb = existingBooking.cabBooking;

          const isSamePayload =
            cb.vehicleId === data.vehicleId &&
            cb.pickupLocation === data.pickupLocation &&
            cb.dropLocation === data.dropLocation &&
            cb.pickupDate.getTime() === data.pickupDate.getTime() &&
            (cb.pickupTime || "") === (data.pickupTime || "") &&
            (cb.returnDate?.getTime() || null) === (data.returnDate?.getTime() || null) &&
            (cb.returnTime || "") === (data.returnTime || "") &&
            cb.passengers === data.passengers &&
            (cb.luggageCount || null) === (data.luggageCount || null) &&
            cb.tripType === data.tripType &&
            cb.vehicleCategory === data.vehicleCategory &&
            JSON.stringify(cb.stops || null) === JSON.stringify(data.stops || null) &&
            cb.customerName === data.customerName &&
            cb.customerEmail === data.customerEmail &&
            cb.customerPhone === data.customerPhone &&
            (cb.notes || "") === (data.notes || "");

          if (!isSamePayload) {
            throw new AppError("Idempotency key already used with a different payload", 409);
          }
          if (existingBooking.guestAccessToken) {
            setGuestCookie(res, existingBooking.id, existingBooking.guestAccessToken);
          }
          return res.status(200).json(cb);
        }
      }
      throw error;
    }

    if (guestAccessToken && result?.bookingId) {
      setGuestCookie(res, result.bookingId, guestAccessToken);
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const adminListCabBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.cabBooking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { select: { vehicleName: true, vehicleType: true } },
        booking: {
          include: { payments: true },
        },
      },
    });

    // Map nested payments back to the legacy top-level `payment` object for backward compatibility
    const formattedBookings = bookings.map((b) => ({
      ...b,
      payment: b.booking?.payments[0] || null,
    }));

    res.json(formattedBookings);
  } catch (error) {
    next(error);
  }
};

export const adminGetCabBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id);
    const cabBooking = await prisma.cabBooking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        routePricing: true,
        booking: {
          include: { payments: true },
        },
      },
    });
    if (!cabBooking) throw new AppError("Booking not found", 404);

    const formattedBooking = {
      ...cabBooking,
      payment: cabBooking.booking?.payments[0] || null,
    };

    res.json(formattedBooking);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCabBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getParam(req.params.id);
    const { status } = cabBookingStatusSchema.parse(req.body);

    const cabBooking = await prisma.cabBooking.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!cabBooking) throw new AppError("Booking not found", 404);

    const updatedCabBooking = await prisma.$transaction(async (tx) => {
      let bookingStatus = "PENDING_PAYMENT";
      if (status === "CONFIRMED") bookingStatus = "CONFIRMED";
      if (status === "COMPLETED") bookingStatus = "COMPLETED";
      if (status === "CANCELLED") bookingStatus = "CANCELLED";

      if (cabBooking.bookingId) {
        await tx.booking.update({
          where: { id: cabBooking.bookingId },
          data: { status: bookingStatus as BookingStatus },
        });
      }

      return tx.cabBooking.update({
        where: { id },
        data: { status },
      });
    });

    res.json(updatedCabBooking);
  } catch (error) {
    next(error);
  }
};
