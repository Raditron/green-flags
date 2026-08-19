import { API_BASE_URL } from "../../../apiBaseUrl";
import type { BeachListResponse } from "../interfaces";

// RN port of frontend/src/components/BeachList/data/fetchBeaches.ts, verbatim — same endpoint,
// same success/failure contract (backend/src/presentation/routes/beach/beach.route.ts's
// GET /api/beaches).
export async function fetchBeaches(): Promise<BeachListResponse> {
  const url = `${API_BASE_URL}/api/beaches`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  return (await response.json()) as BeachListResponse;
}
