import { API_BASE_URL } from "../../../apiBaseUrl";
import type { BeachDailyPredictions } from "../interfaces";

// RN port of frontend/src/components/BeachDetail/data/fetchPredictions.ts, verbatim.
//
// Thrown specifically for a 404 (no Prediction persisted for that beach/date yet — e.g. a date
// that just entered the rolling 7-day window before the next batch run), so callers can tell
// "no forecast yet" apart from a genuine network/server failure. See usePredictions.
export class PredictionsNotFoundError extends Error {
  constructor() {
    super("No predictions found for this beach and date");
    this.name = "PredictionsNotFoundError";
  }
}

// `date` (YYYY-MM-DD) is optional and forwarded as-is to the existing `?date=` query param the
// predictions endpoint already accepts; omitting it preserves today's exact prior request. See
// frontend's docs/adr/0007-prediction-keyed-by-target-and-issued-date.md for what a date resolves to.
export async function fetchPredictions(beachId: string, date?: string): Promise<BeachDailyPredictions> {
  const url = new URL(`${API_BASE_URL}/api/beaches/${beachId}/predictions`);
  if (date) url.searchParams.set("date", date);

  const response = await fetch(url);

  if (response.status === 404) {
    throw new PredictionsNotFoundError();
  }
  if (!response.ok) {
    throw new Error(`Prediction request failed with status ${response.status}`);
  }

  return (await response.json()) as BeachDailyPredictions;
}
