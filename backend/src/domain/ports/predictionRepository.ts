import { ForecastReading } from "../forecastReading";
import { FlagColor, RipCurrentRisk } from "../rules/evaluateHourlyFlag";

export interface HourlyPrediction {
  /** Local hour of day (0-23) this prediction applies to. */
  hour: number;
  flagColor: FlagColor;
  ripCurrentRisk: RipCurrentRisk;
  /** The forecast inputs the rule engine evaluated for this hour, kept alongside the result for auditability. */
  forecast: ForecastReading & { stormWarningActive: boolean };
}

export interface BeachDailyPredictions {
  beachId: string;
  /** Calendar date (YYYY-MM-DD) these predictions apply to, in the beach's own timezone. */
  date: string;
  hourlyPredictions: HourlyPrediction[];
}

export interface PredictionRepository {
  /** Upserts by beach + date, so re-running the batch job for the same day replaces rather than duplicates. */
  saveDailyPredictions(predictions: BeachDailyPredictions): Promise<void>;
}
