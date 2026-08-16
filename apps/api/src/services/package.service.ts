import { prisma, PackageType, HotelStatus } from "@goyatrio/database";

type PackageCreateInput = {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  currency?: string;
  packageType: PackageType;
  inclusions?: string[];
  exclusions?: string[];
  featuredImage?: string;
  galleryImages?: string[];
  featured?: boolean;
  status?: "DRAFT" | "PUBLISHED";
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
};

type PackageUpdateInput = Partial<PackageCreateInput>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "package";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.tourPackage.findUnique({
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

export const packageService = {
  list(query: {
    take?: number;
    skip?: number;
    search?: string;
    packageType?: string;
    destinationId?: string;
    status?: string;
  } = {}) {
    const { take = 50, skip = 0, search, packageType, destinationId, status } = query;

    return prisma.tourPackage.findMany({
      where: {
        isActive: true,
        ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
        ...(packageType ? { packageType: packageType as PackageType } : {}),
        ...(destinationId ? { destinationId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
                { destination: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        destination: { select: { id: true, name: true, slug: true, country: true, state: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  count(query: {
    search?: string;
    packageType?: string;
    destinationId?: string;
    status?: string;
  } = {}) {
    const { search, packageType, destinationId, status } = query;

    return prisma.tourPackage.count({
      where: {
        isActive: true,
        ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
        ...(packageType ? { packageType: packageType as PackageType } : {}),
        ...(destinationId ? { destinationId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
                { destination: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
    });
  },

  listPublished(query: {
    take?: number;
    skip?: number;
    search?: string;
    packageType?: string;
    destinationId?: string;
    featuredOnly?: boolean;
    sort?: "price_asc" | "price_desc" | "duration_asc" | "duration_desc" | "newest";
  } = {}) {
    const { take = 50, skip = 0, search, packageType, destinationId, featuredOnly = false, sort = "newest" } = query;

    let orderBy: Record<string, "asc" | "desc">[] = [{ createdAt: "desc" }];

    if (sort === "price_asc") orderBy = [{ priceFrom: "asc" }];
    if (sort === "price_desc") orderBy = [{ priceFrom: "desc" }];
    if (sort === "duration_asc") orderBy = [{ durationDays: "asc" }];
    if (sort === "duration_desc") orderBy = [{ durationDays: "desc" }];

    return prisma.tourPackage.findMany({
      where: {
        status: "PUBLISHED",
        isActive: true,
        ...(featuredOnly ? { featured: true } : {}),
        ...(packageType ? { packageType: packageType as PackageType } : {}),
        ...(destinationId ? { destinationId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
                { destination: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        destination: { select: { id: true, name: true, slug: true, country: true, state: true } },
      },
      orderBy,
      skip,
      take,
    });
  },

  getBySlug(slug: string, publishedOnly = false) {
    return prisma.tourPackage.findFirst({
      where: {
        slug,
        isActive: true,
        ...(publishedOnly ? { status: "PUBLISHED" } : {}),
      },
      include: {
        destination: true,
        itineraries: {
          where: { isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          include: {
            days: {
              orderBy: { sortOrder: "asc" },
              include: {
                activities: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
        hotels: {
          where: { status: HotelStatus.ACTIVE },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            amenities: true,
            roomTypes: { where: { active: true }, orderBy: { priceFrom: "asc" }, take: 1 },
          },
        },
        vehicles: {
          where: { status: "ACTIVE", isActive: true },
          include: {
            amenities: true,
          },
        },
      },
    });
  },

  get(id: string) {
    return prisma.tourPackage.findUnique({
      where: { id },
      include: {
        destination: true,
        itineraries: {
          where: { isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          include: {
            days: {
              orderBy: { sortOrder: "asc" },
              include: {
                activities: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
        hotels: {
          where: { status: HotelStatus.ACTIVE },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            amenities: true,
            roomTypes: { where: { active: true }, orderBy: { priceFrom: "asc" }, take: 1 },
          },
        },
        vehicles: {
          where: { status: "ACTIVE", isActive: true },
          include: {
            amenities: true,
          },
        },
      },
    });
  },

  async create(data: PackageCreateInput) {
    const slug = data.slug ?? (await generateUniqueSlug(data.title));

    return prisma.tourPackage.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        destinationId: data.destinationId,
        durationDays: data.durationDays,
        durationNights: data.durationNights,
        priceFrom: data.priceFrom,
        currency: data.currency ?? "INR",
        packageType: data.packageType,
        inclusions: data.inclusions ?? [],
        exclusions: data.exclusions ?? [],
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

  async update(id: string, data: PackageUpdateInput) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.title) {
      updateData.slug = await generateUniqueSlug(data.title, id);
    }

    delete updateData.id;

    return prisma.tourPackage.update({
      where: { id },
      data: updateData,
      include: { destination: true },
    });
  },

  updateStatus(id: string, status: "DRAFT" | "PUBLISHED") {
    return prisma.tourPackage.update({ where: { id }, data: { status } });
  },

  updateFeatured(id: string, featured: boolean) {
    return prisma.tourPackage.update({ where: { id }, data: { featured } });
  },

  remove(id: string) {
    return prisma.tourPackage.update({ where: { id }, data: { isActive: false } });
  },
};
