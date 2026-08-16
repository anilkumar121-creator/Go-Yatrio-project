-- CreateEnum
CREATE TYPE "HotelStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');
CREATE TYPE "HotelCategory" AS ENUM ('BUDGET', 'STANDARD', 'PREMIUM', 'LUXURY');
CREATE TYPE "HotelInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- AlterTable
ALTER TABLE "hotels" DROP COLUMN IF EXISTS "category",
DROP COLUMN IF EXISTS "priceFrom",
DROP COLUMN IF EXISTS "currency",
DROP COLUMN IF EXISTS "featuredImage",
DROP COLUMN IF EXISTS "isActive",
ADD COLUMN IF NOT EXISTS "shortDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "fullDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "state" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "hotelCategory" "HotelCategory" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS "starRating" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "status" "HotelStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE IF NOT EXISTS "hotel_images" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hotel_amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hotel_room_types" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "roomDescription" TEXT NOT NULL,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "bedType" TEXT NOT NULL,
    "roomSize" TEXT,
    "priceFrom" DECIMAL(12,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hotel_inquiries" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "status" "HotelInquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable implicit join table for HotelAmenity <-> Hotel
CREATE TABLE IF NOT EXISTS "_HotelToHotelAmenity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable implicit join table for Hotel <-> TourPackage
CREATE TABLE IF NOT EXISTS "_HotelToTourPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "hotel_amenities_name_key" ON "hotel_amenities"("name");
CREATE INDEX IF NOT EXISTS "hotel_images_hotelId_idx" ON "hotel_images"("hotelId");
CREATE INDEX IF NOT EXISTS "hotel_room_types_hotelId_idx" ON "hotel_room_types"("hotelId");
CREATE INDEX IF NOT EXISTS "hotel_inquiries_hotelId_idx" ON "hotel_inquiries"("hotelId");
CREATE INDEX IF NOT EXISTS "hotel_inquiries_status_createdAt_idx" ON "hotel_inquiries"("status", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "_HotelToHotelAmenity_AB_unique" ON "_HotelToHotelAmenity"("A", "B");
CREATE INDEX IF NOT EXISTS "_HotelToHotelAmenity_B_index" ON "_HotelToHotelAmenity"("B");

CREATE UNIQUE INDEX IF NOT EXISTS "_HotelToTourPackage_AB_unique" ON "_HotelToTourPackage"("A", "B");
CREATE INDEX IF NOT EXISTS "_HotelToTourPackage_B_index" ON "_HotelToTourPackage"("B");

CREATE INDEX IF NOT EXISTS "hotels_status_featured_hotelCategory_starRating_idx" ON "hotels"("status", "featured", "hotelCategory", "starRating");

-- AddForeignKeys
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hotel_room_types" ADD CONSTRAINT "hotel_room_types_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hotel_inquiries" ADD CONSTRAINT "hotel_inquiries_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_HotelToHotelAmenity" ADD CONSTRAINT "_HotelToHotelAmenity_A_fkey" FOREIGN KEY ("A") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_HotelToHotelAmenity" ADD CONSTRAINT "_HotelToHotelAmenity_B_fkey" FOREIGN KEY ("B") REFERENCES "hotel_amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_HotelToTourPackage" ADD CONSTRAINT "_HotelToTourPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_HotelToTourPackage" ADD CONSTRAINT "_HotelToTourPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
