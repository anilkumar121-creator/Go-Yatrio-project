import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { hotelService } from "../services/hotel.service.js";
import { hotelCreateSchema, hotelUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const hotelsRouter = Router();
const controller = createCrudController(hotelService, hotelCreateSchema, hotelUpdateSchema);

registerCrudRoutes(hotelsRouter, controller);
