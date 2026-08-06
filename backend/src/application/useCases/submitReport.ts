import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository } from "../../domain/ports/reportRepository";
import { FlagColor } from "../../domain/rules/evaluateHourlyFlag";
import { isWithinLegalSeason, isWithinLegalWindow } from "../../domain/rules/legalWindow";
import { deriveConditionBucketKey } from "../../domain/rules/conditionBucket";
import { computeHourConfidence } from "../computeHourConfidence";
import { windSpeedToBeaufortForce } from "../../domain/rules/beaufortScale";
import { waveHeightToDouglasSeaState } from "../../domain/rules/douglasSeaState";
import { effectiveWaveHeightM } from "../../domain/rules/evaluateHourlyFlag";
import { currentSofiaHour, todayInSofia } from "../../domain/today";

/** Thrown outside the June-September lifeguard season (see .scratch/green-flags-mvp/issues/08-feedback-window-and-off-season.md). */
export class OutsideSeasonError extends Error {}
/** Thrown within season but outside the daily 09:00-18:30 window. */
export class OutsideWindowError extends Error {}
/** Thrown when the batch job hasn't yet persisted a prediction for this beach/date/hour to compare the report against. */
export class NoPredictionAvailableError extends Error {}

export interface SubmitReportInput {
  beachId: string;
  userId: string;
  flagColor: FlagColor;
  now: Date;
}

export interface SubmitReportResult {
  agreesWithPrediction: boolean;
}

/**
 * Validates a user's flag report against the legal collection window, records it, then
 * immediately re-blends that hour's confidence with the freshly-recorded report folded in (the
 * same Bayesian pseudo-count update the daily batch job uses) so the beach detail screen reflects
 * it right away rather than waiting for tomorrow's batch run.
 */
export async function submitReport(
  predictionRepository: PredictionRepository,
  reportRepository: ReportRepository,
  input: SubmitReportInput
): Promise<SubmitReportResult> {
  const date = todayInSofia(input.now);
  const hour = currentSofiaHour(input.now);

  if (!isWithinLegalSeason(date)) {
    throw new OutsideSeasonError();
  }
  if (!isWithinLegalWindow(hour)) {
    throw new OutsideWindowError();
  }

  const prediction = await predictionRepository.findByBeachAndDate(input.beachId, date);
  const hourlyPrediction = prediction?.hourlyPredictions.find((candidate) => candidate.hour === hour);
  if (!prediction || !hourlyPrediction) {
    throw new NoPredictionAvailableError();
  }

  const beaufortForce = windSpeedToBeaufortForce(hourlyPrediction.forecast.windSpeedMps);
  const douglasSeaState = waveHeightToDouglasSeaState(effectiveWaveHeightM(hourlyPrediction.forecast));
  const bucketKey = deriveConditionBucketKey(beaufortForce, douglasSeaState);
  const agreesWithPrediction = input.flagColor === hourlyPrediction.flagColor;

  await reportRepository.recordReport({
    beachId: input.beachId,
    userId: input.userId,
    date,
    hour,
    bucketKey,
    agreesWithPrediction,
  });

  const confidence = await computeHourConfidence(reportRepository, {
    beachId: input.beachId,
    date,
    hour,
    bucketKey,
    conditions: hourlyPrediction.forecast,
  });

  await predictionRepository.saveDailyPredictions({
    beachId: prediction.beachId,
    date: prediction.date,
    hourlyPredictions: prediction.hourlyPredictions.map((candidate) =>
      candidate.hour === hour ? { ...candidate, confidence } : candidate
    ),
  });

  return { agreesWithPrediction };
}
