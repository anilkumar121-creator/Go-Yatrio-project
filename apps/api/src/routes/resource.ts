import type { RequestHandler, Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";

type CrudController = {
  list: RequestHandler;
  get: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
};

export function registerCrudRoutes(router: Router, controller: CrudController, publicCreate = false) {
  router.get("/", controller.list);
  router.get("/:id", controller.get);

  if (publicCreate) {
    router.post("/", controller.create);
  } else {
    router.post("/", authenticate, requireAdmin, controller.create);
  }

  router.patch("/:id", authenticate, requireAdmin, controller.update);
  router.delete("/:id", authenticate, requireAdmin, controller.remove);
}
