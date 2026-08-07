import { API_BASE_URL } from "../../../apiBaseUrl";
import type { BeachDailyPredictions } from "../interfaces";

export async function fetchPredictions(beachId: string): Promise<BeachDailyPredictions> {
  const url = `${API_BASE_URL}/api/beaches/${beachId}/predictions`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Prediction request failed with status ${response.status}`);
  }

  return (await response.json()) as BeachDailyPredictions;
}
