import { prisma, PackageType, HotelStatus, type PackageAvailability } from "@goyatrio/database";
import { attachMediaToItems, getMediaForModule } from "../utils/media-resolver.js";

type PackageSeasonalInput = {
  id?: string;
  label: string;
  priceFrom: number;
  discountedPrice?: number;
  displayOrder?: number;
  startDate: Date;
  endDate: Date;
  active?: boolean;
};

type PackageOfferInput = {
  id?: string;
  label: string;
  badge?: string;
  discountedPrice?: number;
  priority?: number;
  startDate: Date;
  endDate: Date;
  featured?: boolean;
  active?: boolean;
};

type PackageCreateInput = {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  discountedPrice?: number;
  currency?: string;
  packageType: PackageType;
  inclusions?: string[];
  exclusions?: string[];
  featuredImage?: string;
  galleryImages?: string[];
  featured?: boolean;
  status?: "DRAFT" | "PUBLISHED";
  availability?: PackageAvailability;
  availableSeats?: number;
  priceValidFrom?: Date;
  priceValidTo?: Date;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  seasonalPrices?: PackageSeasonalInput[];
  offers?: PackageOfferInput[];
};

type PackageUpdateInput = Partial<PackageCreateInput>;

const now = () => new Date();

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

/**
 * Effective price priority (frozen design):
 * 1. Active PackageOffer (highest priority)
 * 2. Active PackageSeasonalPrice
 * 3. TourPackage.discountedPrice
 * 4. TourPackage.priceFrom
 */
type PricingOffer = { discountedPrice: unknown; priority: number; startDate: Date; endDate: Date; active: boolean; badge: string | null; label: string };
type PricingSeasonal = { discountedPrice: unknown; priceFrom: unknown; displayOrder: number; startDate: Date; endDate: Date; active: boolean; label?: string | null };
type PricingInput = {
  priceFrom: unknown;
  discountedPrice: unknown;
  offers?: PricingOffer[];
  seasonalPrices?: PricingSeasonal[];
};

function computePricing(
  priceFrom: unknown,
  discountedPrice: unknown,
  offers: PricingOffer[],
  seasonal: PricingSeasonal[],
): { effectivePrice: number; originalPrice: number; badge: string | null; offerLabel: string | null; seasonalLabel: string | null } {
  const today = now();
  const basePrice = Number(priceFrom ?? 0);
  const baseDiscounted = discountedPrice !== null && discountedPrice !== undefined ? Number(discountedPrice) : null;

  const activeOffers = offers
    .filter((o) => o.active && o.startDate <= today && o.endDate >= today)
    .sort((a, b) => b.priority - a.priority);

  const activeSeasonal = seasonal
    .filter((s) => s.active && s.startDate <= today && s.endDate >= today)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (activeOffers.length > 0) {
    const offer = activeOffers[0];
    const offerPrice = offer.discountedPrice ? Number(offer.discountedPrice) : baseDiscounted ?? basePrice;
    return {
      effectivePrice: offerPrice < basePrice ? offerPrice : basePrice,
      originalPrice: basePrice,
      badge: offer.badge ?? null,
      offerLabel: offer.label,
      seasonalLabel: null,
    };
  }

  if (activeSeasonal.length > 0) {
    const sPrice = activeSeasonal[0];
    const seasonalPrice = sPrice.discountedPrice ? Number(sPrice.discountedPrice) : Number(sPrice.priceFrom);
    return {
      effectivePrice: seasonalPrice < basePrice ? seasonalPrice : basePrice,
      originalPrice: basePrice,
      badge: null,
      offerLabel: null,
      seasonalLabel: sPrice.label ?? null,
    };
  }

  if (baseDiscounted !== null && baseDiscounted < basePrice) {
    return {
      effectivePrice: baseDiscounted,
      originalPrice: basePrice,
      badge: null,
      offerLabel: null,
      seasonalLabel: null,
    };
  }

  return {
    effectivePrice: basePrice,
    originalPrice: basePrice,
    badge: null,
    offerLabel: null,
    seasonalLabel: null,
  };
}

const pricingInclude = {
  seasonalPrices: { orderBy: { displayOrder: "asc" as const } },
  offers: { orderBy: [{ priority: "desc" as const }, { startDate: "asc" as const }] },
};

function withPricing<T extends PricingInput>(item: T) {
  const pricing = computePricing(
    item.priceFrom,
    item.discountedPrice,
    item.offers ?? [],
    item.seasonalPrices ?? [],
  );

  return {
    ...item,
    effectivePrice: pricing.effectivePrice,
    originalPrice: pricing.originalPrice,
    priceBadge: pricing.badge,
    offerLabel: pricing.offerLabel,
    seasonalLabel: pricing.seasonalLabel,
  };
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
        ...pricingInclude,
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

  async listPublished(query: {
    take?: number;
    skip?: number;
    search?: string;
    packageType?: string;
    destinationId?: string;
    featuredOnly?: boolean;
    availability?: PackageAvailability;
    sort?: "price_asc" | "price_desc" | "duration_asc" | "duration_desc" | "newest";
  } = {}) {
    const {
      take = 50,
      skip = 0,
      search,
      packageType,
      destinationId,
      featuredOnly = false,
      availability,
      sort = "newest",
    } = query;

    let orderBy: Record<string, "asc" | "desc">[] = [{ createdAt: "desc" }];

    if (sort === "price_asc") orderBy = [{ priceFrom: "asc" }];
    if (sort === "price_desc") orderBy = [{ priceFrom: "desc" }];
    if (sort === "duration_asc") orderBy = [{ durationDays: "asc" }];
    if (sort === "duration_desc") orderBy = [{ durationDays: "desc" }];

    const items = await prisma.tourPackage.findMany({
      where: {
        status: "PUBLISHED",
        isActive: true,
        ...(featuredOnly ? { featured: true } : {}),
        ...(availability ? { availability } : {}),
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
        ...pricingInclude,
      },
      orderBy,
      skip,
      take,
    });

    const priced = items.map(withPricing);
    return attachMediaToItems("PACKAGE", priced);
  },

  async getBySlug(slug: string, publishedOnly = false) {
    const item = await prisma.tourPackage.findFirst({
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
        blogs: {
          where: { status: "PUBLISHED" },
          orderBy: [{ publishedAt: "desc" }],
          take: 3,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            publishedAt: true,
            readingTimeMinutes: true,
            author: { select: { id: true, name: true, slug: true } },
          },
        },
        seasonalPrices: { orderBy: { displayOrder: "asc" } },
        offers: { orderBy: [{ priority: "desc" }, { startDate: "asc" }] },
      },
    });

    if (!item) return null;

    const [featuredMedia, galleryMedia] = await Promise.all([
      getMediaForModule("PACKAGE", item.id),
    ]).then(([resolved]) => [resolved.featuredMedia, resolved.galleryMedia]);

    return withPricing({ ...item, featuredMedia, galleryMedia });
  },

  async get(id: string) {
    const item = await prisma.tourPackage.findUnique({
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
        blogs: {
          where: { status: "PUBLISHED" },
          orderBy: [{ publishedAt: "desc" }],
          take: 3,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            publishedAt: true,
            readingTimeMinutes: true,
            author: { select: { id: true, name: true, slug: true } },
          },
        },
        seasonalPrices: { orderBy: { displayOrder: "asc" } },
        offers: { orderBy: [{ priority: "desc" }, { startDate: "asc" }] },
      },
    });

    if (!item) return null;

    const media = await getMediaForModule("PACKAGE", item.id);
    return withPricing({ ...item, featuredMedia: media.featuredMedia, galleryMedia: media.galleryMedia });
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
        discountedPrice: data.discountedPrice,
        currency: data.currency ?? "INR",
        packageType: data.packageType,
        inclusions: data.inclusions ?? [],
        exclusions: data.exclusions ?? [],
        featuredImage: data.featuredImage,
        galleryImages: data.galleryImages ?? [],
        featured: data.featured ?? false,
        status: data.status ?? "DRAFT",
        availability: data.availability ?? "AVAILABLE",
        availableSeats: data.availableSeats ?? 0,
        priceValidFrom: data.priceValidFrom,
        priceValidTo: data.priceValidTo,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isActive: data.isActive ?? true,
        seasonalPrices: data.seasonalPrices && data.seasonalPrices.length > 0
          ? { create: data.seasonalPrices.map((s) => ({
              label: s.label,
              priceFrom: s.priceFrom,
              discountedPrice: s.discountedPrice,
              displayOrder: s.displayOrder ?? 0,
              startDate: s.startDate,
              endDate: s.endDate,
              active: s.active ?? true,
            })) }
          : undefined,
        offers: data.offers && data.offers.length > 0
          ? { create: data.offers.map((o) => ({
              label: o.label,
              badge: o.badge,
              discountedPrice: o.discountedPrice,
              priority: o.priority ?? 0,
              startDate: o.startDate,
              endDate: o.endDate,
              featured: o.featured ?? false,
              active: o.active ?? true,
            })) }
          : undefined,
      },
      include: {
        destination: true,
        seasonalPrices: true,
        offers: true,
      },
    });
  },

  async update(id: string, data: PackageUpdateInput) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.title) {
      updateData.slug = await generateUniqueSlug(data.title, id);
    }

    delete updateData.id;
    delete updateData.seasonalPrices;
    delete updateData.offers;

    if (data.seasonalPrices) {
      await prisma.packageSeasonalPrice.deleteMany({ where: { packageId: id } });
      if (data.seasonalPrices.length > 0) {
        await prisma.packageSeasonalPrice.createMany({
          data: data.seasonalPrices.map((s) => ({
            packageId: id,
            label: s.label,
            priceFrom: s.priceFrom,
            discountedPrice: s.discountedPrice,
            displayOrder: s.displayOrder ?? 0,
            startDate: s.startDate,
            endDate: s.endDate,
            active: s.active ?? true,
          })),
        });
      }
    }

    if (data.offers) {
      await prisma.packageOffer.deleteMany({ where: { packageId: id } });
      if (data.offers.length > 0) {
        await prisma.packageOffer.createMany({
          data: data.offers.map((o) => ({
            packageId: id,
            label: o.label,
            badge: o.badge,
            discountedPrice: o.discountedPrice,
            priority: o.priority ?? 0,
            startDate: o.startDate,
            endDate: o.endDate,
            featured: o.featured ?? false,
            active: o.active ?? true,
          })),
        });
      }
    }

    return prisma.tourPackage.update({
      where: { id },
      data: updateData,
      include: {
        destination: true,
        seasonalPrices: { orderBy: { displayOrder: "asc" } },
        offers: { orderBy: [{ priority: "desc" }, { startDate: "asc" }] },
      },
    });
  },

  updateStatus(id: string, status: "DRAFT" | "PUBLISHED") {
    return prisma.tourPackage.update({ where: { id }, data: { status } });
  },

  updateFeatured(id: string, featured: boolean) {
    return prisma.tourPackage.update({ where: { id }, data: { featured } });
  },

  async updateAvailability(id: string, availability: PackageAvailability, availableSeats?: number) {
    return prisma.tourPackage.update({
      where: { id },
      data: { availability, ...(availableSeats !== undefined ? { availableSeats } : {}) },
    });
  },

  remove(id: string) {
    return prisma.tourPackage.update({ where: { id }, data: { isActive: false } });
  },

  // --- Seasonal Price Management ---
  addSeasonalPrice(packageId: string, data: Omit<PackageSeasonalInput, "id">) {
    return prisma.packageSeasonalPrice.create({
      data: {
        packageId,
        label: data.label,
        priceFrom: data.priceFrom,
        discountedPrice: data.discountedPrice,
        displayOrder: data.displayOrder ?? 0,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active ?? true,
      },
    });
  },

  updateSeasonalPrice(id: string, data: Partial<PackageSeasonalInput>) {
    return prisma.packageSeasonalPrice.update({
      where: { id },
      data,
    });
  },

  removeSeasonalPrice(id: string) {
    return prisma.packageSeasonalPrice.delete({ where: { id } });
  },

  // --- Offer Management ---
  addOffer(packageId: string, data: Omit<PackageOfferInput, "id">) {
    return prisma.packageOffer.create({
      data: {
        packageId,
        label: data.label,
        badge: data.badge,
        discountedPrice: data.discountedPrice,
        priority: data.priority ?? 0,
        startDate: data.startDate,
        endDate: data.endDate,
        featured: data.featured ?? false,
        active: data.active ?? true,
      },
    });
  },

  updateOffer(id: string, data: Partial<PackageOfferInput>) {
    return prisma.packageOffer.update({
      where: { id },
      data,
    });
  },

  removeOffer(id: string) {
    return prisma.packageOffer.delete({ where: { id } });
  },
};
