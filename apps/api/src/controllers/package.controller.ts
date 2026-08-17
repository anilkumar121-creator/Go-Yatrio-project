import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessage, sendSuccess } from "../utils/api-response.js";
import { packageService } from "../services/package.service.js";
import {
  packageAvailabilitySchema,
  packageCreateSchema,
  packageFeaturedSchema,
  packageOfferSchema,
  packageSeasonalPriceSchema,
  packageStatusSchema,
  packageUpdateSchema,
} from "../validators/schemas.js";
import { idParamSchema, optionalPaginationSchema } from "../validators/common.js";

export const listPackages: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = (request.query.search as string | undefined) ?? undefined;
  const packageType = (request.query.packageType as string | undefined) ?? undefined;
  const destinationId = (request.query.destinationId as string | undefined) ?? undefined;
  const featuredOnly = request.query.featured === "true";
  const availability = (request.query.availability as "AVAILABLE" | "LIMITED_SEATS" | "SOLD_OUT" | "UPCOMING" | undefined) ?? undefined;
  const sort = (request.query.sort as "price_asc" | "price_desc" | "duration_asc" | "duration_desc" | "newest" | undefined) ?? "newest";

  const [data, total] = await Promise.all([
    packageService.listPublished({
      take: query.take,
      skip: query.skip,
      search,
      packageType,
      destinationId,
      featuredOnly,
      availability,
      sort,
    }),
    packageService.count({ search, packageType, destinationId, status: "PUBLISHED" }),
  ]);

  sendSuccess(response, { data, total });
});

export const getPackageBySlug: RequestHandler = asyncHandler(async (request, response) => {
  const slug = request.params.slug as string | undefined;

  if (!slug) {
    throw new AppError("Package slug is required.", 400, "SLUG_REQUIRED");
  }

  const data = await packageService.getBySlug(slug, true);

  if (!data) {
    throw new AppError("Tour package not found.", 404, "PACKAGE_NOT_FOUND");
  }

  sendSuccess(response, data);
});

export const adminListPackages: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = (request.query.search as string | undefined) ?? undefined;
  const packageType = (request.query.packageType as string | undefined) ?? undefined;
  const destinationId = (request.query.destinationId as string | undefined) ?? undefined;
  const status = (request.query.status as string | undefined) ?? undefined;

  const [data, total] = await Promise.all([
    packageService.list({ take: query.take, skip: query.skip, search, packageType, destinationId, status }),
    packageService.count({ search, packageType, destinationId, status }),
  ]);

  sendSuccess(response, { data, total });
});

export const createPackage: RequestHandler = asyncHandler(async (request, response) => {
  const payload = packageCreateSchema.parse(request.body);
  const data = await packageService.create(payload);

  sendSuccess(response, data, 201);
});

export const updatePackage: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageUpdateSchema.parse(request.body);
  const data = await packageService.update(id, payload);

  sendSuccess(response, data);
});

export const deletePackage: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await packageService.remove(id);

  sendMessage(response, "Tour package removed.");
});

export const updatePackageStatus: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageStatusSchema.parse(request.body);
  const data = await packageService.updateStatus(id, payload.status);

  sendSuccess(response, data);
});

export const updatePackageFeatured: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageFeaturedSchema.parse(request.body);
  const data = await packageService.updateFeatured(id, payload.featured);

  sendSuccess(response, data);
});
export const updatePackageAvailability: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageAvailabilitySchema.parse(request.body);
  const data = await packageService.updateAvailability(id, payload.availability, payload.availableSeats);

  sendSuccess(response, data);
});

export const addPackageSeasonalPrice: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageSeasonalPriceSchema.parse(request.body);
  const data = await packageService.addSeasonalPrice(id, payload);

  sendSuccess(response, data, 201);
});

export const updatePackageSeasonalPrice: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageSeasonalPriceSchema.parse(request.body);
  const data = await packageService.updateSeasonalPrice(id, payload);

  sendSuccess(response, data);
});

export const deletePackageSeasonalPrice: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await packageService.removeSeasonalPrice(id);

  sendMessage(response, "Seasonal price removed.");
});

export const addPackageOffer: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageOfferSchema.parse(request.body);
  const data = await packageService.addOffer(id, payload);

  sendSuccess(response, data, 201);
});

export const updatePackageOffer: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = packageOfferSchema.parse(request.body);
  const data = await packageService.updateOffer(id, payload);

  sendSuccess(response, data);
});

export const deletePackageOffer: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await packageService.removeOffer(id);

  sendMessage(response, "Offer removed.");
});
