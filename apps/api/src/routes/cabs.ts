import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { cabService } from "../services/cab.service.js";
import { vehicleCreateSchema, vehicleUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const cabsRouter = Router();
const controller = createCrudController(cabService, vehicleCreateSchema, vehicleUpdateSchema);

registerCrudRoutes(cabsRouter, controller);
