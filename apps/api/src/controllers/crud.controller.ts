import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMessage, sendSuccess } from "../utils/api-response.js";
import { idParamSchema, optionalPaginationSchema } from "../validators/common.js";

type CrudService<TCreate, TUpdate> = {
  list: (take?: number, skip?: number) => Promise<unknown>;
  get: (id: string) => Promise<unknown>;
  create: (data: TCreate) => Promise<unknown>;
  update: (id: string, data: TUpdate) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
};

function normalizePrismaError(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  ) {
    throw new AppError("Resource not found.", 404, "RESOURCE_NOT_FOUND");
  }

  throw error;
}

export function createCrudController<TCreate, TUpdate>(
  service: CrudService<TCreate, TUpdate>,
  createSchema: ZodType<TCreate>,
  updateSchema: ZodType<TUpdate>,
) {
  return {
    list: asyncHandler(async (request, response) => {
      const query = optionalPaginationSchema.parse(request.query);
      const data = await service.list(query.take, query.skip);

      sendSuccess(response, data);
    }),
    get: asyncHandler(async (request, response) => {
      const { id } = idParamSchema.parse(request.params);
      const data = await service.get(id);

      if (!data) {
        throw new AppError("Resource not found.", 404, "RESOURCE_NOT_FOUND");
      }

      sendSuccess(response, data);
    }),
    create: asyncHandler(async (request, response) => {
      const payload = createSchema.parse(request.body);

      try {
        sendSuccess(response, await service.create(payload), 201);
      } catch (error) {
        normalizePrismaError(error);
      }
    }),
    update: asyncHandler(async (request, response) => {
      const { id } = idParamSchema.parse(request.params);
      const payload = updateSchema.parse(request.body);

      try {
        sendSuccess(response, await service.update(id, payload));
      } catch (error) {
        normalizePrismaError(error);
      }
    }),
    remove: asyncHandler(async (request, response) => {
      const { id } = idParamSchema.parse(request.params);

      try {
        await service.remove(id);
        sendMessage(response, "Resource removed.");
      } catch (error) {
        normalizePrismaError(error);
      }
    }),
  };
}
