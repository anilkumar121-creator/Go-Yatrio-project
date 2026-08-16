import {
  CabFuelType,
  CabInquiryStatus,
  CabStatus,
  CabTripType,
  DestinationStatus,
  HotelCategory,
  HotelInquiryStatus,
  HotelStatus,
  InquiryServiceType,
  InquiryStatus,
  MediaResourceType,
  PackageStatus,
  PackageType,
  VehicleType,
} from "@goyatrio/database";
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
  galleryImages: z.array(z.string().trim().min(1).max(500)).max(20).optional(),
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

export const packageCreateSchema = z.object({
  title: stringField(140),
  slug: slugSchema.optional(),
  shortDescription: stringField(300),
  description: stringField(6000),
  destinationId: z.string().min(1),
  durationDays: z.coerce.number().int().positive().max(365),
  durationNights: z.coerce.number().int().min(0).max(365),
  priceFrom: moneySchema,
  currency: z.string().length(3).default("INR"),
  packageType: z.enum(PackageType),
  inclusions: z.array(z.string().trim().min(1).max(300)).max(50).optional(),
  exclusions: z.array(z.string().trim().min(1).max(300)).max(50).optional(),
  featuredImage: optionalStringField(500),
  galleryImages: z.array(z.string().trim().min(1).max(500)).max(20).optional(),
  featured: z.boolean().optional(),
  status: z.enum(PackageStatus).optional(),
  metaTitle: optionalStringField(120),
  metaDescription: optionalStringField(180),
  isActive: z.boolean().optional(),
});

export const packageUpdateSchema = packageCreateSchema.partial();

export const packageStatusSchema = z.object({
  status: z.enum(PackageStatus),
});

export const packageFeaturedSchema = z.object({
  featured: z.boolean(),
});

export const activityCreateSchema = z.object({
  title: stringField(140),
  description: optionalStringField(1000),
  location: optionalStringField(200),
  timing: optionalStringField(100),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const activityUpdateSchema = activityCreateSchema.partial();

export const dayCreateSchema = z.object({
  dayNumber: z.coerce.number().int().positive().max(365),
  sortOrder: z.coerce.number().int().min(0).optional(),
  title: stringField(140),
  description: stringField(4000),
  city: optionalStringField(120),
  hotel: optionalStringField(200),
  meals: optionalStringField(200),
  transfers: optionalStringField(200),
  notes: optionalStringField(1000),
  activities: z.array(activityCreateSchema).optional(),
});

export const dayUpdateSchema = dayCreateSchema.partial();

export const reorderDaysSchema = z.object({
  dayOrders: z.array(
    z.object({
      dayId: z.string().min(1),
      sortOrder: z.coerce.number().int().min(0),
      dayNumber: z.coerce.number().int().positive().optional(),
    })
  ).min(1),
});

export const itineraryCreateSchema = z.object({
  packageId: z.string().min(1),
  title: stringField(140),
  slug: slugSchema.optional(),
  description: optionalStringField(1000),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  days: z.array(dayCreateSchema).optional(),
});

export const itineraryUpdateSchema = itineraryCreateSchema.partial();

export const hotelRoomCreateSchema = z.object({
  roomName: stringField(140),
  roomDescription: stringField(2000),
  maxGuests: z.coerce.number().int().positive().max(20).default(2),
  bedType: stringField(80),
  roomSize: optionalStringField(80),
  priceFrom: moneySchema,
  active: z.boolean().optional(),
});

export const hotelRoomUpdateSchema = hotelRoomCreateSchema.partial();

export const hotelImageCreateSchema = z.object({
  imageUrl: z.url().max(1000),
  altText: optionalStringField(180),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const hotelCreateSchema = z.object({
  name: stringField(140),
  slug: slugSchema.optional(),
  shortDescription: stringField(300),
  fullDescription: stringField(8000),
  destinationId: z.string().min(1),
  address: stringField(300),
  city: stringField(100),
  state: optionalStringField(80),
  country: stringField(80).default("India"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  hotelCategory: z.enum(HotelCategory).default("STANDARD"),
  starRating: z.coerce.number().int().min(1).max(5).default(3),
  featured: z.boolean().optional(),
  status: z.enum(HotelStatus).optional(),
  amenities: z.array(z.string().min(1)).optional(),
  images: z.array(hotelImageCreateSchema).optional(),
  roomTypes: z.array(hotelRoomCreateSchema).optional(),
});

export const hotelUpdateSchema = hotelCreateSchema.partial();

export const hotelStatusSchema = z.object({
  status: z.enum(HotelStatus),
});

export const hotelInquiryCreateSchema = z.object({
  customerName: stringField(120),
  email: z.string().email().max(255),
  phone: stringField(30),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  guests: z.coerce.number().int().positive().max(50).default(1),
  message: optionalStringField(2000),
  status: z.enum(HotelInquiryStatus).optional(),
});

export const hotelInquiryUpdateSchema = hotelInquiryCreateSchema.partial();

export const vehicleCreateSchema = z.object({
  vehicleName: stringField(140),
  vehicleType: z.enum(VehicleType),
  description: stringField(3000),
  capacity: z.coerce.number().int().positive().max(100),
  priceFrom: moneySchema,
  currency: z.string().length(3).default("INR"),
  image: optionalStringField(500),
  isActive: z.boolean().optional(),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();
export const cabAmenityCreateSchema = z.object({
  name: stringField(80),
  icon: optionalStringField(40),
  active: z.boolean().optional(),
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
  passengers: z.coerce.number().int().positive().max(100).default(1),
  message: optionalStringField(2000),
  status: z.enum(CabInquiryStatus).optional(),
});

export const cabInquiryUpdateSchema = cabInquiryCreateSchema.partial();

export const cabCreateSchema = z.object({
  vehicleName: stringField(140),
  slug: slugSchema.optional(),
  vehicleType: z.enum(VehicleType),
  description: stringField(6000),
  capacity: z.coerce.number().int().positive().max(100),
  luggageCapacity: z.coerce.number().int().min(0).max(100).optional(),
  ac: z.boolean().optional(),
  fuelType: z.enum(CabFuelType).default("DIESEL"),
  driverAllowance: moneySchema.optional(),
  baseFare: moneySchema.optional(),
  extraKmCharge: moneySchema.optional(),
  nightCharge: moneySchema.optional(),
  priceFrom: moneySchema,
  currency: z.string().length(3).default("INR"),
  image: optionalStringField(500),
  galleryImages: z.array(z.url().max(1000)).max(20).optional(),
  tripTypes: z.array(z.enum(CabTripType)).optional(),
  featured: z.boolean().optional(),
  status: z.enum(CabStatus).optional(),
  destinationId: optionalStringField(255),
  amenities: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
});

export const cabUpdateSchema = cabCreateSchema.partial();

export const cabStatusSchema = z.object({
  status: z.enum(CabStatus),
});

export const inquiryCreateSchema = z.object({
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

export const inquiryUpdateSchema = inquiryCreateSchema.partial();

export const blogCreateSchema = z.object({
  title: stringField(160),
  slug: slugSchema,
  excerpt: stringField(300),
  content: stringField(20000),
  featuredImage: optionalStringField(500),
  author: stringField(120),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
  seoTitle: optionalStringField(120),
  seoDescription: optionalStringField(180),
});

export const blogUpdateSchema = blogCreateSchema.partial();

export const mediaCreateSchema = z.object({
  publicId: stringField(255),
  url: z.url().max(1000),
  secureUrl: z.url().max(1000),
  resourceType: z.enum(MediaResourceType),
  format: optionalStringField(40),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  altText: optionalStringField(180),
});

export const mediaUpdateSchema = mediaCreateSchema.partial();
