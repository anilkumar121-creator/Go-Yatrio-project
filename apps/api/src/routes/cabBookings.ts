import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminGetCabBooking,
  adminListCabBookings,
  adminUpdateCabBookingStatus,
  createCabBooking,
} from "../controllers/cabBooking.controller.js";

export const cabBookingsRouter = Router();
// Public can create bookings
cabBookingsRouter.post("/", createCabBooking);

// Admin Routes
export const adminCabBookingsRouter = Router();
adminCabBookingsRouter.use(authenticate, requireAdmin);

adminCabBookingsRouter.get("/", adminListCabBookings);
adminCabBookingsRouter.get("/:id", adminGetCabBooking);
adminCabBookingsRouter.patch("/:id/status", adminUpdateCabBookingStatus);
