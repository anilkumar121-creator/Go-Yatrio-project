import type { Request, Response } from "express";
import { hotelService } from "../services/hotel.service.js";
import {
  hotelCreateSchema,
  hotelInquiryCreateSchema,
  hotelStatusSchema,
  hotelUpdateSchema,
} from "../validators/schemas.js";
import { HotelCategory, HotelStatus } from "@goyatrio/database";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export async function listHotels(req: Request, res: Response) {
  const take = Number(req.query.take) || 20;
  const skip = Number(req.query.skip) || 0;
  const search = req.query.search as string | undefined;
  const destinationId = req.query.destinationId as string | undefined;
  const destinationSlug = req.query.destinationSlug as string | undefined;
  const category = req.query.category as HotelCategory | undefined;
  const starRating = req.query.starRating ? Number(req.query.starRating) : undefined;
  const sort = req.query.sort as "price_asc" | "price_desc" | "rating_desc" | "newest" | undefined;

  const result = await hotelService.list({
    take,
    skip,
    search,
    destinationId,
    destinationSlug,
    category,
    starRating,
    status: HotelStatus.ACTIVE,
    sort,
  });

  res.json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
      take,
      skip,
    },
  });
}

export async function searchHotels(req: Request, res: Response) {
  const query = (req.query.q as string) || (req.query.search as string) || "";
  const take = Number(req.query.take) || 12;

  const result = await hotelService.list({
    search: query,
    take,
    status: HotelStatus.ACTIVE,
  });

  res.json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
    },
  });
}

export async function getFeaturedHotels(req: Request, res: Response) {
  const take = Number(req.query.take) || 6;
  const items = await hotelService.listFeatured(take);

  res.json({
    success: true,
    data: items,
  });
}

export async function getHotelsByDestination(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const items = await hotelService.listByDestinationSlug(slug);

  res.json({
    success: true,
    data: items,
  });
}

export async function getHotelBySlug(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const hotel = await hotelService.getBySlug(slug);

  if (!hotel) {
    res.status(404).json({
      success: false,
      error: "Hotel not found",
    });
    return;
  }

  res.json({
    success: true,
    data: hotel,
  });
}

export async function submitHotelInquiry(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = hotelInquiryCreateSchema.parse(req.body);

  const existing = await hotelService.getBySlug(id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: "Hotel not found",
    });
    return;
  }

  const inquiry = await hotelService.createInquiry(existing.id, validated);

  res.status(201).json({
    success: true,
    message: "Hotel inquiry submitted successfully. Our team will contact you shortly.",
    data: inquiry,
  });
}

// Admin Controller Handlers
export async function adminListHotels(req: Request, res: Response) {
  const take = Number(req.query.take) || 50;
  const skip = Number(req.query.skip) || 0;
  const search = req.query.search as string | undefined;
  const status = req.query.status as HotelStatus | undefined;
  const category = req.query.category as HotelCategory | undefined;

  const result = await hotelService.list({
    take,
    skip,
    search,
    status,
    category,
  });

  res.json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
      take,
      skip,
    },
  });
}

export async function adminGetHotel(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const hotel = await hotelService.getById(id);

  if (!hotel) {
    res.status(404).json({
      success: false,
      error: "Hotel not found",
    });
    return;
  }

  res.json({
    success: true,
    data: hotel,
  });
}

export async function createHotel(req: Request, res: Response) {
  const validated = hotelCreateSchema.parse(req.body);
  const created = await hotelService.create(validated);

  res.status(201).json({
    success: true,
    message: "Hotel created successfully",
    data: created,
  });
}

export async function updateHotel(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = hotelUpdateSchema.parse(req.body);

  const existing = await hotelService.getById(id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: "Hotel not found",
    });
    return;
  }

  const updated = await hotelService.update(id, validated);

  res.json({
    success: true,
    message: "Hotel updated successfully",
    data: updated,
  });
}

export async function deleteHotel(req: Request, res: Response) {
  const id = getParam(req.params.id);

  const existing = await hotelService.getById(id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: "Hotel not found",
    });
    return;
  }

  await hotelService.remove(id);

  res.json({
    success: true,
    message: "Hotel deleted successfully",
  });
}

export async function updateHotelStatus(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = hotelStatusSchema.parse(req.body);

  const updated = await hotelService.updateStatus(id, validated.status);

  res.json({
    success: true,
    message: `Hotel status updated to ${validated.status}`,
    data: updated,
  });
}

export async function getAmenities(_req: Request, res: Response) {
  const amenities = await hotelService.getAmenities();
  res.json({
    success: true,
    data: amenities,
  });
}
