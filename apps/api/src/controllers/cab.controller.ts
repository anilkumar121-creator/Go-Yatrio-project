import type { Request, Response } from "express";
import { CabStatus, CabTripType, VehicleType } from "@goyatrio/database";
import { cabService } from "../services/cab.service.js";
import {
  cabCreateSchema,
  cabInquiryCreateSchema,
  cabStatusSchema,
  cabUpdateSchema,
} from "../validators/schemas.js";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export async function listCabs(req: Request, res: Response) {
  const take = Number(req.query.take) || 20;
  const skip = Number(req.query.skip) || 0;
  const search = req.query.search as string | undefined;
  const vehicleType = req.query.vehicleType as VehicleType | undefined;
  const tripType = req.query.tripType as CabTripType | undefined;
  const destinationId = req.query.destinationId as string | undefined;
  const destinationSlug = req.query.destinationSlug as string | undefined;
  const sort = req.query.sort as "price_asc" | "price_desc" | "capacity_desc" | "newest" | undefined;

  const result = await cabService.list({
    take,
    skip,
    search,
    vehicleType,
    tripType,
    destinationId,
    destinationSlug,
    status: CabStatus.ACTIVE,
    sort,
  });

  res.json({
    success: true,
    data: result.items,
    meta: { total: result.total, take, skip },
  });
}

export async function searchCabs(req: Request, res: Response) {
  const query = (req.query.q as string) || (req.query.search as string) || "";
  const take = Number(req.query.take) || 12;

  const result = await cabService.list({ search: query, take, status: CabStatus.ACTIVE });

  res.json({
    success: true,
    data: result.items,
    meta: { total: result.total },
  });
}

export async function getFeaturedCabs(req: Request, res: Response) {
  const take = Number(req.query.take) || 6;
  const items = await cabService.listFeatured(take);

  res.json({ success: true, data: items });
}

export async function getCabsByDestination(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const items = await cabService.listByDestinationSlug(slug);

  res.json({ success: true, data: items });
}

export async function getCabBySlug(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const cab = await cabService.getBySlug(slug);

  if (!cab) {
    res.status(404).json({ success: false, error: "Cab not found" });
    return;
  }

  res.json({ success: true, data: cab });
}

export async function submitCabInquiry(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = cabInquiryCreateSchema.parse(req.body);

  const existing = await cabService.getBySlug(id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Cab not found" });
    return;
  }

  const inquiry = await cabService.createInquiry(existing.id, validated);

  res.status(201).json({
    success: true,
    message: "Cab inquiry submitted successfully. Our team will contact you shortly.",
    data: inquiry,
  });
}

export async function adminListCabs(req: Request, res: Response) {
  const take = Number(req.query.take) || 50;
  const skip = Number(req.query.skip) || 0;
  const search = req.query.search as string | undefined;
  const status = req.query.status as CabStatus | undefined;
  const vehicleType = req.query.vehicleType as VehicleType | undefined;

  const result = await cabService.list({ take, skip, search, status, vehicleType });

  res.json({
    success: true,
    data: result.items,
    meta: { total: result.total, take, skip },
  });
}

export async function adminGetCab(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const cab = await cabService.get(id);

  if (!cab) {
    res.status(404).json({ success: false, error: "Cab not found" });
    return;
  }

  res.json({ success: true, data: cab });
}

export async function createCab(req: Request, res: Response) {
  const validated = cabCreateSchema.parse(req.body);
  const created = await cabService.create(validated);

  res.status(201).json({ success: true, message: "Cab created successfully", data: created });
}

export async function updateCab(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = cabUpdateSchema.parse(req.body);

  const existing = await cabService.get(id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Cab not found" });
    return;
  }

  const updated = await cabService.update(id, validated);

  res.json({ success: true, message: "Cab updated successfully", data: updated });
}

export async function deleteCab(req: Request, res: Response) {
  const id = getParam(req.params.id);

  const existing = await cabService.get(id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Cab not found" });
    return;
  }

  await cabService.remove(id);

  res.json({ success: true, message: "Cab deleted successfully" });
}

export async function updateCabStatus(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = cabStatusSchema.parse(req.body);

  const updated = await cabService.updateStatus(id, validated.status);

  res.json({ success: true, message: `Cab status updated to ${validated.status}`, data: updated });
}

export async function updateCabFeatured(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const featured = req.body.featured === true;

  const updated = await cabService.updateFeatured(id, featured);

  res.json({ success: true, message: "Cab featured flag updated", data: updated });
}

export async function getCabAmenities(_req: Request, res: Response) {
  const amenities = await cabService.getAmenities();
  res.json({ success: true, data: amenities });
}
