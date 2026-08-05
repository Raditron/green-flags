import { windSpeedToBeaufortForce } from "./beaufortScale";
import { waveHeightToDouglasSeaState } from "./douglasSeaState";

export type FlagColor = "green" | "yellow" | "red";
export type RipCurrentRisk = "low" | "moderate" | "high";

export interface HourlyConditions {
  windSpeedMps: number;
  /** Meteorological convention: compass bearing the wind is blowing FROM. */
  windDirectionDeg: number;
  waveHeightM: number;
  wavePeriodS: number;
  /** Optional swell height on top of the wind-wave height, in metres. */
  swellHeightM?: number;
  /** Compass bearing the wind blows FROM when blowing straight onshore at this beach. */
  onshoreWindDirectionDeg: number;
  stormWarningActive: boolean;
}

export interface FlagAssessment {
  flagColor: FlagColor;
  ripCurrentRisk: RipCurrentRisk;
}

/** Beaufort force at/above which conditions are red, regardless of sea state. */
const RED_BEAUFORT_FORCE = 6;
/** Douglas sea state at/above which conditions are red, regardless of wind. */
const RED_DOUGLAS_SEA_STATE = 5;
/** Beaufort force at/above which conditions are at least yellow. */
const YELLOW_BEAUFORT_FORCE = 4;
/** Douglas sea state at/above which conditions are at least yellow. */
const YELLOW_DOUGLAS_SEA_STATE = 3;

function deriveFlagColor(beaufortForce: number, douglasSeaState: number, stormWarningActive: boolean): FlagColor {
  if (stormWarningActive || beaufortForce >= RED_BEAUFORT_FORCE || douglasSeaState >= RED_DOUGLAS_SEA_STATE) {
    return "red";
  }
  if (beaufortForce >= YELLOW_BEAUFORT_FORCE || douglasSeaState >= YELLOW_DOUGLAS_SEA_STATE) {
    return "yellow";
  }
  return "green";
}

/** Component of the wind blowing straight onshore, in m/s; negative (offshore) values are clamped to 0. */
function computeOnshoreWindComponentMps(conditions: HourlyConditions): number {
  const angleDeg = conditions.windDirectionDeg - conditions.onshoreWindDirectionDeg;
  const component = conditions.windSpeedMps * Math.cos((angleDeg * Math.PI) / 180);
  return Math.max(component, 0);
}

/**
 * No rip-current forecast exists for the Black Sea (see project research), so risk is derived
 * in-house from the same factors NOAA's own beach-forecast tool uses operationally: wave height,
 * wave period, and the onshore wind component. Each factor scores 0 (below its moderate
 * threshold), 1 (moderate), or 2 (at/above its high threshold); the scores are summed.
 */
function deriveRipCurrentRisk(waveHeightM: number, wavePeriodS: number, onshoreWindComponentMps: number): RipCurrentRisk {
  const scoreFactor = (value: number, moderateThreshold: number, highThreshold: number): number => {
    if (value >= highThreshold) return 2;
    if (value >= moderateThreshold) return 1;
    return 0;
  };

  const score =
    scoreFactor(waveHeightM, 0.5, 1.0) + scoreFactor(wavePeriodS, 6, 8) + scoreFactor(onshoreWindComponentMps, 3, 8);

  if (score >= 4) return "high";
  if (score >= 2) return "moderate";
  return "low";
}

export function evaluateHourlyFlag(conditions: HourlyConditions): FlagAssessment {
  const effectiveWaveHeightM = Math.max(conditions.waveHeightM, conditions.swellHeightM ?? 0);

  const beaufortForce = windSpeedToBeaufortForce(conditions.windSpeedMps);
  const douglasSeaState = waveHeightToDouglasSeaState(effectiveWaveHeightM);
  const onshoreWindComponentMps = computeOnshoreWindComponentMps(conditions);

  return {
    flagColor: deriveFlagColor(beaufortForce, douglasSeaState, conditions.stormWarningActive),
    ripCurrentRisk: deriveRipCurrentRisk(conditions.waveHeightM, conditions.wavePeriodS, onshoreWindComponentMps),
  };
}
