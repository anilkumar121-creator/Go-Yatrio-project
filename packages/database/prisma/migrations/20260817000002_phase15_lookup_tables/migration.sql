-- Phase 15: Lookup Tables / Admin Configuration (Non-destructive)
-- Creates lookup_groups and lookup_items tables. No existing tables are altered or dropped.

CREATE TABLE IF NOT EXISTS "lookup_groups" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lookup_groups_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "lookup_groups_key_key" ON "lookup_groups"("key");

CREATE TABLE IF NOT EXISTS "lookup_items" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lookup_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "lookup_items_groupId_value_key" ON "lookup_items"("groupId", "value");
CREATE INDEX IF NOT EXISTS "lookup_items_groupId_isActive_idx" ON "lookup_items"("groupId", "isActive");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lookup_items_groupId_fkey') THEN
    ALTER TABLE "lookup_items" ADD CONSTRAINT "lookup_items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "lookup_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
