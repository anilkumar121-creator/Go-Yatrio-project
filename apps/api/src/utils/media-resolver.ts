import { prisma } from "@goyatrio/database";
import type { MediaModule } from "@goyatrio/database";

export type MediaItem = {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  mimeType: string | null;
  format: string | null;
  folder: string | null;
  fileName: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  durationSeconds: number | null;
  altText: string | null;
  caption: string | null;
  tags: string[];
  createdBy: string | null;
  status: string;
  usageCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  sortOrder?: number;
};


export async function getMediaForModule(
  module: string,
  moduleId: string,
): Promise<{
  featuredMedia: MediaItem | null;
  galleryMedia: MediaItem[];
}> {
  const links = await prisma.mediaLink.findMany({
    where: {
      module: module as MediaModule,
      moduleId,
    },
    orderBy: [{ role: "asc" }, { sortOrder: "asc" }],
    include: { media: true },
  });

  const mediaItems: MediaItem[] = (links ?? [])
    .filter((link) => link.media && link.media.deletedAt === null && link.media.status === "ACTIVE")
    .map((link) => ({
      id: link.media!.id,
      publicId: link.media!.publicId,
      url: link.media!.url,
      secureUrl: link.media!.secureUrl,
      resourceType: link.media!.resourceType,
      mimeType: link.media!.mimeType,
      format: link.media!.format,
      folder: link.media!.folder,
      fileName: link.media!.fileName,
      width: link.media!.width,
      height: link.media!.height,
      size: Number(link.media!.size ?? 0),
      durationSeconds: link.media!.durationSeconds,
      altText: link.media!.altText,
      caption: link.media!.caption,
      tags: link.media!.tags,
      createdBy: link.media!.createdBy,
      status: link.media!.status,
      usageCount: link.media!.usageCount,
      deletedAt: link.media!.deletedAt,
      createdAt: link.media!.createdAt,
      updatedAt: link.media!.updatedAt,
      role: link.role,
      sortOrder: link.sortOrder,
    }));

  const featuredMedia = mediaItems.find((m) => m.role === "FEATURED") ?? null;
  const galleryMedia = mediaItems.filter((m) => m.role !== "FEATURED").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return { featuredMedia, galleryMedia };
}

export async function getFeaturedMedia(
  module: string,
  moduleId: string,
): Promise<{
  id: string;
  publicId: string;
  secureUrl: string;
  altText: string | null;
} | null> {
  const link = await prisma.mediaLink.findFirst({
    where: {
      module: module as MediaModule,
      moduleId,
      role: "FEATURED",
    },
    include: {
      media: {
        select: {
          id: true,
          publicId: true,
          secureUrl: true,
          altText: true,
          deletedAt: true,
          status: true,
        },
      },
    },

  });

  if (!link?.media || link.media.deletedAt !== null || link.media.status !== "ACTIVE") {
    return null;
  }

  return link.media;
}

export async function getGalleryMedia(
  module: string,
  moduleId: string,
): Promise<
  Array<{
    id: string;
    publicId: string;
    secureUrl: string;
    altText: string | null;
    width: number | null;
    height: number | null;
    sortOrder: number;
  }>
> {
  const links = await prisma.mediaLink.findMany({
    where: {
      module: module as MediaModule,
      moduleId,
      role: { not: "FEATURED" },
    },
    orderBy: { sortOrder: "asc" },
    include: {
      media: {
        select: {
          id: true,
          publicId: true,
          secureUrl: true,
          altText: true,
          width: true,
          height: true,
          deletedAt: true,
          status: true,
        },
      },
    },

  });

  return (links ?? [])
    .filter((l) => l.media && l.media.deletedAt === null && l.media.status === "ACTIVE")
    .map((l) => ({
      id: l.media.id,
      publicId: l.media.publicId,
      secureUrl: l.media.secureUrl,
      altText: l.media.altText,
      width: l.media.width,
      height: l.media.height,
      sortOrder: l.sortOrder,
    }));
}

export async function attachMediaToItems<T extends { id: string }>(
  module: string,
  items: T[],
): Promise<Array<T & { featuredMedia: MediaItem | null; galleryMedia: MediaItem[] }>> {
  if (items.length === 0) return items as Array<T & { featuredMedia: MediaItem | null; galleryMedia: MediaItem[] }>;

  const ids = items.map((item) => item.id);

  const links = await prisma.mediaLink.findMany({
    where: {
      module: module as MediaModule,
      moduleId: { in: ids },
    },
    orderBy: [{ role: "asc" }, { sortOrder: "asc" }],
    include: { media: true },
  });

  const byModuleId = new Map<string, MediaItem[]>();
  for (const link of links ?? []) {
    if (!link.media || link.media.deletedAt !== null || link.media.status !== "ACTIVE") continue;
    const list = byModuleId.get(link.moduleId) ?? [];
    list.push({
      id: link.media.id,
      publicId: link.media.publicId,
      url: link.media.url,
      secureUrl: link.media.secureUrl,
      resourceType: link.media.resourceType,
      mimeType: link.media.mimeType,
      format: link.media.format,
      folder: link.media.folder,
      fileName: link.media.fileName,
      width: link.media.width,
      height: link.media.height,
      size: Number(link.media.size ?? 0),
      durationSeconds: link.media.durationSeconds,
      altText: link.media.altText,
      caption: link.media.caption,
      tags: link.media.tags,
      createdBy: link.media.createdBy,
      status: link.media.status,
      usageCount: link.media.usageCount,
      deletedAt: link.media.deletedAt,
      createdAt: link.media.createdAt,
      updatedAt: link.media.updatedAt,
      role: link.role,
      sortOrder: link.sortOrder,
    });
    byModuleId.set(link.moduleId, list);
  }

  return items.map((item) => {
    const mediaItems = byModuleId.get(item.id) ?? [];
    return {
      ...item,
      featuredMedia: mediaItems.find((m) => m.role === "FEATURED") ?? null,
      galleryMedia: mediaItems.filter((m) => m.role !== "FEATURED").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    };
  });
}
