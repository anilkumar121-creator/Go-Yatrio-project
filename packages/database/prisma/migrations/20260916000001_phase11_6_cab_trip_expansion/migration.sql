-- AlterEnum
ALTER TYPE "CabTripType" ADD VALUE 'MULTI_WAY';

-- AlterTable
ALTER TABLE "cab_bookings" ADD COLUMN "returnDate" TIMESTAMP(3),
ADD COLUMN "returnTime" TEXT,
ADD COLUMN "stops" JSONB;
