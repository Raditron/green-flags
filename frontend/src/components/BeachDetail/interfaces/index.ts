import type { FlagColor } from "../../../shared/types/Beach";

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
export type SeaStateReadable =
  | "calm"
  | "rippled"
  | "smooth"
  | "slight"
  | "moderate"
  | "rough"
  | "very rough"
  | "high";

export interface Confidence {
  percent: number;
  basis: ConfidenceBasis;
  sampleSize: number;
}

export interface HourlyPrediction {
  hour: number;
  flagColor: FlagColor;
  ripCurrentRisk: RipCurrentRisk;
  confidence: Confidence;
  readableWindSpeed: WindSpeedReadable;
  readableSeaState: SeaStateReadable;
}

export interface BeachDailyPredictions {
  beachId: string;
  date: string;
  /** Calendar date (YYYY-MM-DD) the batch run that produced this Prediction actually ran on. Mirrors backend/src/domain/ports/prediction/predictionRepository.ts's BeachDailyPredictions. */
  issuedDate: string;
  hourlyPredictions: HourlyPrediction[];
}
