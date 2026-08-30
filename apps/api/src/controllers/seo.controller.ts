import type { Request, Response } from "express";
import { seoService } from "../services/seo.service.js";
import { seoMetadataCreateSchema } from "../validators/schemas.js";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

export async function listSeoMetadata(req: Request, res: Response) {
  const items = await seoService.list();
  res.json({
    success: true,
    data: items,
  });
}

export async function getSeoMetadataByPage(req: Request, res: Response) {
  const pageType = req.query.pageType as string;
  const entityType = req.query.entityType as string | undefined;
  const entityId = req.query.entityId as string | undefined;

  if (!pageType) {
    res.status(400).json({
      success: false,
      error: "pageType query parameter is required",
    });
    return;
  }

  const metadata = await seoService.getByPage(pageType, entityType, entityId);

  res.json({
    success: true,
    data: metadata,
  });
}

export async function upsertSeoMetadata(req: Request, res: Response) {
  const validated = seoMetadataCreateSchema.parse(req.body);
  const result = await seoService.upsert(validated);

  res.json({
    success: true,
    message: "SEO Metadata saved successfully",
    data: result,
  });
}

export async function deleteSeoMetadata(req: Request, res: Response) {
  const id = getParam(req.params.id);
  await seoService.delete(id);

  res.json({
    success: true,
    message: "SEO Metadata deleted successfully",
  });
}
