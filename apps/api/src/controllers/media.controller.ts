import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessage, sendSuccess } from "../utils/api-response.js";
import { mediaService } from "../services/media.service.js";
import { mediaLinkService } from "../services/media-link.service.js";
import { idParamSchema, optionalPaginationSchema } from "../validators/common.js";
import { generateUploadSignature, normalizeResourceType, uploadMediaBuffer, validateFileSize, validateMimeType } from "../utils/cloudinary.js";
import { z } from "zod";

const mediaUploadSchema = z.object({
  fileName: z.string().max(255).optional(),
  mimeType: z.string().min(1),
  dataUri: z.string().min(20),
  folder: z.string().max(200).optional(),
  tags: z.array(z.string().max(80)).max(30).optional(),
  altText: z.string().max(300).optional(),
  caption: z.string().max(1000).optional(),
});

const mediaMetadataSchema = z.object({
  altText: z.string().max(300).optional(),
  caption: z.string().max(1000).optional(),
  tags: z.array(z.string().max(80)).max(30).optional(),
  folder: z.string().max(200).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

function decodeDataUri(dataUri: string): Buffer {
  const base64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
  return Buffer.from(base64, "base64");
}

export const listMedia: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = (request.query.search as string | undefined) ?? undefined;
  const resourceType = (request.query.type as "IMAGE" | "VIDEO" | "RAW" | undefined) ?? undefined;
  const folder = (request.query.folder as string | undefined) ?? undefined;
  const tag = (request.query.tag as string | undefined) ?? undefined;
  const status = (request.query.status as "ACTIVE" | "ARCHIVED" | undefined) ?? undefined;

  const [data, total] = await Promise.all([
    mediaService.list({
      take: query.take,
      skip: query.skip,
      search,
      resourceType,
      folder,
      tag,
      status,
    }),
    mediaService.count({ search, resourceType, folder, tag, status }),
  ]);

  sendSuccess(response, { data, total });
});

export const getMedia: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const data = await mediaService.get(id);

  if (!data || data.deletedAt) {
    throw new AppError("Media asset not found.", 404, "MEDIA_NOT_FOUND");
  }

  sendSuccess(response, data);
});

export const uploadMedia: RequestHandler = asyncHandler(async (request, response) => {
  const payload = mediaUploadSchema.parse(request.body);

  const mimeType = payload.mimeType.toLowerCase();
  if (!validateMimeType(mimeType)) {
    throw new AppError(`File type not allowed: ${mimeType}`, 400, "MEDIA_TYPE_NOT_ALLOWED");
  }

  const buffer = decodeDataUri(payload.dataUri);
  if (!validateFileSize(buffer.length, mimeType)) {
    throw new AppError("File exceeds the allowed size limit.", 400, "MEDIA_TOO_LARGE");
  }

  const folder = payload.folder ?? "goyatrio";
  const resourceType = normalizeResourceType(mimeType);
  const upload = await uploadMediaBuffer(buffer, {
    folder,
    mimeType,
    tags: payload.tags,
  });

  const created = await mediaService.createFromUpload({
    publicId: upload.publicId,
    url: upload.url,
    secureUrl: upload.secureUrl,
    resourceType: resourceType.toUpperCase() as "IMAGE" | "VIDEO" | "RAW",
    mimeType,
    format: upload.format,
    folder,
    fileName: payload.fileName,
    width: upload.width,
    height: upload.height,
    size: upload.bytes,
    durationSeconds: upload.durationSeconds,
    altText: payload.altText,
    caption: payload.caption,
    tags: payload.tags,
    createdBy: (request as AuthenticatedRequest).user?.sub,
  });

  sendSuccess(response, created, 201);
});

export const getUploadSignature: RequestHandler = asyncHandler(async (request, response) => {
  const resourceType = (request.query.type as "image" | "video" | "raw" | undefined) ?? "image";
  const folder = (request.query.folder as string | undefined) ?? "goyatrio";

  const signature = generateUploadSignature({ folder, resourceType });
  sendSuccess(response, signature);
});

export const replaceMedia: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = mediaUploadSchema.parse(request.body);

  const existing = await mediaService.get(id);
  if (!existing) {
    throw new AppError("Media asset not found.", 404, "MEDIA_NOT_FOUND");
  }

  const mimeType = payload.mimeType.toLowerCase();
  if (!validateMimeType(mimeType)) {
    throw new AppError(`File type not allowed: ${mimeType}`, 400, "MEDIA_TYPE_NOT_ALLOWED");
  }

  const buffer = decodeDataUri(payload.dataUri);
  if (!validateFileSize(buffer.length, mimeType)) {
    throw new AppError("File exceeds the allowed size limit.", 400, "MEDIA_TOO_LARGE");
  }

  const upload = await uploadMediaBuffer(buffer, {
    folder: existing.folder ?? payload.folder,
    publicId: existing.publicId,
    mimeType,
    overwrite: true,
    tags: payload.tags,
  });

  const updated = await mediaService.replaceUpload(id, {
    publicId: existing.publicId,
    url: upload.url,
    secureUrl: upload.secureUrl,
    resourceType: normalizeResourceType(mimeType).toUpperCase() as "IMAGE" | "VIDEO" | "RAW",
    mimeType,
    format: upload.format,
    width: upload.width,
    height: upload.height,
    size: upload.bytes,
    durationSeconds: upload.durationSeconds,
  });

  sendSuccess(response, updated);
});

export const updateMediaMetadata: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = mediaMetadataSchema.parse(request.body);

  const data = await mediaService.updateMetadata(id, payload);
  sendSuccess(response, data);
});

export const deleteMedia: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);

  const removed = await mediaService.remove(id);
  if (!removed) {
    throw new AppError("Media asset not found.", 404, "MEDIA_NOT_FOUND");
  }

  sendMessage(response, "Media asset deleted.");
});

export const listMediaLinks: RequestHandler = asyncHandler(async (request, response) => {
  const module = (request.query.module as string | undefined) ?? "";
  const moduleId = (request.query.moduleId as string | undefined) ?? "";

  if (!module || !moduleId) {
    throw new AppError("module and moduleId query params are required.", 400, "MEDIA_LINK_PARAMS_REQUIRED");
  }

  const data = await mediaService.getLinks(module, moduleId);
  sendSuccess(response, data);
});

export const createMediaLink: RequestHandler = asyncHandler(async (request, response) => {
  const payload = z
    .object({
      mediaId: z.string().min(1),
      module: z.enum(["DESTINATION", "PACKAGE", "HOTEL", "CAB", "BLOG", "HOMEPAGE"]),
      moduleId: z.string().min(1),
      role: z.enum(["FEATURED", "GALLERY", "VIDEO", "DOCUMENT"]).optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
    })
    .parse(request.body);

  const data = await mediaLinkService.attachMedia(payload);
  sendSuccess(response, data, 201);
});

export const updateMediaLinkSortOrder: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = z.object({ sortOrder: z.coerce.number().int().min(0) }).parse(request.body);

  const data = await mediaLinkService.updateSortOrder(id, payload.sortOrder);
  sendSuccess(response, data);
});

export const updateMediaLinkRole: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = z.object({ role: z.enum(["FEATURED", "GALLERY", "VIDEO", "DOCUMENT"]) }).parse(request.body);

  const data = await mediaLinkService.updateRole(id, payload.role);
  sendSuccess(response, data);
});

export const deleteMediaLink: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await mediaService.deleteLink(id);
  sendMessage(response, "Media link removed.");
});
