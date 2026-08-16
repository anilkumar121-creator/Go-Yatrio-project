-- Phase 11: Cab Booking System (Safe, Non-destructive)
-- Extends the existing vehicles table. Does NOT drop or recreate it.

-- 1. Extend existing VehicleType enum (preserve existing values)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LUXURY_SUV' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VehicleType')) THEN
    ALTER TYPE "VehicleType" ADD VALUE 'LUXURY_SUV';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MINI_BUS' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VehicleType')) THEN
    ALTER TYPE "VehicleType" ADD VALUE 'MINI_BUS';
  END IF;
END $$;

-- 2. Create new enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CabTripType') THEN
    CREATE TYPE "CabTripType" AS ENUM ('LOCAL', 'AIRPORT_TRANSFER', 'RAILWAY_TRANSFER', 'OUTSTATION', 'ONE_WAY', 'ROUND_TRIP', 'MULTI_DAY');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CabFuelType') THEN
    CREATE TYPE "CabFuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'ELECTRIC');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CabStatus') THEN
    CREATE TYPE "CabStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CabInquiryStatus') THEN
    CREATE TYPE "CabInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');
  END IF;
END $$;

-- 3. Extend the existing vehicles table with non-destructive columns
ALTER TABLE "vehicles"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "luggageCapacity" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "ac" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "fuelType" "CabFuelType" NOT NULL DEFAULT 'DIESEL',
  ADD COLUMN IF NOT EXISTS "driverAllowance" DECIMAL(12,2) NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS "baseFare" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "extraKmCharge" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "nightCharge" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "galleryImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "tripTypes" "CabTripType"[] NOT NULL DEFAULT ARRAY[]::"CabTripType"[],
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "status" "CabStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "destinationId" TEXT;

-- 4. Backfill slug for existing rows (preserves all existing data)
UPDATE "vehicles" SET "slug" = 'cab-' || "id" WHERE "slug" IS NULL OR "slug" = '';

-- 5. Enforce NOT NULL + unique slug
ALTER TABLE "vehicles" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_slug_key" ON "vehicles"("slug");

-- 6. Foreign key to destinations (preserve data, set null on delete)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_destinationId_fkey') THEN
    ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "vehicles_destinationId_idx" ON "vehicles"("destinationId");
CREATE INDEX IF NOT EXISTS "vehicles_isActive_vehicleType_status_featured_idx" ON "vehicles"("isActive", "vehicleType", "status", "featured");

-- 7. Create cab_amenities table
CREATE TABLE IF NOT EXISTS "cab_amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cab_amenities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "cab_amenities_name_key" ON "cab_amenities"("name");

-- 8. Create cab_inquiries table
CREATE TABLE IF NOT EXISTS "cab_inquiries" (
    "id" TEXT NOT NULL,
    "cabId" TEXT NOT NULL,
    "tripType" "CabTripType" NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "dropLocation" TEXT,
    "travelDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "passengers" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "status" "CabInquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cab_inquiries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "cab_inquiries_cabId_idx" ON "cab_inquiries"("cabId");
CREATE INDEX IF NOT EXISTS "cab_inquiries_status_createdAt_idx" ON "cab_inquiries"("status", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cab_inquiries_cabId_fkey') THEN
    ALTER TABLE "cab_inquiries" ADD CONSTRAINT "cab_inquiries_cabId_fkey" FOREIGN KEY ("cabId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 9. Implicit many-to-many: CabAmenity <-> Vehicle
CREATE TABLE IF NOT EXISTS "_CabAmenityToVehicle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_CabAmenityToVehicle_AB_unique" ON "_CabAmenityToVehicle"("A", "B");
CREATE INDEX IF NOT EXISTS "_CabAmenityToVehicle_B_index" ON "_CabAmenityToVehicle"("B");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_CabAmenityToVehicle_A_fkey') THEN
    ALTER TABLE "_CabAmenityToVehicle" ADD CONSTRAINT "_CabAmenityToVehicle_A_fkey" FOREIGN KEY ("A") REFERENCES "cab_amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_CabAmenityToVehicle_B_fkey') THEN
    ALTER TABLE "_CabAmenityToVehicle" ADD CONSTRAINT "_CabAmenityToVehicle_B_fkey" FOREIGN KEY ("B") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 10. Implicit many-to-many: TourPackage <-> Vehicle
CREATE TABLE IF NOT EXISTS "_TourPackageToVehicle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_TourPackageToVehicle_AB_unique" ON "_TourPackageToVehicle"("A", "B");
CREATE INDEX IF NOT EXISTS "_TourPackageToVehicle_B_index" ON "_TourPackageToVehicle"("B");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_TourPackageToVehicle_A_fkey') THEN
    ALTER TABLE "_TourPackageToVehicle" ADD CONSTRAINT "_TourPackageToVehicle_A_fkey" FOREIGN KEY ("A") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_TourPackageToVehicle_B_fkey') THEN
    ALTER TABLE "_TourPackageToVehicle" ADD CONSTRAINT "_TourPackageToVehicle_B_fkey" FOREIGN KEY ("B") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
