import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { BeachDailyPredictions, PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { WaterQualityRating } from "../../../domain/rules/evaluateWaterQualityRating";

export interface BeachPredictionsResponse extends BeachDailyPredictions {
  /**
   * The beach's latest RZI-derived water-quality rating (issue #122), refreshed on its own
   * ~biweekly batch — null if this beach isn't covered by an RZI region yet, or no water-quality
   * batch run has computed one. Independent of `date`/`issuedDate` above (those describe the
   * hourly safety-flag Prediction), since it's a single beach-level value, not a per-Lead one.
   */
  waterQualityRating: WaterQualityRating | null;
}

export async function getBeachPredictions(
  predictionRepository: PredictionRepository,
  beachRepository: BeachRepository,
  beachId: string,
  date: string
): Promise<BeachPredictionsResponse | null> {
  const predictions = await predictionRepository.findByBeachAndDate(beachId, date);
  if (!predictions) return null;

  const beach = await beachRepository.findBeachById(beachId);
  return { ...predictions, waterQualityRating: beach?.waterQualityRating ?? null };
}
