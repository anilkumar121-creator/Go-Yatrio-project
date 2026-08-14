import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { mediaService } from "../services/media.service.js";
import { mediaCreateSchema, mediaUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const mediaRouter = Router();
const controller = createCrudController(mediaService, mediaCreateSchema, mediaUpdateSchema);

registerCrudRoutes(mediaRouter, controller);
