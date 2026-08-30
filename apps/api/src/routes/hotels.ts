import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminGetHotel,
  adminListHotels,
  createHotel,
  deleteHotel,
  getAmenities,
  getFeaturedHotels,
  getHotelBySlug,
  getHotelsByDestination,
  listHotels,
  searchHotels,
  submitHotelInquiry,
  updateHotel,
  updateHotelStatus,
} from "../controllers/hotel.controller.js";

import { publicCacheControl } from "../middleware/cache-control.js";

export const hotelsRouter = Router();

// Public Hotel Routes
hotelsRouter.get("/", publicCacheControl(300, 600), listHotels);
hotelsRouter.get("/search", publicCacheControl(180, 360), searchHotels);
hotelsRouter.get("/featured", publicCacheControl(300, 600), getFeaturedHotels);
hotelsRouter.get("/destination/:slug", publicCacheControl(300, 600), getHotelsByDestination);
hotelsRouter.get("/:slug", publicCacheControl(300, 600), getHotelBySlug);
hotelsRouter.post("/:id/inquiry", submitHotelInquiry);

// Admin Hotel Routes
export const adminHotelsRouter = Router();
adminHotelsRouter.use(authenticate, requireAdmin);

adminHotelsRouter.get("/", adminListHotels);
adminHotelsRouter.get("/amenities", getAmenities);
adminHotelsRouter.get("/:id", adminGetHotel);
adminHotelsRouter.post("/", createHotel);
adminHotelsRouter.put("/:id", updateHotel);
adminHotelsRouter.delete("/:id", deleteHotel);
adminHotelsRouter.patch("/:id/status", updateHotelStatus);
