import { prisma } from "../db.js";

export type SeoMetadataUpsertInput = {
  pageType: string;
  entityType?: string | null;
  entityId?: string | null;
  title: string;
  description: string;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  robots?: string | null;
};

export const seoService = {
  list: async () => {
    return prisma.seoMetadata.findMany({
      orderBy: { pageType: "asc" },
    });
  },

  getByPage: async (
    pageType: string,
    entityType: string | null = null,
    entityId: string | null = null,
  ) => {
    return prisma.seoMetadata.findFirst({
      where: {
        pageType,
        entityType: entityType || null,
        entityId: entityId || null,
      },
    });
  },

  upsert: async (data: SeoMetadataUpsertInput) => {
    const pageType = data.pageType;
    const entityType = data.entityType || null;
    const entityId = data.entityId || null;

    const existing = await prisma.seoMetadata.findFirst({
      where: { pageType, entityType, entityId },
    });

    if (existing) {
      return prisma.seoMetadata.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          description: data.description,
          canonicalUrl: data.canonicalUrl || null,
          ogImage: data.ogImage || null,
          robots: data.robots || null,
        },
      });
    } else {
      return prisma.seoMetadata.create({
        data: {
          pageType,
          entityType,
          entityId,
          title: data.title,
          description: data.description,
          canonicalUrl: data.canonicalUrl || null,
          ogImage: data.ogImage || null,
          robots: data.robots || null,
        },
      });
    }
  },

  delete: async (id: string) => {
    return prisma.seoMetadata.delete({
      where: { id },
    });
  },
};
