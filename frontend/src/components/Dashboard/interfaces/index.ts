import type { BeachArea } from "../../../shared/types/Beach";
import type {
  ConfidenceBasis,
  FlagColor,
  RipCurrentRisk,
  SeaStateReadable,
  WindSpeedReadable,
} from "../../BeachDetail/interfaces";

export type { ConfidenceBasis, FlagColor, RipCurrentRisk, SeaStateReadable, WindSpeedReadable };

export interface FlagColorDistribution {
  green: number;
  yellow: number;
  red: number;
}

export interface RipCurrentRiskDistribution {
  low: number;
  moderate: number;
  high: number;
}

export interface ConfidenceBasisDistribution {
  certain: number;
  prior: number;
  blended: number;
}

/** Mirrors the backend's AverageAttributes (see getDailyBlackSeaSummary.ts) — everything the
 * dashboard's hero card and each area card render. */
export interface AverageAttributes {
  dominantFlagColor: FlagColor;
  flagColorDistribution: FlagColorDistribution;
  dominantRipCurrentRisk: RipCurrentRisk;
  ripCurrentRiskDistribution: RipCurrentRiskDistribution;
  averageConfidencePercent: number;
  confidenceBasisDistribution: ConfidenceBasisDistribution;
  averageWindSpeedMps: number;
  readableWindSpeed: WindSpeedReadable;
  averageWaveHeightM: number;
  readableSeaState: SeaStateReadable;
  averageWavePeriodS: number;
  stormWarningActivePercent: number;
  sampleSize: number;
  beachCount: number;
}

export interface AreaAverageAttributes extends AverageAttributes {
  area: BeachArea;
}

export interface DailySummaryResponse {
  date: string;
  averageAttributesBySea: AverageAttributes;
  averageAttributesByArea: AreaAverageAttributes[];
}
