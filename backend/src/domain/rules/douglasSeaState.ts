import { classifyByUpperBounds } from "./scaleLookup";

/**
 * WMO sea-state code (the Douglas sea scale): state 0 (calm/glassy) to state 9 (phenomenal).
 * Upper bound of each state's significant wave-height range, in metres.
 * Source: WMO sea-state code 3700, as commonly tabulated (e.g. UK Met Office).
 */
const DOUGLAS_UPPER_BOUNDS_M = [0, 0.1, 0.5, 1.25, 2.5, 4, 6, 9, 14];

export function waveHeightToDouglasSeaState(waveHeightM: number): number {
  return classifyByUpperBounds(waveHeightM, DOUGLAS_UPPER_BOUNDS_M, "waveHeightM");
}
