import { API_BASE_URL } from "../../../apiBaseUrl";
import type { BeachDailyPredictions } from "../interfaces";

export async function fetchPredictions(beachId: string): Promise<BeachDailyPredictions> {
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/predictions`);

  if (!response.ok) {
    throw new Error(`Prediction request failed with status ${response.status}`);
  }

  return response.json() as Promise<BeachDailyPredictions>;
}
