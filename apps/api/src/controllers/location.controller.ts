import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  stateCreateSchema,
  stateUpdateSchema,
  cityCreateSchema,
  cityUpdateSchema,
} from "../validators/schemas.js";

// --- STATES ---

export const getStates = asyncHandler(async (req: Request, res: Response) => {
  const { activeOnly } = req.query;
  const where = activeOnly === "true" ? { isActive: true } : {};

  const states = await prisma.state.findMany({
    where,
    orderBy: { name: "asc" },
  });

  res.json({
    success: true,
    data: states,
  });
});

export const createState = asyncHandler(async (req: Request, res: Response) => {
  const data = stateCreateSchema.parse(req.body);

  // Check unique
  const existing = await prisma.state.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new AppError("State with this name already exists", 400);
  }

  if (data.code) {
    const existingCode = await prisma.state.findUnique({ where: { code: data.code } });
    if (existingCode) {
      throw new AppError("State with this code already exists", 400);
    }
  }

  const state = await prisma.state.create({ data });

  res.status(201).json({
    success: true,
    data: state,
    message: "State created successfully",
  });
});

export const updateState = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = stateUpdateSchema.parse(req.body);

  if (data.name) {
    const existing = await prisma.state.findFirst({
      where: { name: data.name, id: { not: id } },
    });
    if (existing) throw new AppError("State with this name already exists", 400);
  }

  if (data.code) {
    const existingCode = await prisma.state.findFirst({
      where: { code: data.code, id: { not: id } },
    });
    if (existingCode) throw new AppError("State with this code already exists", 400);
  }

  const state = await prisma.state.update({
    where: { id },
    data,
  });

  res.json({
    success: true,
    data: state,
    message: "State updated successfully",
  });
});

export const deleteState = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  // Check if state is used by cities
  const cityCount = await prisma.city.count({ where: { stateId: id } });
  if (cityCount > 0) {
    throw new AppError("Cannot delete state because it has associated cities", 400);
  }

  await prisma.state.delete({ where: { id } });

  res.json({
    success: true,
    message: "State deleted successfully",
  });
});

// --- CITIES ---

export const getCities = asyncHandler(async (req: Request, res: Response) => {
  const { stateId, activeOnly, hasCabService } = req.query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (stateId) where.stateId = String(stateId);
  if (activeOnly === "true") where.isActive = true;
  if (hasCabService === "true") {
    where.serviceLocations = { some: { isActive: true } };
  }

  const cities = await prisma.city.findMany({
    where,
    include: { state: true },
    orderBy: { name: "asc" },
  });

  res.json({
    success: true,
    data: cities,
  });
});

export const getCityBySlugOrId = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const city = await prisma.city.findUnique({
    where: { id },
    include: { state: true },
  });

  if (!city) throw new AppError("City not found", 404);

  res.json({ success: true, data: city });
});

export const createCity = asyncHandler(async (req: Request, res: Response) => {
  const data = cityCreateSchema.parse(req.body);

  const existing = await prisma.city.findUnique({
    where: { stateId_name: { stateId: data.stateId, name: data.name } },
  });

  if (existing) {
    throw new AppError("City with this name already exists in the given state", 400);
  }

  const city = await prisma.city.create({ data });

  res.status(201).json({
    success: true,
    data: city,
    message: "City created successfully",
  });
});

export const updateCity = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = cityUpdateSchema.parse(req.body);

  const existingCity = await prisma.city.findUnique({ where: { id } });
  if (!existingCity) throw new AppError("City not found", 404);

  const checkStateId = data.stateId || existingCity.stateId;
  const checkName = data.name || existingCity.name;

  if (data.stateId || data.name) {
    const existing = await prisma.city.findFirst({
      where: {
        stateId: checkStateId,
        name: checkName,
        id: { not: id },
      },
    });

    if (existing) {
      throw new AppError("City with this name already exists in the selected state", 400);
    }
  }

  const city = await prisma.city.update({
    where: { id },
    data,
  });

  res.json({
    success: true,
    data: city,
    message: "City updated successfully",
  });
});

export const deleteCity = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  // Check relations safely
  const city = (await prisma.city.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          serviceLocations: true,
          itineraryDays: true,
          routeOrigins: true,
          routeDestinations: true,
          cabBookingsPickup: true,
          cabBookingsDrop: true,
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;

  if (!city) throw new AppError("City not found", 404);

  const totalUsages =
    city._count.serviceLocations +
    city._count.itineraryDays +
    city._count.routeOrigins +
    city._count.routeDestinations +
    city._count.cabBookingsPickup +
    city._count.cabBookingsDrop;

  if (totalUsages > 0) {
    throw new AppError(
      `Cannot delete city because it is actively used in ${totalUsages} records`,
      400,
    );
  }

  await prisma.city.delete({ where: { id } });

  res.json({
    success: true,
    message: "City deleted successfully",
  });
});
