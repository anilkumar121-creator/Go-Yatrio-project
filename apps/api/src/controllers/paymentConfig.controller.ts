import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import {
  paymentConfigurationCreateSchema,
  paymentConfigurationUpdateSchema,
} from "../validators/schemas.js";

export async function adminListPaymentConfigs(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.paymentConfiguration.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function adminCreatePaymentConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = paymentConfigurationCreateSchema.parse(req.body);
    const created = await prisma.paymentConfiguration.create({ data });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export async function adminUpdatePaymentConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req.params.id);
    const data = paymentConfigurationUpdateSchema.parse(req.body);
    const updated = await prisma.paymentConfiguration.update({
      where: { id },
      data,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function adminDeletePaymentConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req.params.id);
    await prisma.paymentConfiguration.delete({ where: { id } });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}
