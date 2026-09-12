import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { routePricingCreateSchema, routePricingUpdateSchema } from "../validators/schemas.js";

export async function adminListRoutePricings(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.routePricing.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function adminCreateRoutePricing(req: Request, res: Response, next: NextFunction) {
  try {
    const data = routePricingCreateSchema.parse(req.body);
    const created = await prisma.routePricing.create({ data });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export async function adminUpdateRoutePricing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req.params.id);
    const data = routePricingUpdateSchema.parse(req.body);
    const updated = await prisma.routePricing.update({
      where: { id },
      data,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteRoutePricing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req.params.id);
    await prisma.routePricing.delete({ where: { id } });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}
