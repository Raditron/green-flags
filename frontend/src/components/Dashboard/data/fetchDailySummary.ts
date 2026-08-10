import { API_BASE_URL } from "../../../apiBaseUrl";
import type { DailySummaryResponse } from "../interfaces";

export async function fetchDailySummary(): Promise<DailySummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/daily-summary`);

  if (!response.ok) {
    throw new Error(`Daily summary request failed with status ${response.status}`);
  }

  return response.json() as Promise<DailySummaryResponse>;
}
