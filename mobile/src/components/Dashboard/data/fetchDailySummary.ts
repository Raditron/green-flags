import { API_BASE_URL } from "../../../apiBaseUrl";
import type { DailySummaryResponse } from "../interfaces";

// RN port of frontend/src/components/Dashboard/data/fetchDailySummary.ts, verbatim — same
// endpoint, same success/failure contract (backend/src/presentation/routes/prediction/
// prediction.route.ts's GET /api/daily-summary).
export async function fetchDailySummary(): Promise<DailySummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/daily-summary`);

  if (!response.ok) {
    throw new Error(`Daily summary request failed with status ${response.status}`);
  }

  return response.json() as Promise<DailySummaryResponse>;
}
