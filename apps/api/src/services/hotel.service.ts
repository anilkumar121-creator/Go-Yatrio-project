import { prisma, HotelCategory, HotelStatus, HotelInquiryStatus } from "@goyatrio/database";
import { attachMediaToItems, getMediaForModule } from "../utils/media-resolver.js";

type HotelImageInput = {
  imageUrl: string;
  altText?: string;
  sortOrder?: number;
};

type HotelRoomTypeInput = {
  roomName: string;
  roomDescription: string;
  maxGuests?: number;
  bedType: string;
  roomSize?: string;
  priceFrom: number;
  active?: boolean;
};

type HotelCreateInput = {
  name: string;
  slug?: string;
  shortDescription: string;
  fullDescription: string;
  destinationId: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  hotelCategory?: HotelCategory;
  starRating?: number;
  featured?: boolean;
  status?: HotelStatus;
  amenities?: string[];
  images?: HotelImageInput[];
  roomTypes?: HotelRoomTypeInput[];
};

type HotelUpdateInput = Partial<HotelCreateInput>;

type HotelInquiryInput = {
  customerName: string;
  email: string;
  phone: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests?: number;
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

async function generateUniqueHotelSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "hotel";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.hotel.findUnique({
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

export const hotelService = {
  list: async (query: {
    take?: number;
    skip?: number;
    search?: string;
    destinationId?: string;
    destinationSlug?: string;
    category?: HotelCategory;
    starRating?: number;
    status?: HotelStatus;
    featuredOnly?: boolean;
    sort?: "price_asc" | "price_desc" | "rating_desc" | "newest";
  } = {}) => {
    const {
      take = 50,
      skip = 0,
      search,
      destinationId,
      destinationSlug,
      category,
      starRating,
      status,
      featuredOnly = false,
      sort = "newest",
    } = query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (featuredOnly) where.featured = true;
    if (category) where.hotelCategory = category;
    if (starRating) where.starRating = starRating;
    if (destinationId) where.destinationId = destinationId;
    if (destinationSlug) where.destination = { slug: destinationSlug };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { destination: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    let orderBy: Record<string, "asc" | "desc">[] = [{ createdAt: "desc" }];

    if (sort === "rating_desc") orderBy = [{ starRating: "desc" }, { createdAt: "desc" }];

    const [total, items] = await Promise.all([
      prisma.hotel.count({ where }),
      prisma.hotel.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          destination: {
            select: { id: true, name: true, slug: true, state: true, country: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 5,
          },
          amenities: true,
          roomTypes: {
            where: { active: true },
            orderBy: { priceFrom: "asc" },
          },
        },
      }),
    ]);

    return {
      total,
      items: await attachMediaToItems("HOTEL", items),
    };
  },

  listFeatured: async (take = 6) => {
    return prisma.hotel.findMany({
      where: {
        status: HotelStatus.ACTIVE,
        featured: true,
      },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        destination: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 3 },
        amenities: true,
        roomTypes: { where: { active: true }, orderBy: { priceFrom: "asc" } },
      },
    }).then((items) => attachMediaToItems("HOTEL", items));
  },

  listByDestinationSlug: async (destinationSlug: string, take = 20) => {
    return prisma.hotel.findMany({
      where: {
        destination: { slug: destinationSlug },
        status: HotelStatus.ACTIVE,
      },
      take,
      orderBy: [{ featured: "desc" }, { starRating: "desc" }],
      include: {
        destination: true,
        images: { orderBy: { sortOrder: "asc" }, take: 3 },
        amenities: true,
        roomTypes: { where: { active: true }, orderBy: { priceFrom: "asc" } },
      },
    }).then((items) => attachMediaToItems("HOTEL", items));
  },

  getBySlug: async (slug: string) => {
    const hotel = await prisma.hotel.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
      },
      include: {
        destination: true,
        images: { orderBy: { sortOrder: "asc" } },
        amenities: true,
        roomTypes: { where: { active: true }, orderBy: { priceFrom: "asc" } },
        packages: {
          where: { status: "PUBLISHED", isActive: true },
          select: { id: true, title: true, slug: true, durationDays: true, priceFrom: true },
        },
      },
    });

    if (!hotel) return null;

    const media = await getMediaForModule("HOTEL", hotel.id);
    return { ...hotel, featuredMedia: media.featuredMedia, galleryMedia: media.galleryMedia };
  },

  getById: async (id: string) => {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        destination: true,
        images: { orderBy: { sortOrder: "asc" } },
        amenities: true,
        roomTypes: { orderBy: { priceFrom: "asc" } },
        inquiries: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!hotel) return null;

    const media = await getMediaForModule("HOTEL", hotel.id);
    return { ...hotel, featuredMedia: media.featuredMedia, galleryMedia: media.galleryMedia };
  },

  create: async (data: HotelCreateInput) => {
    const slug = data.slug ? slugify(data.slug) : await generateUniqueHotelSlug(data.name);

    return prisma.hotel.create({
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        destinationId: data.destinationId,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country ?? "India",
        latitude: data.latitude,
        longitude: data.longitude,
        hotelCategory: data.hotelCategory ?? HotelCategory.STANDARD,
        starRating: data.starRating ?? 3,
        featured: data.featured ?? false,
        status: data.status ?? HotelStatus.DRAFT,
        amenities: data.amenities && data.amenities.length > 0
          ? {
              connectOrCreate: data.amenities.map((name) => ({
                where: { name },
                create: { name, active: true },
              })),
            }
          : undefined,
        images: data.images && data.images.length > 0
          ? {
              create: data.images.map((img, idx) => ({
                imageUrl: img.imageUrl,
                altText: img.altText ?? data.name,
                sortOrder: img.sortOrder ?? idx + 1,
              })),
            }
          : undefined,
        roomTypes: data.roomTypes && data.roomTypes.length > 0
          ? {
              create: data.roomTypes.map((rt) => ({
                roomName: rt.roomName,
                roomDescription: rt.roomDescription,
                maxGuests: rt.maxGuests ?? 2,
                bedType: rt.bedType,
                roomSize: rt.roomSize,
                priceFrom: rt.priceFrom,
                active: rt.active ?? true,
              })),
            }
          : undefined,
      },
      include: {
        destination: true,
        images: true,
        amenities: true,
        roomTypes: true,
      },
    });
  },

  update: async (id: string, data: HotelUpdateInput) => {
    let slug: string | undefined = undefined;
    if (data.slug || data.name) {
      slug = await generateUniqueHotelSlug(data.slug ?? data.name ?? "hotel", id);
    }

    return prisma.hotel.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        destinationId: data.destinationId,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        hotelCategory: data.hotelCategory,
        starRating: data.starRating,
        featured: data.featured,
        status: data.status,
      },
      include: {
        destination: true,
        images: true,
        amenities: true,
        roomTypes: true,
      },
    });
  },

  updateStatus: async (id: string, status: HotelStatus) => {
    return prisma.hotel.update({
      where: { id },
      data: { status },
    });
  },

  remove: async (id: string) => {
    return prisma.hotel.delete({
      where: { id },
    });
  },

  createInquiry: async (hotelId: string, data: HotelInquiryInput) => {
    return prisma.hotelInquiry.create({
      data: {
        hotelId,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guests: data.guests ?? 1,
        message: data.message,
        status: HotelInquiryStatus.NEW,
      },
      include: {
        hotel: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  getAmenities: async () => {
    return prisma.hotelAmenity.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  },
};
