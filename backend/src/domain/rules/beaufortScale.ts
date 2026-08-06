import { classifyByUpperBounds } from "./scaleLookup";

/**
 * WMO Beaufort wind-force scale: force 0 (calm) to force 12 (hurricane).
 * Upper bound of each force's wind-speed range, in m/s (10 m sustained wind).
 * Source: WMO Beaufort scale, as commonly tabulated (e.g. UK Met Office / NOAA).
 */
export const BEAUFORT_UPPER_BOUNDS_MPS = [0.2, 1.5, 3.3, 5.4, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6];

export function windSpeedToBeaufortForce(windSpeedMps: number): number {
  return classifyByUpperBounds(windSpeedMps, BEAUFORT_UPPER_BOUNDS_MPS, "windSpeedMps");
}
