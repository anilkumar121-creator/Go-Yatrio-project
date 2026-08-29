import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessage, sendSuccess, sendPaginated } from "../utils/api-response.js";
import { inquiryService } from "../services/inquiry.service.js";
import {
  idParamSchema,
  noteIdParamSchema,
  optionalPaginationSchema,
} from "../validators/common.js";
import {
  inquiryCreateSchema,
  inquiryUpdateSchema,
  inquiryStatusUpdateSchema,
  inquiryPriorityUpdateSchema,
  inquiryAssignSchema,
  inquiryNoteCreateSchema,
  inquiryNoteUpdateSchema,
} from "../validators/schemas.js";
import { InquiryStatusNew, InquiryPriority, InquirySource, InquiryType } from "../db.js";

import type { Request } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string; email: string; role: string };
}

function getUserId(request: AuthenticatedRequest): string {
  return request.user?.id ?? "admin";
}

function castToEnum<T extends string>(
  value: string | undefined,
  enumObj: Record<string, T>,
): T | undefined {
  if (!value) return undefined;
  const upperValue = value.toUpperCase();
  return enumObj[upperValue];
}

// Public API
export const createInquiry: RequestHandler = asyncHandler(async (request, response) => {
  const payload = inquiryCreateSchema.parse(request.body);
  const data = await inquiryService.create(payload);
  sendSuccess(response, { inquiryNumber: data.inquiryNumber, id: data.id }, 201);
});

export const getInquirySuccess: RequestHandler = asyncHandler(async (request, response) => {
  const { ref } = request.query;
  if (!ref || typeof ref !== "string") {
    throw new AppError("Reference number required.", 400, "MISSING_REFERENCE");
  }
  const inquiry = await inquiryService.getByInquiryNumber(ref);
  if (!inquiry) {
    throw new AppError("Inquiry not found.", 404, "INQUIRY_NOT_FOUND");
  }
  sendSuccess(response, { inquiryNumber: inquiry.inquiryNumber, status: inquiry.status });
});

// Admin API
export const adminListInquiries: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = (request.query.search as string | undefined) ?? undefined;
  const status = castToEnum(request.query.status as string | undefined, InquiryStatusNew);
  const priority = castToEnum(request.query.priority as string | undefined, InquiryPriority);
  const source = castToEnum(request.query.source as string | undefined, InquirySource);
  const type = castToEnum(request.query.type as string | undefined, InquiryType);
  const assignedTo = (request.query.assignedTo as string | undefined) ?? undefined;
  const dateFrom = request.query.dateFrom ? new Date(request.query.dateFrom as string) : undefined;
  const dateTo = request.query.dateTo ? new Date(request.query.dateTo as string) : undefined;
  const sortBy = (request.query.sortBy as string | undefined) ?? "createdAt";
  const sortOrder = (request.query.sortOrder as "asc" | "desc" | undefined) ?? "desc";

  const data = await inquiryService.list({
    search,
    status,
    priority,
    source,
    type,
    assignedTo,
    dateFrom,
    dateTo,
    take: query.take,
    skip: query.skip,
    sortBy,
    sortOrder,
  });

  sendPaginated(response, data.items, data.total, data.page, data.pageSize);
});

export const adminGetInquiry: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const data = await inquiryService.getById(id);
  if (!data) {
    throw new AppError("Inquiry not found.", 404, "INQUIRY_NOT_FOUND");
  }
  sendSuccess(response, data);
});

export const adminCreateInquiry: RequestHandler = asyncHandler(async (request, response) => {
  const payload = inquiryCreateSchema.parse(request.body);
  const data = await inquiryService.create(payload);
  sendSuccess(response, data, 201);
});

export const adminUpdateInquiry: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = inquiryUpdateSchema.parse(request.body);
  const userId = getUserId(request as AuthenticatedRequest);
  const data = await inquiryService.update(id, payload, userId);
  sendSuccess(response, data);
});

export const adminDeleteInquiry: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await inquiryService.delete(id);
  sendMessage(response, "Inquiry deleted.");
});

// Lead Management
export const adminUpdateInquiryStatus: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = inquiryStatusUpdateSchema.parse(request.body);
  const userId = getUserId(request as AuthenticatedRequest);
  const data = await inquiryService.updateStatus(id, payload.status, userId);
  sendSuccess(response, data);
});

export const adminUpdateInquiryPriority: RequestHandler = asyncHandler(
  async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const payload = inquiryPriorityUpdateSchema.parse(request.body);
    const userId = getUserId(request as AuthenticatedRequest);
    const data = await inquiryService.updatePriority(id, payload.priority, userId);
    sendSuccess(response, data);
  },
);

export const adminAssignInquiry: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = inquiryAssignSchema.parse(request.body);
  const userId = getUserId(request as AuthenticatedRequest);
  const data = await inquiryService.assign(id, payload.assignedTo, userId);
  sendSuccess(response, data);
});

// Notes
export const adminAddNote: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = inquiryNoteCreateSchema.parse({
    ...request.body,
    createdBy: getUserId(request as AuthenticatedRequest),
  });
  const data = await inquiryService.addNote(id, payload.note, payload.createdBy);
  sendSuccess(response, data, 201);
});

export const adminUpdateNote: RequestHandler = asyncHandler(async (request, response) => {
  const { noteId } = noteIdParamSchema.parse(request.params);
  const payload = inquiryNoteUpdateSchema.parse(request.body);
  const data = await inquiryService.updateNote(noteId, payload.note);
  sendSuccess(response, data);
});

export const adminDeleteNote: RequestHandler = asyncHandler(async (request, response) => {
  const { noteId } = noteIdParamSchema.parse(request.params);
  await inquiryService.deleteNote(noteId);
  sendMessage(response, "Note deleted.");
});

export const adminGetNotes: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const data = await inquiryService.getNotes(id);
  sendSuccess(response, data);
});

// Activities
export const adminGetActivities: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const data = await inquiryService.getActivities(id);
  sendSuccess(response, data);
});

// Assignments
export const adminGetAssignments: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const data = await inquiryService.getAssignments(id);
  sendSuccess(response, data);
});

// Stats
export const adminGetInquiryStats: RequestHandler = asyncHandler(async (request, response) => {
  const data = await inquiryService.getStats();
  sendSuccess(response, data);
});

// Recent
export const adminGetRecentInquiries: RequestHandler = asyncHandler(async (request, response) => {
  const limit = request.query.limit ? parseInt(request.query.limit as string, 10) : 10;
  const data = await inquiryService.getRecent(limit);
  sendSuccess(response, data);
});
