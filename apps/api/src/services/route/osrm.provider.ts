import { AppError } from "../../utils/app-error.js";
import {
  RouteCalculationResult,
  RouteCoordinates,
  RouteProvider,
} from "./route.provider.interface.js";

export class OSRMProvider implements RouteProvider {
  async calculateRoute(waypoints: RouteCoordinates[]): Promise<RouteCalculationResult> {
    if (waypoints.length < 2) {
      throw new AppError("At least an origin and destination are required.", 400);
    }

    const baseUrl = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
    const timeoutMs = Number(process.env.OSRM_TIMEOUT_MS) || 8000;

    // OSRM requires coordinates as longitude,latitude
    const coordinatesString = waypoints.map((wp) => `${wp.longitude},${wp.latitude}`).join(";");

    // Use the route service with driving profile
    const url = new URL(`${baseUrl}/route/v1/driving/${coordinatesString}`);
    url.searchParams.set("overview", "false"); // Set to full/simplified if geometry is needed

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response;
      try {
        response = await fetch(url.toString(), {
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new AppError("Failed to calculate route from the routing provider.", 502);
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new AppError("No valid route could be found for the given coordinates.", 400);
      }

      const route = data.routes[0];
      const distanceMeters = route.distance;
      const durationSeconds = route.duration;

      if (typeof distanceMeters !== "number" || typeof durationSeconds !== "number") {
        throw new AppError("Invalid route calculation response.", 502);
      }

      const distanceKm = distanceMeters / 1000;

      if (distanceKm <= 0) {
        throw new AppError("Calculated route distance cannot be zero.", 400);
      }

      return {
        distanceKm,
        durationSeconds,
        provider: "osrm-public",
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("Routing request timed out. Please try again.", 504);
      }
      console.error("OSRMProvider error:", error);
      throw new AppError("An unexpected error occurred while calculating the route.", 500);
    }
  }
}
