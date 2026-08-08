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

/** Capped below "violent storm"/"hurricane": those Beaufort forces are hurricane-grade winds this
 * app will never see in a Black Sea hourly forecast, and by force 6 conditions are already red —
 * finer top-end labels wouldn't add anything a reader could act on. */
export type WindSpeedReadable = "calm" | "light air" | "light breeze" | "gentle breeze" | "moderate breeze" | "fresh breeze" | "strong breeze" | "near gale" | "gale" | "strong gale" | "storm";

/** Readable wind description per Beaufort force (0-12), in ascending order. */
const WIND_SPEED_READABLE_BY_BEAUFORT_FORCE: WindSpeedReadable[] = [
  "calm",
  "light air",
  "light breeze",
  "gentle breeze",
  "moderate breeze",
  "fresh breeze",
  "strong breeze",
  "near gale",
  "gale",
  "strong gale",
  "storm", // forces 10-12: violent storm/hurricane collapse into this ceiling label
  "storm",
  "storm",
];

export function beaufortForceToReadable(beaufortForce: number): WindSpeedReadable {
  return WIND_SPEED_READABLE_BY_BEAUFORT_FORCE[beaufortForce];
}
