-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "serviceRadiusKm" DECIMAL(10,2);
