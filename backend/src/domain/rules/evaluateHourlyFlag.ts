import { ForecastReading } from "../forecastReading";
import { windSpeedToBeaufortForce } from "./beaufortScale";
import { waveHeightToDouglasSeaState } from "./douglasSeaState";

export type FlagColor = "green" | "yellow" | "red";
export type RipCurrentRisk = "low" | "moderate" | "high";

export interface HourlyConditions extends ForecastReading {
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

/** Rip current risk thresholds: [moderate, high] per factor. No feed exists for the Black Sea
 * (see project research), so these are project-chosen, derived from wave height/period and the
 * onshore wind component — the same class of factors used to assess rip current hazard elsewhere.
 */
const RIP_WAVE_HEIGHT_THRESHOLDS_M: [moderate: number, high: number] = [0.5, 1.0];
const RIP_WAVE_PERIOD_THRESHOLDS_S: [moderate: number, high: number] = [6, 8];
const RIP_ONSHORE_WIND_THRESHOLDS_MPS: [moderate: number, high: number] = [3, 8];
const RIP_SCORE_MODERATE = 2;
const RIP_SCORE_HIGH = 4;

function deriveRipCurrentRisk(waveHeightM: number, wavePeriodS: number, onshoreWindComponentMps: number): RipCurrentRisk {
  const scoreFactor = (value: number, [moderateThreshold, highThreshold]: [number, number]): number => {
    if (value >= highThreshold) return 2;
    if (value >= moderateThreshold) return 1;
    return 0;
  };

  const score =
    scoreFactor(waveHeightM, RIP_WAVE_HEIGHT_THRESHOLDS_M) +
    scoreFactor(wavePeriodS, RIP_WAVE_PERIOD_THRESHOLDS_S) +
    scoreFactor(onshoreWindComponentMps, RIP_ONSHORE_WIND_THRESHOLDS_MPS);

  if (score >= RIP_SCORE_HIGH) return "high";
  if (score >= RIP_SCORE_MODERATE) return "moderate";
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
