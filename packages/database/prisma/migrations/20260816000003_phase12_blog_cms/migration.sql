-- Phase 12: Blog CMS (Safe, Non-destructive)
-- Extends the existing blogs table. Does NOT drop or recreate it.

-- 1. Create new enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BlogStatus') THEN
    CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BlogContentFormat') THEN
    CREATE TYPE "BlogContentFormat" AS ENUM ('PLAIN_TEXT', 'MARKDOWN', 'HTML', 'JSON_BLOCKS');
  END IF;
END $$;

-- 2. Extend blogs table with non-destructive columns
ALTER TABLE "blogs"
  ADD COLUMN IF NOT EXISTS "contentFormat" "BlogContentFormat" NOT NULL DEFAULT 'JSON_BLOCKS',
  ADD COLUMN IF NOT EXISTS "contentBlocks" JSONB,
  ADD COLUMN IF NOT EXISTS "faq" JSONB,
  ADD COLUMN IF NOT EXISTS "featuredImagePublicId" TEXT,
  ADD COLUMN IF NOT EXISTS "galleryImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "authorId" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "readingTimeMinutes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "ogImage" TEXT;

-- 3. Backfill status from legacy isPublished flag (preserves existing data)
UPDATE "blogs" SET "status" = 'PUBLISHED' WHERE "isPublished" = true AND "status" = 'DRAFT';

-- 4. Author model + backfill from legacy author text
CREATE TABLE IF NOT EXISTS "blog_authors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "role" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_authors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "blog_authors_name_key" ON "blog_authors"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_authors_slug_key" ON "blog_authors"("slug");

-- Backfill authors for existing blogs (author column still exists; not dropped)
INSERT INTO "blog_authors" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT DISTINCT ON (LOWER(BTRIM("author")))
  'author_' || md5(LOWER(BTRIM("author"))),
  BTRIM("author"),
  LOWER(REPLACE(BTRIM("author"), ' ', '-')),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "blogs"
WHERE "author" IS NOT NULL AND BTRIM("author") <> ''
ON CONFLICT ("name") DO NOTHING;

UPDATE "blogs" b
SET "authorId" = a."id"
FROM "blog_authors" a
WHERE a."name" = BTRIM(b."author") AND b."authorId" IS NULL;

-- 5. Create blog_categories and blog_tags
CREATE TABLE IF NOT EXISTS "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_name_key" ON "blog_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_key" ON "blog_categories"("slug");

CREATE TABLE IF NOT EXISTS "blog_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_name_key" ON "blog_tags"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_slug_key" ON "blog_tags"("slug");

-- 6. Author FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blogs_authorId_fkey') THEN
    ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "blog_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 7. Implicit many-to-many: Blog <-> Destination
CREATE TABLE IF NOT EXISTS "_BlogToDestination" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "_BlogToDestination_AB_unique" ON "_BlogToDestination"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogToDestination_B_index" ON "_BlogToDestination"("B");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToDestination_A_fkey') THEN
    ALTER TABLE "_BlogToDestination" ADD CONSTRAINT "_BlogToDestination_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToDestination_B_fkey') THEN
    ALTER TABLE "_BlogToDestination" ADD CONSTRAINT "_BlogToDestination_B_fkey" FOREIGN KEY ("B") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 8. Implicit many-to-many: Blog <-> TourPackage
CREATE TABLE IF NOT EXISTS "_BlogToTourPackage" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "_BlogToTourPackage_AB_unique" ON "_BlogToTourPackage"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogToTourPackage_B_index" ON "_BlogToTourPackage"("B");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToTourPackage_A_fkey') THEN
    ALTER TABLE "_BlogToTourPackage" ADD CONSTRAINT "_BlogToTourPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToTourPackage_B_fkey') THEN
    ALTER TABLE "_BlogToTourPackage" ADD CONSTRAINT "_BlogToTourPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 9. Implicit many-to-many: Blog <-> BlogCategory
CREATE TABLE IF NOT EXISTS "_BlogToBlogCategory" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "_BlogToBlogCategory_AB_unique" ON "_BlogToBlogCategory"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogToBlogCategory_B_index" ON "_BlogToBlogCategory"("B");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToBlogCategory_A_fkey') THEN
    ALTER TABLE "_BlogToBlogCategory" ADD CONSTRAINT "_BlogToBlogCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToBlogCategory_B_fkey') THEN
    ALTER TABLE "_BlogToBlogCategory" ADD CONSTRAINT "_BlogToBlogCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "blog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 10. Implicit many-to-many: Blog <-> BlogTag
CREATE TABLE IF NOT EXISTS "_BlogToBlogTag" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "_BlogToBlogTag_AB_unique" ON "_BlogToBlogTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_BlogToBlogTag_B_index" ON "_BlogToBlogTag"("B");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToBlogTag_A_fkey') THEN
    ALTER TABLE "_BlogToBlogTag" ADD CONSTRAINT "_BlogToBlogTag_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BlogToBlogTag_B_fkey') THEN
    ALTER TABLE "_BlogToBlogTag" ADD CONSTRAINT "_BlogToBlogTag_B_fkey" FOREIGN KEY ("B") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 11. Additional indexes on blogs
CREATE INDEX IF NOT EXISTS "blogs_status_featured_publishedAt_idx" ON "blogs"("status", "featured", "publishedAt");
CREATE INDEX IF NOT EXISTS "blogs_authorId_idx" ON "blogs"("authorId");
