-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestAccessToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_guestAccessToken_key" ON "bookings"("guestAccessToken");
