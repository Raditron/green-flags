import { API_BASE_URL } from "../../../apiBaseUrl";
import type { HealthcheckResponse } from "../interfaces";

export async function fetchHealthcheck(): Promise<HealthcheckResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Healthcheck request failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthcheckResponse>;
}
