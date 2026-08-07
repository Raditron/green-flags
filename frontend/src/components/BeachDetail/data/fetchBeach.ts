import { API_BASE_URL } from "../../../apiBaseUrl";
import type { Beach } from "../../../shared/types/Beach";

export async function fetchBeach(
  beachId: string
): Promise<Pick<Beach, "name" | "mapImageDataUrl" | "quirkNotes"> | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/beaches`);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  const { beaches } = (await response.json()) as { beaches: Beach[] };
  const beach = beaches.find((candidate) => candidate.id === beachId);
  return beach && { name: beach.name, mapImageDataUrl: beach.mapImageDataUrl, quirkNotes: beach.quirkNotes };
}
