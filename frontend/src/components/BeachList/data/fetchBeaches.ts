import { API_BASE_URL } from "../../../apiBaseUrl";
import type { BeachListResponse } from "../interfaces";

export async function fetchBeaches(): Promise<BeachListResponse> {
  const url = `${API_BASE_URL}/api/beaches`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  return (await response.json()) as BeachListResponse;
}
