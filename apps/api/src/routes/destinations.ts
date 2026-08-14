import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { destinationService } from "../services/destination.service.js";
import { destinationCreateSchema, destinationUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const destinationsRouter = Router();
const controller = createCrudController(destinationService, destinationCreateSchema, destinationUpdateSchema);

registerCrudRoutes(destinationsRouter, controller);
