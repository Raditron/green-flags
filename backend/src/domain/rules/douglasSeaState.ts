import { classifyByUpperBounds } from "./scaleLookup";

/**
 * WMO sea-state code (the Douglas sea scale): state 0 (calm/glassy) to state 9 (phenomenal).
 * Upper bound of each state's significant wave-height range, in metres.
 * Source: WMO sea-state code 3700, as commonly tabulated (e.g. UK Met Office).
 */
export const DOUGLAS_UPPER_BOUNDS_M = [0, 0.1, 0.5, 1.25, 2.5, 4, 6, 9, 14];

export function waveHeightToDouglasSeaState(waveHeightM: number): number {
  return classifyByUpperBounds(waveHeightM, DOUGLAS_UPPER_BOUNDS_M, "waveHeightM");
}

/** Capped below "very high"/"phenomenal": those Douglas states (9m+ seas) are open-ocean
 * classifications the Black Sea's worst storms don't reach, and by state 5 conditions are
 * already red — finer top-end labels wouldn't add anything a reader could act on. */
export type SeaStateReadable = "calm" | "rippled" | "smooth" | "slight" | "moderate" | "rough" | "very rough" | "high";

/** Readable sea-state description per Douglas sea state (0-9), in ascending order. */
const SEA_STATE_READABLE_BY_DOUGLAS_STATE: SeaStateReadable[] = [
  "calm",
  "rippled",
  "smooth",
  "slight",
  "moderate",
  "rough",
  "very rough",
  "high", // states 7-9: very high/phenomenal collapse into this ceiling label
  "high",
  "high",
];

export function douglasSeaStateToReadable(douglasSeaState: number): SeaStateReadable {
  return SEA_STATE_READABLE_BY_DOUGLAS_STATE[douglasSeaState];
}
