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

export const InquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  IN_PROGRESS: "IN_PROGRESS",
  CONVERTED: "CONVERTED",
  CLOSED: "CLOSED",
} as const;

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

export const VehicleType = {
  HATCHBACK: "HATCHBACK",
  SEDAN: "SEDAN",
  SUV: "SUV",
  TEMPO_TRAVELLER: "TEMPO_TRAVELLER",
  BUS: "BUS",
  LUXURY: "LUXURY",
} as const;

export const MediaResourceType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  RAW: "RAW",
} as const;