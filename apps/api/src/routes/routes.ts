import { Router } from "express";
import { calculateRoute } from "../controllers/route.controller.js";

export const routesRouter = Router();

// --- ROUTE CALCULATION (Phase 184) ---
routesRouter.post("/calculate", calculateRoute);
