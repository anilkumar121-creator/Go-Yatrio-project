-- AlterTable
ALTER TABLE "cities" ADD COLUMN "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[];
