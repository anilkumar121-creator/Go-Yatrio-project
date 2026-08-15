-- Redefine itineraries and create itinerary_days and day_activities

-- Drop foreign key on itineraries if exists
ALTER TABLE IF EXISTS "itineraries" DROP CONSTRAINT IF EXISTS "itineraries_packageId_fkey";

-- Recreate itineraries table
CREATE TABLE IF NOT EXISTS "itineraries_new" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "itineraries_slug_key" ON "itineraries_new"("slug");
CREATE INDEX IF NOT EXISTS "itineraries_packageId_idx" ON "itineraries_new"("packageId");

-- Create itinerary_days table
CREATE TABLE IF NOT EXISTS "itinerary_days" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT,
    "hotel" TEXT,
    "meals" TEXT,
    "transfers" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_days_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "itinerary_days_itineraryId_dayNumber_key" ON "itinerary_days"("itineraryId", "dayNumber");
CREATE INDEX IF NOT EXISTS "itinerary_days_itineraryId_idx" ON "itinerary_days"("itineraryId");

-- Create day_activities table
CREATE TABLE IF NOT EXISTS "day_activities" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "timing" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "day_activities_dayId_idx" ON "day_activities"("dayId");

-- Add foreign keys
ALTER TABLE "itineraries_new" ADD CONSTRAINT "itineraries_new_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries_new"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "day_activities" ADD CONSTRAINT "day_activities_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "itinerary_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
