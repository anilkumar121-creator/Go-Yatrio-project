import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { cabBookingCreateSchema, cabBookingStatusSchema } from "../validators/schemas.js";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export const createCabBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = cabBookingCreateSchema.parse(req.body);

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
      // Hierarchy B: Explicit fallback to vehicle pricing using distance
      if (data.distanceKm) {
        totalFare =
          Number(vehicle.baseFare) + Number(data.distanceKm) * Number(vehicle.extraKmCharge);
      } else {
        throw new AppError(
          "Route pricing not configured and distance not provided for fallback calculation.",
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

    const booking = await prisma.cabBooking.create({
      data: {
        bookingReference: ref,
        userId: data.userId || null,
        vehicleId: data.vehicleId,
        routePricingId: appliedRoutePricingId,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        passengers: data.passengers,
        luggageCount: data.luggageCount,
        tripType: data.tripType,
        vehicleCategory: data.vehicleCategory,
        calculatedFare: totalFare,
        advanceAmount: advance,
        remainingAmount: remaining,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes,
        // Immutable Booking Price Snapshot
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
        status: "PENDING",
      },
    });

    res.status(201).json(booking);
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
        payment: true,
      },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const adminGetCabBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id);
    const booking = await prisma.cabBooking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        payment: true,
        routePricing: true,
      },
    });
    if (!booking) throw new AppError("Booking not found", 404);
    res.json(booking);
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
    const booking = await prisma.cabBooking.update({
      where: { id },
      data: { status },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
};
