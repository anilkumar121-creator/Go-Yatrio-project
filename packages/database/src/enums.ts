export const UserRole = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const PackageType = {
  DOMESTIC: "DOMESTIC",
  INTERNATIONAL: "INTERNATIONAL",
  LUXURY: "LUXURY",
  ADVENTURE: "ADVENTURE",
  PILGRIMAGE: "PILGRIMAGE",
} as const;

export type PackageType = (typeof PackageType)[keyof typeof PackageType];

export const InquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  IN_PROGRESS: "IN_PROGRESS",
  CONVERTED: "CONVERTED",
  CLOSED: "CLOSED",
} as const;

export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

export const InquiryServiceType = {
  DOMESTIC_TOUR: "DOMESTIC_TOUR",
  INTERNATIONAL_TOUR: "INTERNATIONAL_TOUR",
  LUXURY_TRAVEL: "LUXURY_TRAVEL",
  ADVENTURE_TRIP: "ADVENTURE_TRIP",
  PILGRIMAGE_PACKAGE: "PILGRIMAGE_PACKAGE",
  HOTEL_BOOKING: "HOTEL_BOOKING",
  CAB_BOOKING: "CAB_BOOKING",
  GENERAL_INQUIRY: "GENERAL_INQUIRY",
} as const;

export type InquiryServiceType = (typeof InquiryServiceType)[keyof typeof InquiryServiceType];

export const VehicleType = {
  HATCHBACK: "HATCHBACK",
  SEDAN: "SEDAN",
  SUV: "SUV",
  TEMPO_TRAVELLER: "TEMPO_TRAVELLER",
  BUS: "BUS",
  LUXURY: "LUXURY",
  LUXURY_SUV: "LUXURY_SUV",
  MINI_BUS: "MINI_BUS",
} as const;

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const CabTripType = {
  LOCAL: "LOCAL",
  AIRPORT_TRANSFER: "AIRPORT_TRANSFER",
  RAILWAY_TRANSFER: "RAILWAY_TRANSFER",
  OUTSTATION: "OUTSTATION",
  ONE_WAY: "ONE_WAY",
  ROUND_TRIP: "ROUND_TRIP",
  MULTI_DAY: "MULTI_DAY",
} as const;

export type CabTripType = (typeof CabTripType)[keyof typeof CabTripType];

export const CabFuelType = {
  PETROL: "PETROL",
  DIESEL: "DIESEL",
  CNG: "CNG",
  ELECTRIC: "ELECTRIC",
} as const;

export type CabFuelType = (typeof CabFuelType)[keyof typeof CabFuelType];

export const CabStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type CabStatus = (typeof CabStatus)[keyof typeof CabStatus];

export const CabInquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  CLOSED: "CLOSED",
} as const;

export type CabInquiryStatus = (typeof CabInquiryStatus)[keyof typeof CabInquiryStatus];

export const MediaResourceType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  RAW: "RAW",
} as const;

export type MediaResourceType = (typeof MediaResourceType)[keyof typeof MediaResourceType];

export const DestinationStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type DestinationStatus = (typeof DestinationStatus)[keyof typeof DestinationStatus];

export const PackageStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type PackageStatus = (typeof PackageStatus)[keyof typeof PackageStatus];

export const HotelStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type HotelStatus = (typeof HotelStatus)[keyof typeof HotelStatus];

export const HotelCategory = {
  BUDGET: "BUDGET",
  STANDARD: "STANDARD",
  PREMIUM: "PREMIUM",
  LUXURY: "LUXURY",
} as const;

export type HotelCategory = (typeof HotelCategory)[keyof typeof HotelCategory];

export const HotelInquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  CLOSED: "CLOSED",
} as const;

export type HotelInquiryStatus = (typeof HotelInquiryStatus)[keyof typeof HotelInquiryStatus];
