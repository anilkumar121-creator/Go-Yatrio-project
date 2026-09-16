import { Router } from "express";
import { getBooking } from "../controllers/booking.controller.js";
import { optionalAuth } from "../middleware/auth.js";

export const bookingsRouter = Router();

bookingsRouter.get("/:id", optionalAuth, getBooking);
