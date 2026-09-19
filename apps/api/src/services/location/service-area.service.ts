import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export type ServiceAreaResult = {
  cityId: string;
  cityName: string;
  state: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  serviceRadiusKm: number;
  available: boolean;
};

export class ServiceAreaService {
  /**
   * Calculates the great-circle distance between two points on the Earth's surface
   * using the Haversine formula.
   */
  private haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Finds the nearest active GoYatrio service city.
   * Checks if the searched location falls within the configured service radius.
   */
  async getNearestServiceArea(lat: number, lng: number): Promise<ServiceAreaResult> {
    // Note: Temporary fallback until PostGIS is enabled.
    // In the future, this should be a spatial query like:
    // SELECT *, ST_DistanceSphere(geom, ST_MakePoint(lng, lat)) as dist FROM cities WHERE isActive = true AND serviceRadiusKm IS NOT NULL ORDER BY dist ASC;
    const activeCities = await prisma.city.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
        serviceRadiusKm: { not: null },
      },
      include: { state: true },
    });

    if (activeCities.length === 0) {
      throw new AppError("Service areas are not currently configured.", 500);
    }

    let nearestCity = null;
    let minDistance = Infinity;

    let nearestAvailableCity = null;
    let minAvailableDistance = Infinity;

    for (const city of activeCities) {
      if (city.latitude === null || city.longitude === null || city.serviceRadiusKm === null) {
        continue;
      }

      const distance = this.haversineDistanceKm(
        lat,
        lng,
        city.latitude.toNumber(),
        city.longitude.toNumber(),
      );

      // Track absolute nearest configured city (even if unavailable)
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }

      // Track nearest available city
      const radius = city.serviceRadiusKm.toNumber();
      if (distance <= radius) {
        if (distance < minAvailableDistance) {
          minAvailableDistance = distance;
          nearestAvailableCity = city;
        }
      }
    }

    if (!nearestCity) {
      throw new AppError("Unable to determine nearest service area.", 500);
    }

    // If there is an available city, return it
    if (nearestAvailableCity) {
      return {
        cityId: nearestAvailableCity.id,
        cityName: nearestAvailableCity.name,
        state: nearestAvailableCity.state.name,
        latitude: nearestAvailableCity.latitude!.toNumber(),
        longitude: nearestAvailableCity.longitude!.toNumber(),
        distanceKm: minAvailableDistance,
        serviceRadiusKm: nearestAvailableCity.serviceRadiusKm!.toNumber(),
        available: true,
      };
    }

    // Otherwise, return the nearest city with available = false
    return {
      cityId: nearestCity.id,
      cityName: nearestCity.name,
      state: nearestCity.state.name,
      latitude: nearestCity.latitude!.toNumber(),
      longitude: nearestCity.longitude!.toNumber(),
      distanceKm: minDistance,
      serviceRadiusKm: nearestCity.serviceRadiusKm!.toNumber(),
      available: false,
    };
  }
}

export const serviceAreaService = new ServiceAreaService();
