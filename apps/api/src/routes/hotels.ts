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

export const hotelsRouter = Router();

// Public Hotel Routes
hotelsRouter.get("/", listHotels);
hotelsRouter.get("/search", searchHotels);
hotelsRouter.get("/featured", getFeaturedHotels);
hotelsRouter.get("/destination/:slug", getHotelsByDestination);
hotelsRouter.get("/:slug", getHotelBySlug);
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
