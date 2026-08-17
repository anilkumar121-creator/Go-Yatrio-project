-- Phase 13: Package Pricing & Availability (Safe, Non-destructive)
-- Extends the existing tour_packages table. Does NOT drop or recreate it.

-- 1. Create PackageAvailability enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PackageAvailability') THEN
    CREATE TYPE "PackageAvailability" AS ENUM ('AVAILABLE', 'LIMITED_SEATS', 'SOLD_OUT', 'UPCOMING');
  END IF;
END $$;

-- 2. Extend tour_packages with non-destructive columns
ALTER TABLE "tour_packages"
  ADD COLUMN IF NOT EXISTS "discountedPrice" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "availability" "PackageAvailability" NOT NULL DEFAULT 'AVAILABLE',
  ADD COLUMN IF NOT EXISTS "availableSeats" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "priceValidFrom" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "priceValidTo" TIMESTAMP(3);

-- 3. Create package_seasonal_prices table
CREATE TABLE IF NOT EXISTS "package_seasonal_prices" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceFrom" DECIMAL(12,2) NOT NULL,
    "discountedPrice" DECIMAL(12,2),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "package_seasonal_prices_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "package_seasonal_prices_packageId_active_idx" ON "package_seasonal_prices"("packageId", "active");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'package_seasonal_prices_packageId_fkey') THEN
    ALTER TABLE "package_seasonal_prices" ADD CONSTRAINT "package_seasonal_prices_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Create package_offers table
CREATE TABLE IF NOT EXISTS "package_offers" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "badge" TEXT,
    "discountedPrice" DECIMAL(12,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "package_offers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "package_offers_packageId_active_idx" ON "package_offers"("packageId", "active");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'package_offers_packageId_fkey') THEN
    ALTER TABLE "package_offers" ADD CONSTRAINT "package_offers_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 5. Additional index on tour_packages availability
CREATE INDEX IF NOT EXISTS "tour_packages_availability_idx" ON "tour_packages"("availability");
