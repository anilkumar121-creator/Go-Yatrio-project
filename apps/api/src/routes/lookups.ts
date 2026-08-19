import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminCreateGroup,
  adminCreateItem,
  adminDeleteGroup,
  adminDeleteItem,
  adminListGroups,
  adminListItems,
  adminSetItemOrder,
  adminSetItemStatus,
  adminUpdateGroup,
  adminUpdateItem,
  getLookups,
  getLookupsByGroup,
} from "../controllers/lookup.controller.js";

export const lookupsRouter = Router();

// Public
lookupsRouter.get("/", getLookups);
lookupsRouter.get("/:groupKey", getLookupsByGroup);

// Admin
export const adminLookupsRouter = Router();
adminLookupsRouter.use(authenticate, requireAdmin);

adminLookupsRouter.get("/groups", adminListGroups);
adminLookupsRouter.post("/groups", adminCreateGroup);
adminLookupsRouter.put("/groups/:id", adminUpdateGroup);
adminLookupsRouter.delete("/groups/:id", adminDeleteGroup);

adminLookupsRouter.get("/items", adminListItems);
adminLookupsRouter.post("/items", adminCreateItem);
adminLookupsRouter.put("/items/:id", adminUpdateItem);
adminLookupsRouter.delete("/items/:id", adminDeleteItem);
adminLookupsRouter.patch("/items/:id/status", adminSetItemStatus);
adminLookupsRouter.patch("/items/:id/order", adminSetItemOrder);
