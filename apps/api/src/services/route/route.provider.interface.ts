export type RouteCoordinates = {
  latitude: number;
  longitude: number;
};

export type RouteCalculationResult = {
  distanceKm: number;
  durationSeconds: number;
  provider: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry?: any;
};

export interface RouteProvider {
  /**
   * Calculates a driving route connecting the given waypoints in order.
   * Minimally requires 2 waypoints (origin and destination).
   */
  calculateRoute(waypoints: RouteCoordinates[]): Promise<RouteCalculationResult>;
}
