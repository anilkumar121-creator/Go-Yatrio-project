import { Router } from "express";
import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  createMediaLink,
  deleteMedia,
  deleteMediaLink,
  getMedia,
  getUploadSignature,
  listMedia,
  listMediaLinks,
  replaceMedia,
  updateMediaLinkRole,
  updateMediaLinkSortOrder,
  updateMediaMetadata,
  uploadMedia,
} from "../controllers/media.controller.js";

export const mediaRouter = Router();

// Public read-only routes (active assets only)
mediaRouter.get("/", listMedia);
mediaRouter.get("/:id", getMedia);

// Admin routes
export const adminMediaRouter = Router();
adminMediaRouter.use(authenticate, requireAdmin);
adminMediaRouter.use(express.json({ limit: "120mb" }));

adminMediaRouter.get("/", listMedia);
adminMediaRouter.get("/links/list", listMediaLinks);
adminMediaRouter.get("/:id", getMedia);
adminMediaRouter.post("/upload", uploadMedia);
adminMediaRouter.post("/signature", getUploadSignature);
adminMediaRouter.put("/:id/replace", replaceMedia);
adminMediaRouter.patch("/:id", updateMediaMetadata);
adminMediaRouter.delete("/:id", deleteMedia);
adminMediaRouter.post("/links", createMediaLink);
adminMediaRouter.patch("/links/:id/sort-order", updateMediaLinkSortOrder);
adminMediaRouter.patch("/links/:id/role", updateMediaLinkRole);
adminMediaRouter.delete("/links/:id", deleteMediaLink);
