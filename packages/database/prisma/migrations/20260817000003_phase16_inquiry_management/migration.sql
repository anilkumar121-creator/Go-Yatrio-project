-- Phase 16: Inquiry & Lead Management System
-- Creates inquiry-related tables. No existing tables are altered or dropped.

-- Enums
CREATE TYPE "InquiryStatusNew" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'CLOSED');
CREATE TYPE "InquiryPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "InquirySource" AS ENUM ('WEBSITE', 'PACKAGE_PAGE', 'HOTEL_PAGE', 'CAB_PAGE', 'CONTACT_FORM', 'BLOG_PAGE', 'WHATSAPP', 'PHONE', 'EMAIL', 'MANUAL');
CREATE TYPE "InquiryType" AS ENUM ('TOUR_PACKAGE', 'HOTEL', 'CAB', 'GENERAL', 'CUSTOM_TOUR');

-- Inquiry table
CREATE TABLE IF NOT EXISTS "inquiries" (
    "id" TEXT NOT NULL,
    "inquiryNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "country" TEXT,
    "city" TEXT,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "travelDate" TIMESTAMP(3),
    "budget" DECIMAL(12, 2),
    "message" TEXT,
    "source" "InquirySource" NOT NULL DEFAULT 'WEBSITE',
    "type" "InquiryType" NOT NULL DEFAULT 'GENERAL',
    "status" "InquiryStatusNew" NOT NULL DEFAULT 'NEW',
    "priority" "InquiryPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "packageId" TEXT,
    "hotelId" TEXT,
    "cabId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "inquiries_inquiryNumber_key" ON "inquiries"("inquiryNumber");
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries"("status");
CREATE INDEX IF NOT EXISTS "inquiries_priority_idx" ON "inquiries"("priority");
CREATE INDEX IF NOT EXISTS "inquiries_source_idx" ON "inquiries"("source");
CREATE INDEX IF NOT EXISTS "inquiries_type_idx" ON "inquiries"("type");
CREATE INDEX IF NOT EXISTS "inquiries_assignedTo_idx" ON "inquiries"("assignedTo");
CREATE INDEX IF NOT EXISTS "inquiries_packageId_idx" ON "inquiries"("packageId");
CREATE INDEX IF NOT EXISTS "inquiries_hotelId_idx" ON "inquiries"("hotelId");
CREATE INDEX IF NOT EXISTS "inquiries_cabId_idx" ON "inquiries"("cabId");
CREATE INDEX IF NOT EXISTS "inquiries_createdAt_idx" ON "inquiries"("createdAt");

-- InquiryNote table
CREATE TABLE IF NOT EXISTS "inquiry_notes" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiry_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inquiry_notes_inquiryId_idx" ON "inquiry_notes"("inquiryId");

-- InquiryActivity table
CREATE TABLE IF NOT EXISTS "inquiry_activities" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiry_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inquiry_activities_inquiryId_idx" ON "inquiry_activities"("inquiryId");
CREATE INDEX IF NOT EXISTS "inquiry_activities_createdAt_idx" ON "inquiry_activities"("createdAt");

-- InquiryAssignment table
CREATE TABLE IF NOT EXISTS "inquiry_assignments" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiry_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inquiry_assignments_inquiryId_idx" ON "inquiry_assignments"("inquiryId");
CREATE INDEX IF NOT EXISTS "inquiry_assignments_assignedTo_idx" ON "inquiry_assignments"("assignedTo");

-- Foreign Keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiry_notes_inquiryId_fkey') THEN
    ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiry_activities_inquiryId_fkey') THEN
    ALTER TABLE "inquiry_activities" ADD CONSTRAINT "inquiry_activities_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiry_assignments_inquiryId_fkey') THEN
    ALTER TABLE "inquiry_assignments" ADD CONSTRAINT "inquiry_assignments_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;