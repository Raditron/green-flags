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
  /** Calendar date (YYYY-MM-DD) the batch run that produced this Prediction actually ran on — together with `date`, this is Lead: docs/adr/0007-prediction-keyed-by-target-and-issued-date.md. */
  issuedDate: string;
  hourlyPredictions: HourlyPrediction[];
}

export interface PredictionRepository {
  /** Upserts by beach + target date + issued date, so re-running the batch job on the same day for the same target date replaces rather than duplicates that day's Prediction, while still accumulating one Prediction per Lead as the target date moves through the rolling window. */
  saveDailyPredictions(predictions: BeachDailyPredictions): Promise<void>;

  /** Point lookup by beach + target date, resolving to the freshest (smallest-Lead, i.e. most-recently-issued) Prediction for that date — the one every "today" read path wants. Null if no batch run has persisted a Prediction for that date yet. */
  findByBeachAndDate(beachId: string, date: string): Promise<BeachDailyPredictions | null>;

  /** Every beach's freshest-Lead Prediction for a single target date, filtered at the data source
   * rather than in application code — the predictions collection accumulates one Prediction per
   * beach per Lead per target date forever, so this must never come back as an unfiltered
   * full-collection fetch. */
  getDailyPredictions(date: string): Promise<BeachDailyPredictions[] | null>;

  /** Every Prediction ever issued for a single target date, across all beaches and every Lead — used by Reconciliation to grade older-Lead Predictions against that date's own near-tier (Lead 0) Prediction once the date closes out. */
  getIssuedPredictionsForTargetDate(date: string): Promise<BeachDailyPredictions[]>;
}
