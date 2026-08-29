import type { Request, Response } from "express";
import { itineraryService } from "../services/itinerary.service.js";
import {
  activityCreateSchema,
  activityUpdateSchema,
  dayCreateSchema,
  dayUpdateSchema,
  itineraryCreateSchema,
  itineraryUpdateSchema,
  reorderDaysSchema,
} from "../validators/schemas.js";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export async function listItineraries(req: Request, res: Response) {
  const take = Number(req.query.take) || 50;
  const skip = Number(req.query.skip) || 0;
  const packageId = req.query.packageId as string | undefined;

  const result = await itineraryService.list(take, skip, packageId);

  res.json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
      take,
      skip,
    },
  });
}

export async function getItinerary(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const itinerary = await itineraryService.get(id);

  if (!itinerary) {
    res.status(404).json({
      success: false,
      error: "Itinerary not found",
    });
    return;
  }

  res.json({
    success: true,
    data: itinerary,
  });
}

export async function createItinerary(req: Request, res: Response) {
  const validated = itineraryCreateSchema.parse(req.body);
  const created = await itineraryService.create(validated);

  res.status(201).json({
    success: true,
    message: "Itinerary created successfully",
    data: created,
  });
}

export async function updateItinerary(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = itineraryUpdateSchema.parse(req.body);

  const existing = await itineraryService.get(id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: "Itinerary not found",
    });
    return;
  }

  const updated = await itineraryService.update(id, validated);

  res.json({
    success: true,
    message: "Itinerary updated successfully",
    data: updated,
  });
}

export async function deleteItinerary(req: Request, res: Response) {
  const id = getParam(req.params.id);

  const existing = await itineraryService.get(id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: "Itinerary not found",
    });
    return;
  }

  await itineraryService.remove(id);

  res.json({
    success: true,
    message: "Itinerary deleted successfully",
  });
}

export async function addDay(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = dayCreateSchema.parse(req.body);

  const existing = await itineraryService.get(id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: "Itinerary not found",
    });
    return;
  }

  const createdDay = await itineraryService.addDay(id, validated);

  res.status(201).json({
    success: true,
    message: "Itinerary day added successfully",
    data: createdDay,
  });
}

export async function updateDay(req: Request, res: Response) {
  const dayId = getParam(req.params.dayId);
  const validated = dayUpdateSchema.parse(req.body);

  const updatedDay = await itineraryService.updateDay(dayId, validated);

  res.json({
    success: true,
    message: "Itinerary day updated successfully",
    data: updatedDay,
  });
}

export async function removeDay(req: Request, res: Response) {
  const dayId = getParam(req.params.dayId);

  await itineraryService.removeDay(dayId);

  res.json({
    success: true,
    message: "Itinerary day removed successfully",
  });
}

export async function reorderDays(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = reorderDaysSchema.parse(req.body);

  const dayOrders = validated.dayOrders.map((d) => ({
    dayId: d.id,
    sortOrder: d.sortOrder,
    dayNumber: d.dayNumber,
  }));

  const updatedItinerary = await itineraryService.reorderDays(id, dayOrders);

  res.json({
    success: true,
    message: "Itinerary days reordered successfully",
    data: updatedItinerary,
  });
}

export async function addActivity(req: Request, res: Response) {
  const dayId = getParam(req.params.dayId);
  const validated = activityCreateSchema.parse(req.body);

  const createdActivity = await itineraryService.addActivity(dayId, validated);

  res.status(201).json({
    success: true,
    message: "Activity added successfully",
    data: createdActivity,
  });
}

export async function updateActivity(req: Request, res: Response) {
  const activityId = getParam(req.params.activityId);
  const validated = activityUpdateSchema.parse(req.body);

  const updatedActivity = await itineraryService.updateActivity(activityId, validated);

  res.json({
    success: true,
    message: "Activity updated successfully",
    data: updatedActivity,
  });
}

export async function removeActivity(req: Request, res: Response) {
  const activityId = getParam(req.params.activityId);

  await itineraryService.removeActivity(activityId);

  res.json({
    success: true,
    message: "Activity removed successfully",
  });
}
