import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { itineraryService } from "../services/itinerary.service.js";
import { itineraryCreateSchema, itineraryUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const itinerariesRouter = Router();
const controller = createCrudController(itineraryService, itineraryCreateSchema, itineraryUpdateSchema);

registerCrudRoutes(itinerariesRouter, controller);
