import type { HealthcheckResponse } from "../interfaces";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function fetchHealthcheck(): Promise<HealthcheckResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Healthcheck request failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthcheckResponse>;
}
