import { BeachDailyPredictions, PredictionRepository } from "../../domain/ports/predictionRepository";

export async function getBeachPredictions(
  repository: PredictionRepository,
  beachId: string,
  date: string
): Promise<BeachDailyPredictions | null> {
  return repository.findByBeachAndDate(beachId, date);
}
