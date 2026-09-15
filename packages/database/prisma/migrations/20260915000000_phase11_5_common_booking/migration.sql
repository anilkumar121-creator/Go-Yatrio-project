-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CAB', 'HOTEL', 'PACKAGE', 'FLIGHT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_bookingId_fkey";

-- DropIndex
DROP INDEX "payments_bookingId_key";

-- AlterTable
ALTER TABLE "cab_bookings" ADD COLUMN     "bookingId" TEXT;

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "userId" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "advanceAmount" DECIMAL(12,2) NOT NULL,
    "remainingAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingReference_key" ON "bookings"("bookingReference");

-- CreateIndex
CREATE UNIQUE INDEX "cab_bookings_bookingId_key" ON "cab_bookings"("bookingId");

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");

-- -----------------------------------------------------------------------------
-- SAFE DATA BACKFILL (PHASE 11.5)
-- -----------------------------------------------------------------------------
-- 1. Create a parent Booking for each existing CabBooking using the same ID.
INSERT INTO "bookings" (
    "id", "bookingReference", "userId", "serviceType", "status",
    "totalAmount", "advanceAmount", "remainingAmount", "currency",
    "customerName", "customerEmail", "customerPhone", "createdAt", "updatedAt"
)
SELECT
    "id", "bookingReference", "userId", 'CAB',
    CASE
         WHEN "status" = 'PENDING' THEN 'PENDING_PAYMENT'::"BookingStatus"
         WHEN "status" = 'CONFIRMED' THEN 'CONFIRMED'::"BookingStatus"
         WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"BookingStatus"
         WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"BookingStatus"
         ELSE 'PENDING_PAYMENT'::"BookingStatus"
    END,
    "calculatedFare", "advanceAmount", "remainingAmount", 'INR',
    "customerName", "customerEmail", "customerPhone", "createdAt", "updatedAt"
FROM "cab_bookings";

-- 2. Link the CabBooking back to its new parent Booking.
UPDATE "cab_bookings" SET "bookingId" = "id";

-- 3. (Implicit) Payments already have bookingId = cab_bookings.id, which now perfectly equals bookings.id.

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cab_bookings" ADD CONSTRAINT "cab_bookings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
