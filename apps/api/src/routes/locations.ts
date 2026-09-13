import { Router } from "express";
import {
  getStates,
  createState,
  updateState,
  deleteState,
  getCities,
  getCityBySlugOrId,
  createCity,
  updateCity,
  deleteCity,
} from "../controllers/location.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

export const locationsRouter = Router();
export const adminLocationsRouter = Router();

// --- PUBLIC ROUTES ---
locationsRouter.get("/states", getStates);
locationsRouter.get("/cities", getCities);
locationsRouter.get("/cities/:id", getCityBySlugOrId);

// --- ADMIN ROUTES ---
adminLocationsRouter.use(authenticate, requireAdmin);

adminLocationsRouter.post("/states", createState);
adminLocationsRouter.put("/states/:id", updateState);
adminLocationsRouter.delete("/states/:id", deleteState);

adminLocationsRouter.post("/cities", createCity);
adminLocationsRouter.put("/cities/:id", updateCity);
adminLocationsRouter.delete("/cities/:id", deleteCity);
