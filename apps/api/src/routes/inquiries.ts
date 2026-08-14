import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { inquiryService } from "../services/inquiry.service.js";
import { inquiryCreateSchema, inquiryUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const inquiriesRouter = Router();
const controller = createCrudController(inquiryService, inquiryCreateSchema, inquiryUpdateSchema);

registerCrudRoutes(inquiriesRouter, controller, true);
