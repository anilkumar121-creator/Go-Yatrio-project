-- Phase 14: Media Library (Schema Foundation — Non-destructive)
-- Extends the existing media table. Does NOT drop or recreate it.

-- 1. Create new enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaStatus') THEN
    CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaModule') THEN
    CREATE TYPE "MediaModule" AS ENUM ('DESTINATION', 'PACKAGE', 'HOTEL', 'CAB', 'BLOG', 'HOMEPAGE');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaLinkRole') THEN
    CREATE TYPE "MediaLinkRole" AS ENUM ('FEATURED', 'GALLERY', 'VIDEO', 'DOCUMENT');
  END IF;
END $$;

-- 2. Extend media table with non-destructive columns
ALTER TABLE "media"
  ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
  ADD COLUMN IF NOT EXISTS "folder" TEXT,
  ADD COLUMN IF NOT EXISTS "fileName" TEXT,
  ADD COLUMN IF NOT EXISTS "size" BIGINT,
  ADD COLUMN IF NOT EXISTS "durationSeconds" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "caption" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "MediaStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "usageCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 3. Backfill defaults for existing rows
UPDATE "media" SET "status" = 'ACTIVE' WHERE "status" IS NULL;
UPDATE "media" SET "usageCount" = 0 WHERE "usageCount" IS NULL;
UPDATE "media" SET "tags" = ARRAY[]::TEXT[] WHERE "tags" IS NULL;

-- 4. Create media_links junction table
CREATE TABLE IF NOT EXISTS "media_links" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "module" "MediaModule" NOT NULL,
    "moduleId" TEXT NOT NULL,
    "role" "MediaLinkRole" NOT NULL DEFAULT 'GALLERY',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_links_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "media_links_mediaId_module_moduleId_role_key" ON "media_links"("mediaId", "module", "moduleId", "role");
CREATE INDEX IF NOT EXISTS "media_links_module_moduleId_idx" ON "media_links"("module", "moduleId");
CREATE INDEX IF NOT EXISTS "media_links_mediaId_idx" ON "media_links"("mediaId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_links_mediaId_fkey') THEN
    ALTER TABLE "media_links" ADD CONSTRAINT "media_links_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 5. Additional indexes on media
CREATE INDEX IF NOT EXISTS "media_resourceType_status_idx" ON "media"("resourceType", "status");
CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media"("folder");
CREATE INDEX IF NOT EXISTS "media_createdBy_idx" ON "media"("createdBy");
