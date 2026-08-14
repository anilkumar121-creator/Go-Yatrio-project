import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { packageService } from "../services/package.service.js";
import { packageCreateSchema, packageUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const packagesRouter = Router();
const controller = createCrudController(packageService, packageCreateSchema, packageUpdateSchema);

registerCrudRoutes(packagesRouter, controller);
