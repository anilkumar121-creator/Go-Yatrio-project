import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { routeService } from "../services/route/route.service.js";

const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const calculateRouteSchema = z.object({
  origin: coordinateSchema,
  destination: coordinateSchema,
  stops: z.array(coordinateSchema).max(20).optional(), // Max 20 stops
});

export const calculateRoute = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = calculateRouteSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw new AppError("Invalid coordinates or missing required fields.", 400);
  }

  const { origin, destination, stops = [] } = parseResult.data;

  // Compile all waypoints in order: origin -> stops -> destination
  const waypoints = [origin, ...stops, destination];

  const result = await routeService.calculateRoute(waypoints);

  res.json({
    success: true,
    data: result,
  });
});
