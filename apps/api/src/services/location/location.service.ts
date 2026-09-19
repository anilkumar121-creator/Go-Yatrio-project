import { AppError } from "../../utils/app-error.js";

export type LocationResult = {
  displayName: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

// Basic in-memory cache to prevent hammering Nominatim for identical requests
const cache = new Map<string, { result: LocationResult[]; expiresAt: number }>();

let lastNominatimRequestTime = 0;
let nominatimQueue: Promise<void> = Promise.resolve();

async function enforceNominatimRateLimit(): Promise<void> {
  // Chain promises to prevent concurrent requests and enforce 1s delay
  nominatimQueue = nominatimQueue.then(async () => {
    const now = Date.now();
    const timeSinceLast = now - lastNominatimRequestTime;
    const waitTime = Math.max(0, 1000 - timeSinceLast);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    lastNominatimRequestTime = Date.now();
  });
  await nominatimQueue;
}

export class LocationService {
  /**
   * Geocodes a search query using Nominatim (OpenStreetMap).
   * Caches results in memory for a short duration.
   */
  async search(query: string): Promise<LocationResult[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const cacheKey = trimmedQuery.toLowerCase();
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return cached.result;
    }

    const baseUrl = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
    const userAgent = process.env.NOMINATIM_USER_AGENT || "GoYatrio/1.0 (+http://localhost)";
    const timeoutMs = Number(process.env.NOMINATIM_TIMEOUT_MS) || 5000;
    const ttlSeconds = Number(process.env.NOMINATIM_CACHE_TTL_SECONDS) || 3600;

    const url = new URL(`${baseUrl}/search`);
    url.searchParams.set("q", trimmedQuery);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");

    try {
      await enforceNominatimRateLimit();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: {
            "User-Agent": userAgent,
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new AppError("Failed to connect to location provider.", 502);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new AppError("Invalid response from location provider.", 502);
      }

      const results: LocationResult[] = [];
      for (const item of data) {
        if (!item || typeof item.display_name !== "string") continue;
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (isNaN(lat) || isNaN(lon)) continue;
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

        results.push({
          displayName: item.display_name,
          latitude: lat,
          longitude: lon,
          placeId: item.place_id ? String(item.place_id) : null,
          city: item.address?.city || item.address?.town || item.address?.village || null,
          state: item.address?.state || null,
          country: item.address?.country || null,
        });
      }

      // Cache the successful result, bound cache size to prevent memory leak
      if (cache.size > 1000) {
        // Evict oldest roughly (first item in Map)
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      cache.set(cacheKey, { result: results, expiresAt: now + ttlSeconds * 1000 });

      return results;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("Location search timed out. Please try again.", 504);
      }
      console.error("LocationService error:", error);
      throw new AppError("An unexpected error occurred while searching for the location.", 500);
    }
  }
}

export const locationService = new LocationService();
