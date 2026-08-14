import { Router } from "express";
import { createCrudController } from "../controllers/crud.controller.js";
import { blogService } from "../services/blog.service.js";
import { blogCreateSchema, blogUpdateSchema } from "../validators/schemas.js";
import { registerCrudRoutes } from "./resource.js";

export const blogsRouter = Router();
const controller = createCrudController(blogService, blogCreateSchema, blogUpdateSchema);

registerCrudRoutes(blogsRouter, controller);
