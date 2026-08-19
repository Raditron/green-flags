// RN port of frontend/src/shared/data/utils/geo.ts, verbatim — the Haversine distance formula is
// pure arithmetic with no RN/DOM dependency, so nothing about the port changes it. See ADR 0005.
export interface Coordinates {
  lat: number;
  long: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Straight-line (great-circle) distance between two points in kilometers, via the Haversine
 * formula. Used both to find a visitor's nearest beach (for Detected Area, see CONTEXT.md) and to
 * show each beach's distance from the visitor — see ADR 0005 for why this stays client-side.
 */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLong = toRadians(b.long - a.long);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLong / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

/** "3.2 km away" under 10 km (close enough that the extra precision is useful), "42 km away" beyond it. */
export function formatDistanceKm(distance: number): string {
  const rounded = distance < 10 ? Math.round(distance * 10) / 10 : Math.round(distance);
  return `${rounded} km away`;
}
