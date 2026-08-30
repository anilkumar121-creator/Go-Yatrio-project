import {
  BlogContentFormat,
  BlogStatus,
  CabFuelType,
  PackageAvailability,
  CabStatus,
  CabTripType,
  DestinationStatus,
  HotelCategory,
  HotelStatus,
  InquiryServiceType,
  InquiryStatus,
  MediaResourceType,
  PackageStatus,
  PackageType,
  VehicleType,
} from "../db.js";
import { z } from "zod";
import { moneySchema, optionalStringField, slugSchema, stringField } from "./common.js";

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const registerSchema = z.object({
  name: stringField(120),
  email: z.string().email().max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required").optional(),
});

export const destinationCreateSchema = z.object({
  name: stringField(120),
  slug: slugSchema.optional(),
  shortDescription: stringField(300),
  description: stringField(5000),
  state: optionalStringField(80),
  country: stringField(80).default("India"),
  featuredImage: optionalStringField(500),
  galleryimages: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.coerce.number().int().optional(),
      }),
    )
    .max(20)
    .optional(),
  featured: z.boolean().optional(),
  status: z.enum(DestinationStatus).optional(),
  metaTitle: optionalStringField(120),
  metaDescription: optionalStringField(180),
  isActive: z.boolean().optional(),
});

export const destinationUpdateSchema = destinationCreateSchema.partial();

export const destinationStatusSchema = z.object({
  status: z.enum(DestinationStatus),
});

export const destinationFeaturedSchema = z.object({
  featured: z.boolean(),
});

export const packageSeasonalPriceSchema = z.object({
  id: optionalStringField(255),
  label: stringField(120),
  priceFrom: moneySchema,
  discountedPrice: moneySchema.optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  active: z.boolean().optional(),
});

export const packageOfferSchema = z.object({
  id: optionalStringField(255),
  label: stringField(120),
  badge: optionalStringField(80),
  discountedPrice: moneySchema.optional(),
  priority: z.coerce.number().int().min(0).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const packageCreateSchema = z.object({
  title: stringField(140),
  slug: slugSchema.optional(),
  shortDescription: stringField(300),
  description: stringField(6000),
  destinationId: z.string().min(1),
  durationDays: z.coerce.number().int().positive().max(365),
  durationNights: z.coerce.number().int().min(0).max(365),
  priceFrom: moneySchema,
  discountedPrice: moneySchema.optional(),
  currency: z.string().length(3).default("INR"),
  packageType: z.enum(PackageType),
  inclusions: z.array(z.string().trim().min(1).max(300)).max(50).optional(),
  exclusions: z.array(z.string().trim().min(1).max(300)).max(50).optional(),
  featuredImage: optionalStringField(500),
  galleryimages: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.coerce.number().int().optional(),
      }),
    )
    .max(20)
    .optional(),
  featured: z.boolean().optional(),
  status: z.enum(PackageStatus).optional(),
  availability: z.enum(PackageAvailability).optional(),
  availableSeats: z.coerce.number().int().min(0).max(100000).optional(),
  priceValidFrom: z.coerce.date().optional(),
  priceValidTo: z.coerce.date().optional(),
  metaTitle: optionalStringField(120),
  metaDescription: optionalStringField(180),
  isActive: z.boolean().optional(),
  seasonalPrices: z.array(packageSeasonalPriceSchema).optional(),
  offers: z.array(packageOfferSchema).optional(),
});

export const packageUpdateSchema = packageCreateSchema.partial();

export const packageStatusSchema = z.object({
  status: z.enum(PackageStatus),
});

export const packageFeaturedSchema = z.object({
  featured: z.boolean(),
});

export const packageAvailabilitySchema = z.object({
  availability: z.enum(PackageAvailability),
  availableSeats: z.coerce.number().int().min(0).max(100000).optional(),
});

export const activityCreateSchema = z.object({
  title: stringField(140),
  description: stringField(1000),
  location: optionalStringField(200),
  timing: optionalStringField(100),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const activityUpdateSchema = activityCreateSchema.partial();

export const dayCreateSchema = z.object({
  dayNumber: z.coerce.number().int().positive().max(365),
  sortOrder: z.coerce.number().int().min(0).default(0),
  title: stringField(140),
  description: stringField(2000),
});

export const dayUpdateSchema = dayCreateSchema.partial();

export const itineraryCreateSchema = z.object({
  packageId: z.string().min(1),
  dayNumber: z.coerce.number().int().positive().max(365),
  title: stringField(140),
  description: stringField(2000),
});

export const itineraryUpdateSchema = itineraryCreateSchema.partial();

export const reorderDaysSchema = z.object({
  dayOrders: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.coerce.number().int().min(0),
        dayNumber: z.coerce.number().int().min(0).optional(),
      }),
    )
    .min(1),
});

export const hotelCreateSchema = z.object({
  name: stringField(140),
  slug: slugSchema.optional(),
  shortDescription: stringField(300),
  fullDescription: stringField(5000),
  destinationId: z.string().min(1),
  address: stringField(200),
  city: stringField(120),
  state: optionalStringField(80),
  country: stringField(80).default("India"),
  hotelCategory: z.enum(HotelCategory),
  starRating: z.coerce.number().int().min(1).max(5).default(3),
  featured: z.boolean().optional(),
  status: z.enum(HotelStatus).optional(),
  metaTitle: optionalStringField(120),
  metaDescription: optionalStringField(180),
  amenities: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.coerce.number().int().optional(),
      }),
    )
    .max(20)
    .optional(),
  roomTypes: z
    .array(
      z.object({
        roomName: stringField(80),
        roomDescription: stringField(500),
        maxGuests: z.coerce.number().int().positive(),
        bedType: stringField(60),
        roomSize: optionalStringField(60),
        priceFrom: moneySchema,
        active: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const hotelUpdateSchema = hotelCreateSchema.partial();

export const hotelStatusSchema = z.object({
  status: z.enum(HotelStatus),
});

export const hotelFeaturedSchema = z.object({
  featured: z.boolean(),
});

export const hotelInquiryCreateSchema = z.object({
  customerName: stringField(120),
  email: z.string().email().max(255),
  phone: stringField(30),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  guests: z.coerce.number().int().positive().optional(),
  message: optionalStringField(2000).optional(),
});

export const hotelInquiryUpdateSchema = hotelInquiryCreateSchema.partial();

export const cabCreateSchema = z.object({
  vehicleName: stringField(140),
  slug: slugSchema.optional(),
  vehicleType: z.enum(VehicleType),
  description: stringField(1000),
  capacity: z.coerce.number().int().positive().max(50),
  luggageCapacity: z.coerce.number().int().min(0).max(20),
  ac: z.boolean().optional(),
  fuelType: z.enum(CabFuelType),
  driverAllowance: moneySchema,
  baseFare: moneySchema,
  extraKmCharge: moneySchema,
  nightCharge: moneySchema,
  priceFrom: moneySchema,
  currency: z.string().length(3).default("INR"),
  image: optionalStringField(500),
  galleryimages: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.coerce.number().int().optional(),
      }),
    )
    .max(20)
    .optional(),
  tripTypes: z.array(z.enum(CabTripType)).min(1),
  featured: z.boolean().optional(),
  status: z.enum(CabStatus).optional(),
  destinationId: optionalStringField(120),
  metaTitle: optionalStringField(120),
  metaDescription: optionalStringField(180),
  amenities: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
});

export const cabUpdateSchema = cabCreateSchema.partial();

export const cabStatusSchema = z.object({
  status: z.enum(CabStatus),
});

export const cabInquiryCreateSchema = z.object({
  tripType: z.enum(CabTripType),
  customerName: stringField(120),
  email: z.string().email().max(255),
  phone: stringField(30),
  pickupLocation: optionalStringField(200),
  dropLocation: optionalStringField(200),
  travelDate: z.coerce.date().optional(),
  returnDate: z.coerce.date().optional(),
  passengers: z.coerce.number().int().positive().max(20).optional(),
  message: optionalStringField(2000).optional(),
});

export const cabInquiryUpdateSchema = cabInquiryCreateSchema.partial();

// Travel inquiry (legacy)
export const travelInquiryCreateSchema = z.object({
  fullName: stringField(120),
  email: z.string().email().max(255),
  phone: stringField(30),
  travelDate: z.coerce.date().optional(),
  numberOfTravelers: z.coerce.number().int().positive().max(500).optional(),
  destination: optionalStringField(140),
  packageId: z.string().min(1).optional(),
  serviceType: z.enum(InquiryServiceType),
  budget: moneySchema.optional(),
  message: optionalStringField(3000),
  status: z.enum(InquiryStatus).optional(),
  source: z.string().trim().min(1).max(80).default("website"),
});

export const travelInquiryUpdateSchema = travelInquiryCreateSchema.partial();

const inquirySourceValues = [
  "WEBSITE",
  "PACKAGE_PAGE",
  "HOTEL_PAGE",
  "CAB_PAGE",
  "CONTACT_FORM",
  "BLOG_PAGE",
  "WHATSAPP",
  "PHONE",
  "EMAIL",
  "MANUAL",
] as const;

const inquiryPriorityValues = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const inquiryTypeValues = ["TOUR_PACKAGE", "HOTEL", "CAB", "GENERAL", "CUSTOM_TOUR"] as const;
const inquiryStatusValues = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "CLOSED",
] as const;

// Phase 16: Inquiry & Lead Management validation schemas
export const inquiryCreateSchema = z.object({
  name: stringField(120),
  email: z.string().email().max(255),
  phone: z.string().min(8).max(20),
  whatsapp: z.string().max(20).optional(),
  country: optionalStringField(80),
  city: optionalStringField(80),
  adults: z.coerce.number().int().min(1).max(20).default(1),
  children: z.coerce.number().int().min(0).max(10).default(0),
  travelDate: z.coerce.date().optional(),
  budget: moneySchema.optional(),
  message: optionalStringField(2000),
  source: z.enum(inquirySourceValues).default("WEBSITE"),
  type: z.enum(inquiryTypeValues).default("GENERAL"),
  packageId: z.string().optional(),
  hotelId: z.string().optional(),
  cabId: z.string().optional(),
});

export const inquiryUpdateSchema = z.object({
  name: stringField(120).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(8).max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  country: optionalStringField(80).optional(),
  city: optionalStringField(80).optional(),
  adults: z.coerce.number().int().min(1).max(20).optional(),
  children: z.coerce.number().int().min(0).max(10).optional(),
  travelDate: z.coerce.date().optional(),
  budget: moneySchema.optional(),
  message: optionalStringField(2000).optional(),
  source: z.enum(inquirySourceValues).optional(),
  type: z.enum(inquiryTypeValues).optional(),
  status: z.enum(inquiryStatusValues).optional(),
  priority: z.enum(inquiryPriorityValues).optional(),
  assignedTo: z.string().optional(),
  packageId: z.string().optional(),
  hotelId: z.string().optional(),
  cabId: z.string().optional(),
});

export const inquiryStatusUpdateSchema = z.object({
  status: z.enum(inquiryStatusValues),
});

export const inquiryPriorityUpdateSchema = z.object({
  priority: z.enum(inquiryPriorityValues),
});

export const inquiryAssignSchema = z.object({
  assignedTo: z.string().min(1),
});

export const inquiryNoteCreateSchema = z.object({
  note: z.string().min(1).max(5000),
  createdBy: z.string().min(1),
});

export const inquiryNoteUpdateSchema = z.object({
  note: z.string().min(1).max(5000),
});

export const blogContentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), content: z.string().max(5000) }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    content: z.string().max(500),
  }),
  z.object({
    type: z.literal("image"),
    attrs: z.object({
      publicId: optionalStringField(255),
      url: optionalStringField(1000),
      alt: z.string().max(300),
      caption: optionalStringField(500),
      width: z.coerce.number().int().positive().optional(),
      height: z.coerce.number().int().positive().optional(),
      alignment: z.enum(["left", "center", "right"]).optional(),
    }),
  }),
  z.object({ type: z.literal("gallery"), images: z.array(z.any()).max(20) }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(z.string().max(1000)).max(50),
  }),
  z.object({
    type: z.literal("quote"),
    content: z.string().max(2000),
    cite: optionalStringField(300),
  }),
  z.object({
    type: z.literal("code"),
    language: optionalStringField(60),
    code: z.string().max(20000),
  }),
  z.object({
    type: z.literal("embed"),
    provider: z.enum(["youtube", "vimeo", "generic"]),
    url: z.string().url().max(1000),
  }),
  z.object({ type: z.literal("divider") }),
  z.object({
    type: z.literal("cta"),
    title: z.string().max(200),
    description: optionalStringField(500),
    links: z
      .array(
        z.object({
          label: z.string().max(100),
          href: z.string().max(1000),
          variant: z.enum(["primary", "outline"]).optional(),
        }),
      )
      .max(8),
  }),
  z.object({
    type: z.literal("callout"),
    variant: z.enum(["info", "warning", "success"]),
    title: optionalStringField(200),
    content: z.string().max(2000),
  }),
  z.object({
    type: z.literal("accordion"),
    items: z.array(z.object({ title: z.string().max(300), content: z.string().max(3000) })).max(20),
  }),
  z.object({
    type: z.literal("linkCard"),
    title: z.string().max(300),
    url: z.string().url().max(1000),
    description: optionalStringField(500),
  }),
]);

export const blogCreateSchema = z.object({
  title: stringField(200),
  slug: slugSchema.optional(),
  excerpt: stringField(500),
  content: stringField(50000),
  contentFormat: z.enum(BlogContentFormat).default("JSON_BLOCKS"),
  contentBlocks: z.array(blogContentBlockSchema).optional(),
  faq: z
    .array(z.object({ question: stringField(300), answer: stringField(3000) }))
    .max(50)
    .optional(),
  featuredImage: optionalStringField(1000),
  featuredImagePublicId: optionalStringField(255),
  galleryImages: z.array(z.string().url().max(1000)).max(20).optional(),
  authorId: optionalStringField(255),
  authorName: optionalStringField(120),
  status: z.enum(BlogStatus).optional(),
  featured: z.boolean().optional(),
  readingTimeMinutes: z.coerce.number().int().min(0).max(600).optional(),
  viewCount: z.coerce.number().int().min(0).optional(),
  publishedAt: z.coerce.date().optional(),
  seoTitle: optionalStringField(160),
  seoDescription: optionalStringField(200),
  canonicalUrl: optionalStringField(1000),
  ogImage: optionalStringField(1000),
  categoryIds: z.array(z.string().min(1)).optional(),
  tagIds: z.array(z.string().min(1)).optional(),
  destinationIds: z.array(z.string().min(1)).optional(),
  packageIds: z.array(z.string().min(1)).optional(),
});

export const blogUpdateSchema = blogCreateSchema.partial();

export const blogStatusSchema = z.object({
  status: z.enum(BlogStatus),
});

export const blogCategoryCreateSchema = z.object({
  name: stringField(120),
  slug: slugSchema.optional(),
  description: optionalStringField(500),
});

export const blogCategoryUpdateSchema = blogCategoryCreateSchema.partial();

export const blogTagCreateSchema = z.object({
  name: stringField(80),
  slug: slugSchema.optional(),
});

export const blogTagUpdateSchema = blogTagCreateSchema.partial();

export const blogAuthorCreateSchema = z.object({
  name: stringField(120),
  slug: slugSchema.optional(),
  bio: optionalStringField(2000),
  avatar: optionalStringField(1000),
  role: optionalStringField(120),
  email: z.string().email().max(255).optional(),
});

export const blogAuthorUpdateSchema = blogAuthorCreateSchema.partial();

export const mediaCreateSchema = z.object({
  publicId: stringField(255),
  url: z.string().url().max(1000),
  secureUrl: z.string().url().max(1000),
  resourceType: z.enum(MediaResourceType),
  format: optionalStringField(40),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  altText: optionalStringField(180),
});

export const mediaUpdateSchema = mediaCreateSchema.partial();

export const lookupGroupCreateSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Z0-9_]+$/, "Key must use uppercase letters, numbers, and underscores."),
  name: stringField(140),
  description: optionalStringField(500),
});

export const lookupGroupUpdateSchema = lookupGroupCreateSchema.partial();

export const lookupItemCreateSchema = z.object({
  groupId: z.string().min(1),
  label: stringField(140),
  value: stringField(140),
  description: optionalStringField(500),
  icon: optionalStringField(60),
  color: optionalStringField(40),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const lookupItemUpdateSchema = lookupItemCreateSchema.partial();

export const lookupItemStatusSchema = z.object({
  isActive: z.boolean(),
});

export const lookupItemOrderSchema = z.object({
  sortOrder: z.coerce.number().int().min(0),
});

// Phase 17: SEO Metadata schemas
export const seoMetadataCreateSchema = z.object({
  pageType: stringField(80),
  entityType: optionalStringField(80).nullable(),
  entityId: optionalStringField(120).nullable(),
  title: stringField(160),
  description: stringField(300),
  canonicalUrl: optionalStringField(1000),
  ogImage: optionalStringField(1000),
  robots: optionalStringField(100),
});

export const seoMetadataUpdateSchema = seoMetadataCreateSchema.partial();
