import { API_BASE_URL } from "../../../apiBaseUrl";

export async function fetchBeachName(beachId: string): Promise<string | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/beaches`);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  const { beaches } = (await response.json()) as { beaches: { id: string; name: string }[] };
  return beaches.find((beach) => beach.id === beachId)?.name;
}
