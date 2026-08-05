import { API_BASE_URL } from "../../../apiBaseUrl";
import type { BeachListResponse } from "../interfaces";

export async function fetchBeaches(): Promise<BeachListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/beaches`);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  return response.json() as Promise<BeachListResponse>;
}
