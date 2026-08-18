import { prisma, MediaResourceType, MediaStatus } from "@goyatrio/database";
import { destroyMedia } from "../utils/cloudinary.js";

type MediaUploadInput = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: keyof typeof MediaResourceType;
  mimeType?: string;
  format?: string | null;
  folder?: string;
  fileName?: string;
  width?: number | null;
  height?: number | null;
  size?: number;
  durationSeconds?: number | null;
  altText?: string;
  caption?: string;
  tags?: string[];
  metadata?: unknown;
  createdBy?: string;
};

function mapResourceType(type: string): MediaResourceType {
  if (type === "IMAGE") return MediaResourceType.IMAGE;
  if (type === "VIDEO") return MediaResourceType.VIDEO;
  return MediaResourceType.RAW;
}

export const mediaService = {
  list(query: {
    take?: number;
    skip?: number;
    search?: string;
    resourceType?: MediaResourceType;
    folder?: string;
    tag?: string;
    status?: MediaStatus;
  } = {}) {
    const { take = 50, skip = 0, search, resourceType, folder, tag, status } = query;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (status) where.status = status;
    if (resourceType) where.resourceType = resourceType;
    if (folder) where.folder = { contains: folder, mode: "insensitive" };
    if (tag) where.tags = { has: tag };

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
        { publicId: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    return prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  count(query: {
    search?: string;
    resourceType?: MediaResourceType;
    folder?: string;
    tag?: string;
    status?: MediaStatus;
  } = {}) {
    const { search, resourceType, folder, tag, status } = query;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status) where.status = status;
    if (resourceType) where.resourceType = resourceType;
    if (folder) where.folder = { contains: folder, mode: "insensitive" };
    if (tag) where.tags = { has: tag };

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
        { publicId: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    return prisma.media.count({ where });
  },

  get: (id: string) =>
    prisma.media.findUnique({ where: { id }, include: { links: true } }),

  getByPublicId: (publicId: string) =>
    prisma.media.findUnique({ where: { publicId } }),

  createFromUpload: (data: MediaUploadInput) =>
    prisma.media.create({
      data: {
        publicId: data.publicId,
        url: data.url,
        secureUrl: data.secureUrl,
        resourceType: mapResourceType(data.resourceType),
        mimeType: data.mimeType,
        format: data.format,
        folder: data.folder,
        fileName: data.fileName,
        width: data.width ?? null,
        height: data.height ?? null,
        size: data.size ? BigInt(data.size) : null,
        durationSeconds: data.durationSeconds ?? null,
        altText: data.altText,
        caption: data.caption,
        tags: data.tags ?? [],
        metadata: data.metadata ?? undefined,
        createdBy: data.createdBy,
        status: MediaStatus.ACTIVE,
        usageCount: 0,
      },
    }),

  updateMetadata: (id: string, data: { altText?: string; caption?: string; tags?: string[]; folder?: string; status?: MediaStatus }) =>
    prisma.media.update({ where: { id }, data }),

  async replaceUpload(id: string, data: MediaUploadInput) {
    return prisma.media.update({
      where: { id },
      data: {
        url: data.url,
        secureUrl: data.secureUrl,
        mimeType: data.mimeType,
        format: data.format ?? undefined,
        width: data.width ?? null,
        height: data.height ?? null,
        size: data.size ? BigInt(data.size) : null,
        durationSeconds: data.durationSeconds ?? null,
      },
    });
  },

  async remove(id: string) {
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) return null;

    // Attempt Cloudinary destroy; never fail the soft-delete if the asset is already gone.
    try {
      const resourceType =
        existing.resourceType === MediaResourceType.VIDEO ? "video" : existing.resourceType === MediaResourceType.RAW ? "raw" : "image";
      await destroyMedia(existing.publicId, resourceType);
    } catch {
      // Cloudinary asset may not exist; continue with local soft delete.
    }

    return prisma.media.update({
      where: { id },
      data: { status: MediaStatus.ARCHIVED, deletedAt: new Date() },
    });
  },

  async syncUsageCount(mediaId: string) {
    const count = await prisma.mediaLink.count({
      where: {
        mediaId,
        media: { deletedAt: null, status: MediaStatus.ACTIVE },
      },
    });

    return prisma.media.update({
      where: { id: mediaId },
      data: { usageCount: count },
    });
  },

  async syncUsageCountsForLink(linkId: string) {
    const link = await prisma.mediaLink.findUnique({ where: { id: linkId } });
    if (link) {
      await this.syncUsageCount(link.mediaId);
    }
  },

  incrementUsage(id: string, amount = 1) {
    return prisma.media.update({
      where: { id },
      data: { usageCount: { increment: amount } },
    });
  },

  deleteLink: (id: string) => prisma.mediaLink.delete({ where: { id } }),

  getLinks(module: string, moduleId: string) {
    return prisma.mediaLink.findMany({
      where: { module: module as never, moduleId },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });
  },
};
