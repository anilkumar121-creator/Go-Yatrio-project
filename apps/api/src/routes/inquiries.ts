import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminAssignInquiry,
  adminCreateInquiry,
  adminDeleteInquiry,
  adminDeleteNote,
  adminGetActivities,
  adminGetAssignments,
  adminGetInquiry,
  adminGetInquiryStats,
  adminGetNotes,
  adminGetRecentInquiries,
  adminListInquiries,
  adminUpdateInquiry,
  adminUpdateInquiryPriority,
  adminUpdateInquiryStatus,
  adminUpdateNote,
  adminAddNote,
  createInquiry,
  getInquirySuccess,
} from "../controllers/inquiry.controller.js";

export const inquiriesRouter = Router();

// Public
inquiriesRouter.post("/", createInquiry);
inquiriesRouter.get("/success", getInquirySuccess);

// Admin
export const adminInquiriesRouter = Router();
adminInquiriesRouter.use(authenticate, requireAdmin);

// Stats & Recent (must come before /:id routes)
adminInquiriesRouter.get("/stats", adminGetInquiryStats);
adminInquiriesRouter.get("/recent", adminGetRecentInquiries);

// Listing
adminInquiriesRouter.get("/", adminListInquiries);

// Single inquiry
adminInquiriesRouter.get("/:id", adminGetInquiry);
adminInquiriesRouter.post("/", adminCreateInquiry);
adminInquiriesRouter.put("/:id", adminUpdateInquiry);
adminInquiriesRouter.delete("/:id", adminDeleteInquiry);

// Lead Management
adminInquiriesRouter.patch("/:id/status", adminUpdateInquiryStatus);
adminInquiriesRouter.patch("/:id/priority", adminUpdateInquiryPriority);
adminInquiriesRouter.patch("/:id/assign", adminAssignInquiry);

// Notes
adminInquiriesRouter.get("/:id/notes", adminGetNotes);
adminInquiriesRouter.post("/:id/notes", adminAddNote);
adminInquiriesRouter.put("/:id/notes/:noteId", adminUpdateNote);
adminInquiriesRouter.delete("/:id/notes/:noteId", adminDeleteNote);

// Activities
adminInquiriesRouter.get("/:id/activities", adminGetActivities);

// Assignments
adminInquiriesRouter.get("/:id/assignments", adminGetAssignments);
