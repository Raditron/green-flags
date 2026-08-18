import type { BeachArea } from "../../../shared/types/Beach";
import type { FlagColor } from "../../../shared/types/Beach";

// RN port of frontend/src/components/Dashboard/interfaces/index.ts. Frontend re-exports
// ConfidenceBasis/RipCurrentRisk/SeaStateReadable/WindSpeedReadable from BeachDetail/interfaces
// (built by #97-99); mobile's BeachDetail is still #92's placeholder, so those four are declared
// here directly instead — #97-99 can move them to a shared location and update this import if the
// duplication is worth collapsing once BeachDetail actually exists.
export type { FlagColor };

export type RipCurrentRisk = "low" | "moderate" | "high";
export type ConfidenceBasis = "certain" | "prior" | "blended";

// Mirrors backend/src/domain/rules/beaufortScale.ts's WindSpeedReadable. Capped at "storm"
// since hurricane-grade Beaufort forces never occur in a Black Sea hourly forecast.
export type WindSpeedReadable =
  | "calm"
  | "light air"
  | "light breeze"
  | "gentle breeze"
  | "moderate breeze"
  | "fresh breeze"
  | "strong breeze"
  | "near gale"
  | "gale"
  | "strong gale"
  | "storm";

// Mirrors backend/src/domain/rules/douglasSeaState.ts's SeaStateReadable. Capped at "high"
// for the same reason as WindSpeedReadable above.
export type SeaStateReadable = "calm" | "rippled" | "smooth" | "slight" | "moderate" | "rough" | "very rough" | "high";

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
