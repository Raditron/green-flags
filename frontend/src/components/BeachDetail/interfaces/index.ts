export type FlagColor = "green" | "yellow" | "red";
export type RipCurrentRisk = "low" | "moderate" | "high";
export type ConfidenceBasis = "certain" | "prior" | "blended";

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
}

export interface BeachDailyPredictions {
  beachId: string;
  date: string;
  hourlyPredictions: HourlyPrediction[];
}
