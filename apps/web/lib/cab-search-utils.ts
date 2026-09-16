// apps/web/lib/cab-search-utils.ts

export type Stop = {
  location: string;
  cityId?: string;
};

export function encodeStops(stops: Stop[]): string {
  if (!stops || stops.length === 0) return "";
  try {
    return encodeURIComponent(JSON.stringify(stops));
  } catch (error) {
    console.error("Failed to encode stops", error);
    return "";
  }
}

export function decodeStops(encoded: string | null | undefined): Stop[] {
  if (!encoded) return [];
  try {
    const decoded = decodeURIComponent(encoded);
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) {
      return parsed.filter((s) => s && typeof s === "object" && typeof s.location === "string");
    }
    return [];
  } catch (error) {
    console.error("Failed to decode stops", error);
    return [];
  }
}
