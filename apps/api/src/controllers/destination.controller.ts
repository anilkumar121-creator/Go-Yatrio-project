import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessage, sendSuccess } from "../utils/api-response.js";
import { destinationService } from "../services/destination.service.js";
import {
  destinationCreateSchema,
  destinationFeaturedSchema,
  destinationStatusSchema,
  destinationUpdateSchema,
} from "../validators/schemas.js";
import { idParamSchema, optionalPaginationSchema } from "../validators/common.js";

export const listDestinations: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = typeof request.query.search === "string" ? request.query.search : undefined;
  const featuredOnly = request.query.featured === "true";

  const [data, total] = await Promise.all([
    destinationService.listPublished({
      take: query.take,
      skip: query.skip,
      search,
      featuredOnly,
    }),
    destinationService.count({ search }),
  ]);

  sendSuccess(response, { data, total });
});

export const getDestinationBySlug: RequestHandler = asyncHandler(async (request, response) => {
  const slug = request.params.slug as string | undefined;

  if (!slug) {
    throw new AppError("Destination slug is required.", 400, "SLUG_REQUIRED");
  }

  const data = await destinationService.getBySlug(slug, true);

  if (!data) {
    throw new AppError("Destination not found.", 404, "DESTINATION_NOT_FOUND");
  }

  sendSuccess(response, data);
});

export const adminListDestinations: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = (request.query.search as string | undefined) ?? undefined;
  const status = (request.query.status as string | undefined) ?? undefined;
  const country = (request.query.country as string | undefined) ?? undefined;

  const [data, total] = await Promise.all([
    destinationService.list({ take: query.take, skip: query.skip, search, status: status ?? undefined, country: country ?? undefined }),
    destinationService.count({ search, status: status ?? undefined, country: country ?? undefined }),
  ]);

  sendSuccess(response, { data, total });
});

export const createDestination: RequestHandler = asyncHandler(async (request, response) => {
  const payload = destinationCreateSchema.parse(request.body);
  const data = await destinationService.create(payload);

  sendSuccess(response, data, 201);
});

export const updateDestination: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = destinationUpdateSchema.parse(request.body);
  const data = await destinationService.update(id, payload);

  sendSuccess(response, data);
});

export const deleteDestination: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await destinationService.remove(id);

  sendMessage(response, "Destination removed.");
});

export const updateDestinationStatus: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = destinationStatusSchema.parse(request.body);
  const data = await destinationService.updateStatus(id, payload.status);

  sendSuccess(response, data);
});

export const updateDestinationFeatured: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = destinationFeaturedSchema.parse(request.body);
  const data = await destinationService.updateFeatured(id, payload.featured);

  sendSuccess(response, data);
});