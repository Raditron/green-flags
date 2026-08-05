import type { BeachListResponse } from "../interfaces";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function fetchBeaches(): Promise<BeachListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/beaches`);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  return response.json() as Promise<BeachListResponse>;
}
