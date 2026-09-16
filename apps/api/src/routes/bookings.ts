import { Router } from "express";
import { getBooking, getBookings } from "../controllers/booking.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

export const bookingsRouter = Router();

bookingsRouter.get("/", authenticate, getBookings);
bookingsRouter.get("/:id", optionalAuth, getBooking);
