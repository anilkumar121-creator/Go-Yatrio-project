import { OSRMProvider } from "./osrm.provider.js";
import {
  RouteCalculationResult,
  RouteCoordinates,
  RouteProvider,
} from "./route.provider.interface.js";

export class RouteService {
  private provider: RouteProvider;

  constructor(provider?: RouteProvider) {
    // Default to OSRM provider if none is specified
    this.provider = provider || new OSRMProvider();
  }

  /**
   * Calculates a driving route connecting the given waypoints in order.
   * Minimally requires 2 waypoints (origin and destination).
   */
  async calculateRoute(waypoints: RouteCoordinates[]): Promise<RouteCalculationResult> {
    return this.provider.calculateRoute(waypoints);
  }
}

export const routeService = new RouteService();
