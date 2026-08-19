import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessage, sendSuccess } from "../utils/api-response.js";
import { lookupService } from "../services/lookup.service.js";
import { idParamSchema, optionalPaginationSchema } from "../validators/common.js";
import {
  lookupGroupCreateSchema,
  lookupGroupUpdateSchema,
  lookupItemCreateSchema,
  lookupItemOrderSchema,
  lookupItemStatusSchema,
  lookupItemUpdateSchema,
} from "../validators/schemas.js";

// Public
export const getLookups: RequestHandler = asyncHandler(async (request, response) => {
  const keys = (request.query.groupKey as string | undefined)?.split(",").filter(Boolean) ?? [];

  if (keys.length > 0) {
    const groups = await Promise.all(keys.map((key) => lookupService.getGroupByKey(key)));
    const payload = groups
      .filter((group) => group !== null)
      .map((group) => ({ key: group!.key, name: group!.name, items: group!.items }));

    sendSuccess(response, payload);
    return;
  }

  const groups = await lookupService.listGroups({ take: 200 });
  sendSuccess(response, groups);
});

export const getLookupsByGroup: RequestHandler = asyncHandler(async (request, response) => {
  const key = request.params.groupKey as string;
  const group = await lookupService.getGroupByKey(key);

  if (!group) {
    throw new AppError("Lookup group not found.", 404, "LOOKUP_GROUP_NOT_FOUND");
  }

  sendSuccess(response, { key: group.key, name: group.name, items: group.items });
});

// Admin: Groups
export const adminListGroups: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const search = (request.query.search as string | undefined) ?? undefined;
  const data = await lookupService.listGroups({ search, take: query.take, skip: query.skip });
  sendSuccess(response, data);
});

export const adminCreateGroup: RequestHandler = asyncHandler(async (request, response) => {
  const payload = lookupGroupCreateSchema.parse(request.body);
  const data = await lookupService.createGroup(payload);
  sendSuccess(response, data, 201);
});

export const adminUpdateGroup: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = lookupGroupUpdateSchema.parse(request.body);
  const data = await lookupService.updateGroup(id, payload);
  sendSuccess(response, data);
});

export const adminDeleteGroup: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await lookupService.removeGroup(id);
  sendMessage(response, "Lookup group deleted.");
});

// Admin: Items
export const adminListItems: RequestHandler = asyncHandler(async (request, response) => {
  const query = optionalPaginationSchema.parse(request.query);
  const groupId = (request.query.groupId as string | undefined) ?? undefined;
  const search = (request.query.search as string | undefined) ?? undefined;
  const isActive =
    request.query.isActive === "true"
      ? true
      : request.query.isActive === "false"
        ? false
        : undefined;
  const data = await lookupService.listItems({
    groupId,
    search,
    isActive,
    take: query.take,
    skip: query.skip,
  });
  sendSuccess(response, data);
});

export const adminCreateItem: RequestHandler = asyncHandler(async (request, response) => {
  const payload = lookupItemCreateSchema.parse(request.body);
  const data = await lookupService.createItem(payload);
  sendSuccess(response, data, 201);
});

export const adminUpdateItem: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = lookupItemUpdateSchema.parse(request.body);
  const data = await lookupService.updateItem(id, payload);
  sendSuccess(response, data);
});

export const adminDeleteItem: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  await lookupService.removeItem(id);
  sendMessage(response, "Lookup item deleted.");
});

export const adminSetItemStatus: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = lookupItemStatusSchema.parse(request.body);
  const data = await lookupService.setItemStatus(id, payload.isActive);
  sendSuccess(response, data);
});

export const adminSetItemOrder: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = idParamSchema.parse(request.params);
  const payload = lookupItemOrderSchema.parse(request.body);
  const data = await lookupService.setItemOrder(id, payload.sortOrder);
  sendSuccess(response, data);
});
