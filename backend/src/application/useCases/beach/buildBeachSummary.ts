import { Beach, BeachAreas } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { FlagColor } from "../../../domain/rules/evaluateHourlyFlag";

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
  /** Sofia-local date (YYYY-MM-DD) the batch actually computed the displayed prediction on; undefined under the same condition currentFlagColor is (ADR 0007's Lead). */
  issuedDate?: string;
  area: BeachAreas;
  /** True when the beach has no official lifeguard station — frontend should label the flag as a prediction only. */
  isUnguarded: boolean;
}

/**
 * The single definition of a beach's "current report": today's (Sofia-local) current-or-nearest-legal-hour
 * flag color and confidence, plus a frontend-displayable map image. Shared by listBeaches and
 * getSavedBeaches so the two views can never disagree about what a beach's current status is.
 */
export async function buildBeachSummary(
  beach: Beach,
  predictionRepository: PredictionRepository,
  date: string,
  hour: number
): Promise<BeachSummary> {
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
    issuedDate: hourlyPrediction ? dailyPredictions?.issuedDate : undefined,
    area: beach.area,
    isUnguarded: beach.isUnguarded,
  };
}
