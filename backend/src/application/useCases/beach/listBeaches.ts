import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { FlagColor } from "../../../domain/rules/evaluateHourlyFlag";
import { currentOrNearestLegalHour, todayInSofia } from "../../../domain/shared/today";
import { BeachAreas } from "../../../domain/ports/beach/beachRepository";

export interface BeachSummary {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImageDataUrl?: string;
  /** The current (or nearest legal-window) hour's flag color; undefined if today's batch hasn't run yet. */
  currentFlagColor?: FlagColor;
  currentConfidencePercent?: number;
  area : BeachAreas;
  /** True when the beach has no official lifeguard station — frontend should label the flag as a prediction only. */
  isUnguarded: boolean;
}

export async function listBeaches(
  repository: BeachRepository,
  predictionRepository: PredictionRepository,
  now: Date = new Date()
): Promise<BeachSummary[]> {
  const beaches = await repository.listBeaches();
  const date = todayInSofia(now);
  const hour = currentOrNearestLegalHour(now);

  return Promise.all(
    beaches.map(async (beach) => {
      const dailyPredictions = await predictionRepository.findByBeachAndDate(beach.id, date);
      const hourlyPrediction = dailyPredictions?.hourlyPredictions.find((prediction) => prediction.hour === hour);

      return {
        id: beach.id,
        name: beach.name,
        lat: beach.lat,
        long: beach.long,
        quirkNotes: beach.quirkNotes,
        mapImageDataUrl: beach.mapImage
          ? `data:${beach.mapImage.contentType};base64,${beach.mapImage.data.toString("base64")}`
          : undefined,
        currentFlagColor: hourlyPrediction?.flagColor,
        currentConfidencePercent: hourlyPrediction?.confidence.percent,
        area: beach.area,
        isUnguarded: beach.isUnguarded,
      };
    })
  );
}
