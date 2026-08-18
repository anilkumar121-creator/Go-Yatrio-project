import { prisma, CabStatus, CabTripType, CabFuelType, VehicleType } from "@goyatrio/database";
import { attachMediaToItems, getMediaForModule } from "../utils/media-resolver.js";

type CabCreateInput = {
  vehicleName: string;
  slug?: string;
  vehicleType: VehicleType;
  description: string;
  capacity: number;
  luggageCapacity?: number;
  ac?: boolean;
  fuelType?: CabFuelType;
  driverAllowance?: number;
  baseFare?: number;
  extraKmCharge?: number;
  nightCharge?: number;
  priceFrom: number;
  currency?: string;
  image?: string;
  galleryImages?: string[];
  tripTypes?: CabTripType[];
  featured?: boolean;
  status?: CabStatus;
  destinationId?: string;
  amenities?: string[];
};

type CabUpdateInput = Partial<CabCreateInput>;

type CabInquiryInput = {
  tripType: CabTripType;
  customerName: string;
  email: string;
  phone: string;
  pickupLocation?: string;
  dropLocation?: string;
  travelDate?: Date;
  returnDate?: Date;
  passengers?: number;
  message?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueCabSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "cab";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.vehicle.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter++;
  }
}

export const cabService = {
  list: async (query: {
    take?: number;
    skip?: number;
    search?: string;
    vehicleType?: VehicleType;
    tripType?: CabTripType;
    destinationId?: string;
    destinationSlug?: string;
    status?: CabStatus;
    featuredOnly?: boolean;
    sort?: "price_asc" | "price_desc" | "capacity_desc" | "newest";
  } = {}) => {
    const {
      take = 50,
      skip = 0,
      search,
      vehicleType,
      tripType,
      destinationId,
      destinationSlug,
      status,
      featuredOnly = false,
      sort = "newest",
    } = query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (featuredOnly) where.featured = true;
    if (vehicleType) where.vehicleType = vehicleType;
    if (destinationId) where.destinationId = destinationId;
    if (destinationSlug) where.destination = { slug: destinationSlug };

    if (tripType) {
      where.tripTypes = { has: tripType };
    }

    if (search) {
      where.OR = [
        { vehicleName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { destination: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    let orderBy: Record<string, "asc" | "desc">[] = [{ createdAt: "desc" }];
    if (sort === "price_asc") orderBy = [{ priceFrom: "asc" }];
    if (sort === "price_desc") orderBy = [{ priceFrom: "desc" }];
    if (sort === "capacity_desc") orderBy = [{ capacity: "desc" }];

    const [total, items] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          destination: { select: { id: true, name: true, slug: true, state: true, country: true } },
          amenities: true,
        },
      }),
    ]);

    return {
      total,
      items: await attachMediaToItems("CAB", items),
    };
  },

  listFeatured: async (take = 6) => {
    return prisma.vehicle.findMany({
      where: { status: CabStatus.ACTIVE, isActive: true, featured: true },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        destination: { select: { id: true, name: true, slug: true } },
        amenities: true,
      },
    }).then((items) => attachMediaToItems("CAB", items));
  },

  listByDestinationSlug: async (destinationSlug: string, take = 20) => {
    return prisma.vehicle.findMany({
      where: {
        destination: { slug: destinationSlug },
        status: CabStatus.ACTIVE,
        isActive: true,
      },
      take,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        destination: true,
        amenities: true,
      },
    }).then((items) => attachMediaToItems("CAB", items));
  },

  getBySlug: async (slug: string) => {
    const cab = await prisma.vehicle.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        destination: true,
        amenities: true,
        packages: {
          where: { status: "PUBLISHED", isActive: true },
          select: { id: true, title: true, slug: true, durationDays: true, priceFrom: true },
        },
      },
    });

    if (!cab) return null;

    const media = await getMediaForModule("CAB", cab.id);
    return { ...cab, featuredMedia: media.featuredMedia, galleryMedia: media.galleryMedia };
  },

  get: async (id: string) => {
    const cab = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        destination: true,
        amenities: true,
        inquiries: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!cab) return null;

    const media = await getMediaForModule("CAB", cab.id);
    return { ...cab, featuredMedia: media.featuredMedia, galleryMedia: media.galleryMedia };
  },

  create: async (data: CabCreateInput) => {
    const slug = data.slug ? slugify(data.slug) : await generateUniqueCabSlug(data.vehicleName);

    return prisma.vehicle.create({
      data: {
        vehicleName: data.vehicleName,
        slug,
        vehicleType: data.vehicleType,
        description: data.description,
        capacity: data.capacity,
        luggageCapacity: data.luggageCapacity ?? 0,
        ac: data.ac ?? true,
        fuelType: data.fuelType ?? CabFuelType.DIESEL,
        driverAllowance: data.driverAllowance ?? 300,
        baseFare: data.baseFare ?? 0,
        extraKmCharge: data.extraKmCharge ?? 0,
        nightCharge: data.nightCharge ?? 0,
        priceFrom: data.priceFrom,
        currency: data.currency ?? "INR",
        image: data.image,
        galleryImages: data.galleryImages ?? [],
        tripTypes: data.tripTypes ?? [CabTripType.LOCAL],
        featured: data.featured ?? false,
        status: data.status ?? CabStatus.DRAFT,
        isActive: true,
        destinationId: data.destinationId || null,
        amenities: data.amenities && data.amenities.length > 0
          ? {
              connectOrCreate: data.amenities.map((name) => ({
                where: { name },
                create: { name, active: true },
              })),
            }
          : undefined,
      },
      include: {
        destination: true,
        amenities: true,
      },
    });
  },

  update: async (id: string, data: CabUpdateInput) => {
    let slug: string | undefined = undefined;
    if (data.slug || data.vehicleName) {
      slug = await generateUniqueCabSlug(data.slug ?? data.vehicleName ?? "cab", id);
    }

    return prisma.vehicle.update({
      where: { id },
      data: {
        vehicleName: data.vehicleName,
        slug,
        vehicleType: data.vehicleType,
        description: data.description,
        capacity: data.capacity,
        luggageCapacity: data.luggageCapacity,
        ac: data.ac,
        fuelType: data.fuelType,
        driverAllowance: data.driverAllowance,
        baseFare: data.baseFare,
        extraKmCharge: data.extraKmCharge,
        nightCharge: data.nightCharge,
        priceFrom: data.priceFrom,
        currency: data.currency,
        image: data.image,
        galleryImages: data.galleryImages,
        tripTypes: data.tripTypes,
        featured: data.featured,
        status: data.status,
        destinationId: data.destinationId ?? null,
      },
      include: {
        destination: true,
        amenities: true,
      },
    });
  },

  updateStatus: async (id: string, status: CabStatus) => {
    return prisma.vehicle.update({
      where: { id },
      data: { status },
    });
  },

  updateFeatured: async (id: string, featured: boolean) => {
    return prisma.vehicle.update({
      where: { id },
      data: { featured },
    });
  },

  remove: async (id: string) => {
    return prisma.vehicle.update({
      where: { id },
      data: { isActive: false },
    });
  },

  createInquiry: async (cabId: string, data: CabInquiryInput) => {
    return prisma.cabInquiry.create({
      data: {
        cabId,
        tripType: data.tripType,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        travelDate: data.travelDate,
        returnDate: data.returnDate,
        passengers: data.passengers ?? 1,
        message: data.message,
      },
      include: {
        cab: { select: { id: true, vehicleName: true, slug: true } },
      },
    });
  },

  getAmenities: async () => {
    return prisma.cabAmenity.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  },
};
