import {
  DestinationStatus,
  InquiryServiceType,
  InquiryStatus,
  MediaResourceType,
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
  slug: slugSchema,
  shortDescription: stringField(300),
  description: stringField(6000),
  destinationId: z.string().min(1),
  durationDays: z.coerce.number().int().positive().max(365),
  durationNights: z.coerce.number().int().min(0).max(365),
  priceFrom: moneySchema,
  currency: z.string().length(3).default("INR"),
  packageType: z.enum(PackageType),
  featuredImage: optionalStringField(500),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitle: optionalStringField(120),
  seoDescription: optionalStringField(180),
});

export const packageUpdateSchema = packageCreateSchema.partial();

export const itineraryCreateSchema = z.object({
  packageId: z.string().min(1),
  dayNumber: z.coerce.number().int().positive().max(365),
  title: stringField(140),
  description: stringField(4000),
  accommodation: optionalStringField(500),
  meals: optionalStringField(500),
  activities: optionalStringField(1000),
});

export const itineraryUpdateSchema = itineraryCreateSchema.partial();

export const hotelCreateSchema = z.object({
  name: stringField(140),
  slug: slugSchema,
  destinationId: z.string().min(1),
  description: stringField(4000),
  address: stringField(500),
  category: stringField(80),
  priceFrom: moneySchema,
  currency: z.string().length(3).default("INR"),
  featuredImage: optionalStringField(500),
  isActive: z.boolean().optional(),
});

export const hotelUpdateSchema = hotelCreateSchema.partial();

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