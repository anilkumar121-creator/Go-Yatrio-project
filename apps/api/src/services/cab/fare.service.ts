import { Prisma } from "@prisma/client";
import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { locationService } from "../location/location.service.js";
import { serviceAreaService } from "../location/service-area.service.js";
import { OSRMProvider } from "../route/osrm.provider.js";
import { RouteCoordinates } from "../route/route.provider.interface.js";

export interface FareCalculateParams {
  origin: string;
  destination: string;
  originCityId?: string;
  destinationCityId?: string;
  categoryId: string;
  tripTypeId: string;
  vehicleId: string;
  stops?: { location: string; cityId?: string }[];
  passengers?: number;
}

export interface FareCalculationResult {
  fare: number;
  distanceKm: number;
  appliedRoutePricingId: string | null;
  pricingMethod: "ROUTE_PRICING" | "DISTANCE_FALLBACK";
  pricingProvider: string;
  durationSeconds?: number;
  vehicleId: string;
}

export class FareService {
  private osrmProvider: OSRMProvider;

  constructor() {
    this.osrmProvider = new OSRMProvider();
  }

  async calculateFare(params: FareCalculateParams): Promise<FareCalculationResult> {
    const {
      origin,
      destination,
      originCityId,
      destinationCityId,
      categoryId,
      tripTypeId,
      vehicleId,
      stops,
    } = params;

    // 1. Identify the target vehicle to get base/extra pricing.
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId, isActive: true },
    });
    if (!vehicle) throw new AppError("Target vehicle not found or inactive.", 400);

    // 2. Try exact RoutePricing match
    const whereClause: Prisma.RoutePricingWhereInput = {
      categoryId: vehicle.categoryId || categoryId,
      tripTypeId,
      isActive: true,
    };

    if (originCityId && destinationCityId) {
      whereClause.originCityId = originCityId;
      whereClause.destinationCityId = destinationCityId;
    } else {
      whereClause.origin = { equals: origin, mode: "insensitive" };
      whereClause.destination = { equals: destination, mode: "insensitive" };
    }

    const exactRoute = await prisma.routePricing.findFirst({
      where: whereClause,
    });

    if (exactRoute) {
      return {
        fare: Number(exactRoute.basePrice),
        distanceKm: Number(exactRoute.distanceKm),
        appliedRoutePricingId: exactRoute.id,
        pricingMethod: "ROUTE_PRICING",
        pricingProvider: "GoYatrio RoutePricing",
        vehicleId: vehicle.id,
      };
    }

    // 3. Distance Fallback (OSRM + Nominatim)
    // Geocode origin
    const originResults = await locationService.search(origin);
    if (!originResults.length) {
      throw new AppError(`Could not find coordinates for origin: ${origin}`, 400);
    }
    const originCoords: RouteCoordinates = {
      latitude: originResults[0].latitude,
      longitude: originResults[0].longitude,
    };

    // Geocode destination
    const destResults = await locationService.search(destination);
    if (!destResults.length) {
      throw new AppError(`Could not find coordinates for destination: ${destination}`, 400);
    }
    const destCoords: RouteCoordinates = {
      latitude: destResults[0].latitude,
      longitude: destResults[0].longitude,
    };

    // Validate origin Service Area
    const serviceArea = await serviceAreaService.getNearestServiceArea(
      originCoords.latitude,
      originCoords.longitude,
    );
    if (!serviceArea.available) {
      throw new AppError("Not available in this city.", 400);
    }

    // Geocode stops if any
    const waypoints: RouteCoordinates[] = [originCoords];
    if (stops && stops.length > 0) {
      for (const stop of stops) {
        if (!stop.location) continue;
        const stopResults = await locationService.search(stop.location);
        if (stopResults.length > 0) {
          waypoints.push({
            latitude: stopResults[0].latitude,
            longitude: stopResults[0].longitude,
          });
        } else {
          throw new AppError(`Could not find coordinates for stop: ${stop.location}`, 400);
        }
      }
    }
    waypoints.push(destCoords);

    // Calculate Route
    const routeData = await this.osrmProvider.calculateRoute(waypoints);
    const distanceKm = routeData.distanceKm;

    // Compute authoritative fare using Decimal to avoid JS float precision issues
    const baseFareDecimal = new Prisma.Decimal(vehicle.baseFare);
    const distanceDecimal = new Prisma.Decimal(distanceKm.toString());
    const extraKmChargeDecimal = new Prisma.Decimal(vehicle.extraKmCharge);

    const extraFareDecimal = distanceDecimal.mul(extraKmChargeDecimal);
    const totalFareDecimal = baseFareDecimal.add(extraFareDecimal);

    return {
      fare: totalFareDecimal.toDecimalPlaces(2).toNumber(),
      distanceKm: Number(distanceKm.toFixed(2)),
      appliedRoutePricingId: null,
      pricingMethod: "DISTANCE_FALLBACK",
      pricingProvider: routeData.provider || "osrm-public",
      durationSeconds: routeData.durationSeconds,
      vehicleId: vehicle.id,
    };
  }
}

export const fareService = new FareService();
