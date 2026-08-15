import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  addActivity,
  addDay,
  createItinerary,
  deleteItinerary,
  getItinerary,
  listItineraries,
  reorderDays,
  removeActivity,
  removeDay,
  updateActivity,
  updateDay,
  updateItinerary,
} from "../controllers/itinerary.controller.js";

export const itinerariesRouter = Router();

// Public routes
itinerariesRouter.get("/", listItineraries);
itinerariesRouter.get("/:id", getItinerary);

// Admin-only routes
export const adminItinerariesRouter = Router();
adminItinerariesRouter.use(authenticate, requireAdmin);

adminItinerariesRouter.get("/", listItineraries);
adminItinerariesRouter.get("/:id", getItinerary);
adminItinerariesRouter.post("/", createItinerary);
adminItinerariesRouter.put("/:id", updateItinerary);
adminItinerariesRouter.delete("/:id", deleteItinerary);

// Days management
adminItinerariesRouter.post("/:id/days", addDay);
adminItinerariesRouter.put("/days/:dayId", updateDay);
adminItinerariesRouter.delete("/days/:dayId", removeDay);
adminItinerariesRouter.patch("/:id/reorder-days", reorderDays);

// Activities management
adminItinerariesRouter.post("/days/:dayId/activities", addActivity);
adminItinerariesRouter.put("/activities/:activityId", updateActivity);
adminItinerariesRouter.delete("/activities/:activityId", removeActivity);
