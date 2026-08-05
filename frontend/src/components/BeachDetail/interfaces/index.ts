export type FlagColor = "green" | "yellow" | "red";
export type RipCurrentRisk = "low" | "moderate" | "high";

export interface HourlyPrediction {
  hour: number;
  flagColor: FlagColor;
  ripCurrentRisk: RipCurrentRisk;
}

export interface BeachDailyPredictions {
  beachId: string;
  date: string;
  hourlyPredictions: HourlyPrediction[];
}
