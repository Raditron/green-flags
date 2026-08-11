import { ForecastReading } from "../../forecastReading";
import { FlagColor, RipCurrentRisk } from "../../rules/evaluateHourlyFlag";
import { WindSpeedReadable } from "../../rules/beaufortScale";
import { SeaStateReadable } from "../../rules/douglasSeaState";
import { ConfidenceResult } from "../../rules/confidence";

export interface HourlyPrediction {
  /** Local hour of day (0-23) this prediction applies to. */
  hour: number;
  flagColor: FlagColor;
  ripCurrentRisk: RipCurrentRisk;
  /** The forecast inputs the rule engine evaluated for this hour, kept alongside the result for auditability. */
  forecast: ForecastReading & { stormWarningActive: boolean };
  confidence: ConfidenceResult;
  readableWindSpeed: WindSpeedReadable;
  readableSeaState: SeaStateReadable;
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
  /** Point lookup by beach + date; resolves to null if no batch run has persisted predictions for that day yet. */
  findByBeachAndDate(beachId: string, date: string): Promise<BeachDailyPredictions | null>;

  /** Every beach's predictions for a single calendar date, filtered at the data source rather than
   * in application code — the predictions collection accumulates one batch run per beach per day
   * forever, so this must never come back as an unfiltered full-collection fetch. */
  getDailyPredictions(date: string): Promise<BeachDailyPredictions[] | null>;
}
