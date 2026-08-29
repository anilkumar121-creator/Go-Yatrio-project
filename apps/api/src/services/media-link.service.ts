import { prisma, MediaModule } from "../db.js";
import { mediaService } from "./media.service.js";

type MediaLinkInput = {
  mediaId: string;
  module: MediaModule;
  moduleId: string;
  role?: "FEATURED" | "GALLERY" | "VIDEO" | "DOCUMENT";
  sortOrder?: number;
};

export const mediaLinkService = {
  async attachMedia(data: MediaLinkInput) {
    const link = await prisma.mediaLink.create({
      data: {
        mediaId: data.mediaId,
        module: data.module,
        moduleId: data.moduleId,
        role: data.role ?? "GALLERY",
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await mediaService.syncUsageCount(data.mediaId);
    return link;
  },

  async detachMedia(id: string) {
    const link = await prisma.mediaLink.findUnique({ where: { id } });
    const deleted = await prisma.mediaLink.delete({ where: { id } });
    if (link) {
      await mediaService.syncUsageCount(link.mediaId);
    }
    return deleted;
  },

  async listMediaLinks(module: string, moduleId: string) {
    return prisma.mediaLink.findMany({
      where: {
        module: module as "DESTINATION" | "PACKAGE" | "HOTEL" | "CAB" | "BLOG" | "HOMEPAGE",
        moduleId,
      },
      orderBy: [{ role: "asc" }, { sortOrder: "asc" }],
      include: {
        media: true,
      },
    });
  },

  async updateSortOrder(id: string, sortOrder: number) {
    return prisma.mediaLink.update({
      where: { id },
      data: { sortOrder },
    });
  },

  async updateRole(id: string, role: "FEATURED" | "GALLERY" | "VIDEO" | "DOCUMENT") {
    return prisma.mediaLink.update({
      where: { id },
      data: { role },
    });
  },
};
