import { BeachDailyPredictions, PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { SelfConsistencyOutcome, SelfConsistencyRepository } from "../../../domain/ports/prediction/selfConsistencyRepository";
import { deriveConditionBucketKey } from "../../../domain/rules/conditionBucket";
import { deriveBeaufortAndDouglas } from "../../../domain/rules/evaluateHourlyFlag";
import { deriveLead, deriveLeadTier } from "../../../domain/rules/lead";

/** A Prediction's own issuedDate === date is exactly the near-tier (Lead 0) case: it's the "verdict" every older-Lead Prediction for that same target date is graded against. */
function isVerdict(prediction: BeachDailyPredictions): boolean {
  return prediction.issuedDate === prediction.date;
}

function groupByBeach(predictions: BeachDailyPredictions[]): Map<string, BeachDailyPredictions[]> {
  const byBeach = new Map<string, BeachDailyPredictions[]>();
  for (const prediction of predictions) {
    const list = byBeach.get(prediction.beachId) ?? [];
    list.push(prediction);
    byBeach.set(prediction.beachId, list);
  }
  return byBeach;
}

/**
 * Grades every closed-out, older-Lead (Lead > 0) Prediction issued for `targetDate` against that
 * date's own near-tier (Lead 0) Prediction — the closest thing to ground truth available before
 * real reports exist for a date, per
 * docs/adr/0009-self-consistency-reconciliation-weighted-below-reports.md. Runs as the first step
 * of the daily batch, per docs/adr/0008-reconciliation-runs-in-daily-batch-trigger.md.
 *
 * Silently does nothing for a beach/date with no near-tier Prediction yet to grade against (e.g.
 * the very first days after this feature ships, before a full 7-day history has accumulated).
 */
export async function reconcileClosedPredictions(
  predictionRepository: PredictionRepository,
  selfConsistencyRepository: SelfConsistencyRepository,
  targetDate: string
): Promise<void> {
  const predictions = await predictionRepository.getIssuedPredictionsForTargetDate(targetDate);
  const byBeach = groupByBeach(predictions);

  const outcomes: SelfConsistencyOutcome[] = [];

  for (const beachPredictions of byBeach.values()) {
    const verdict = beachPredictions.find(isVerdict);
    if (!verdict) continue;

    for (const candidate of beachPredictions) {
      if (isVerdict(candidate)) continue;

      const leadTier = deriveLeadTier(deriveLead(candidate.issuedDate, candidate.date));

      for (const hourPrediction of candidate.hourlyPredictions) {
        const verdictHour = verdict.hourlyPredictions.find((candidateHour) => candidateHour.hour === hourPrediction.hour);
        if (!verdictHour) continue;

        const { beaufortForce, douglasSeaState } = deriveBeaufortAndDouglas(hourPrediction.forecast);
        const bucketKey = deriveConditionBucketKey(beaufortForce, douglasSeaState);

        outcomes.push({ bucketKey, leadTier, hit: hourPrediction.flagColor === verdictHour.flagColor });
      }
    }
  }

  if (outcomes.length > 0) {
    await selfConsistencyRepository.recordOutcomes(outcomes);
  }
}
