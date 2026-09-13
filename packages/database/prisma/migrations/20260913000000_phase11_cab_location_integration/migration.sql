-- AlterTable
ALTER TABLE "cab_bookings" ADD COLUMN     "dropCityId" TEXT,
ADD COLUMN     "pickupCityId" TEXT;

-- AlterTable
ALTER TABLE "itineraries" ADD COLUMN     "cityId" TEXT;

-- AlterTable
ALTER TABLE "route_pricings" ADD COLUMN     "destinationCityId" TEXT,
ADD COLUMN     "originCityId" TEXT,
ADD COLUMN     "tripTypeId" TEXT;

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_service_locations" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vehicle_service_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "states_code_key" ON "states"("code");

-- CreateIndex
CREATE INDEX "cities_stateId_idx" ON "cities"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "cities_stateId_name_key" ON "cities"("stateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_service_locations_vehicleId_cityId_key" ON "vehicle_service_locations"("vehicleId", "cityId");

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cab_bookings" ADD CONSTRAINT "cab_bookings_pickupCityId_fkey" FOREIGN KEY ("pickupCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cab_bookings" ADD CONSTRAINT "cab_bookings_dropCityId_fkey" FOREIGN KEY ("dropCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_pricings" ADD CONSTRAINT "route_pricings_tripTypeId_fkey" FOREIGN KEY ("tripTypeId") REFERENCES "lookup_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_pricings" ADD CONSTRAINT "route_pricings_originCityId_fkey" FOREIGN KEY ("originCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_pricings" ADD CONSTRAINT "route_pricings_destinationCityId_fkey" FOREIGN KEY ("destinationCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_service_locations" ADD CONSTRAINT "vehicle_service_locations_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_service_locations" ADD CONSTRAINT "vehicle_service_locations_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
