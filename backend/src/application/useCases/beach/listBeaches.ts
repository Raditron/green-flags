import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { currentOrNearestLegalHour, todayInSofia } from "../../../domain/shared/today";
import { buildBeachSummary, BeachSummary } from "./buildBeachSummary";

export type { BeachSummary };

export async function listBeaches(
  repository: BeachRepository,
  predictionRepository: PredictionRepository,
  now: Date = new Date()
): Promise<BeachSummary[]> {
  const beaches = await repository.listBeaches();
  const date = todayInSofia(now);
  const hour = currentOrNearestLegalHour(now);

  return Promise.all(beaches.map((beach) => buildBeachSummary(beach, predictionRepository, date, hour)));
}
