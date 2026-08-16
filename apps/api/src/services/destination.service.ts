import { prisma, HotelStatus } from "@goyatrio/database";

type DestinationCreateInput = {
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  state?: string;
  country?: string;
  featuredImage?: string;
  galleryImages?: string[];
  featured?: boolean;
  status?: "DRAFT" | "PUBLISHED";
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
};

type DestinationUpdateInput = Partial<DestinationCreateInput>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "destination";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.destination.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export const destinationService = {
  list(query: { take?: number; skip?: number; search?: string; status?: string; country?: string } = {}) {
    const { take = 50, skip = 0, search, status, country } = query;

    return prisma.destination.findMany({
      where: {
        isActive: true,
        ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
        ...(country ? { country } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  count(query: { search?: string; status?: string; country?: string } = {}) {
    const { search, status, country } = query;

    return prisma.destination.count({
      where: {
        isActive: true,
        ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
        ...(country ? { country } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    });
  },

  listPublished(query: { take?: number; skip?: number; search?: string; featuredOnly?: boolean } = {}) {
    const { take = 50, skip = 0, search, featuredOnly = false } = query;

    return prisma.destination.findMany({
      where: {
        status: "PUBLISHED",
        isActive: true,
        ...(featuredOnly ? { featured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    });
  },

  getBySlug(slug: string, publishedOnly = false) {
    return prisma.destination.findFirst({
      where: {
        slug,
        isActive: true,
        ...(publishedOnly ? { status: "PUBLISHED" } : {}),
      },
      include: {
        packages: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
        hotels: {
          where: { status: HotelStatus.ACTIVE },
          orderBy: [{ featured: "desc" }, { starRating: "desc" }],
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            amenities: true,
            roomTypes: { where: { active: true }, orderBy: { priceFrom: "asc" }, take: 1 },
          },
        },
        vehicles: {
          where: { status: "ACTIVE", isActive: true },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          include: {
            amenities: true,
          },
        },
      },
    });
  },

  get(id: string) {
    return prisma.destination.findUnique({
      where: { id },
      include: { packages: true, hotels: true },
    });
  },

  async create(data: DestinationCreateInput) {
    const slug = data.slug ?? (await generateUniqueSlug(data.name));

    return prisma.destination.create({
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        state: data.state,
        country: data.country ?? "India",
        featuredImage: data.featuredImage,
        galleryImages: data.galleryImages ?? [],
        featured: data.featured ?? false,
        status: data.status ?? "DRAFT",
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isActive: data.isActive ?? true,
      },
    });
  },

  async update(id: string, data: DestinationUpdateInput) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.name) {
      updateData.slug = await generateUniqueSlug(data.name, id);
    }

    delete updateData.id;

    return prisma.destination.update({
      where: { id },
      data: updateData,
    });
  },

  updateStatus(id: string, status: "DRAFT" | "PUBLISHED") {
    return prisma.destination.update({ where: { id }, data: { status } });
  },

  updateFeatured(id: string, featured: boolean) {
    return prisma.destination.update({ where: { id }, data: { featured } });
  },

  remove(id: string) {
    return prisma.destination.update({ where: { id }, data: { isActive: false } });
  },
};
