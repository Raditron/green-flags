import { API_BASE_URL } from "../../../apiBaseUrl";
import type { Beach } from "../../../shared/types/Beach";

// RN port of frontend/src/components/BeachDetail/data/fetchBeach.ts — same endpoint (there's no
// single-beach GET, so this fetches the whole list and finds the one beach by id, same as
// frontend), same fields (mapImageDataUrl dropped — see useBeach's doc comment).
export async function fetchBeach(
  beachId: string,
): Promise<Pick<Beach, "name" | "quirkNotes" | "isUnguarded"> | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/beaches`);

  if (!response.ok) {
    throw new Error(`Beach list request failed with status ${response.status}`);
  }

  const { beaches } = (await response.json()) as { beaches: Beach[] };
  const beach = beaches.find((candidate) => candidate.id === beachId);
  return (
    beach && {
      name: beach.name,
      quirkNotes: beach.quirkNotes,
      isUnguarded: beach.isUnguarded,
    }
  );
}
