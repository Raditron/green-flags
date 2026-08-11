import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../apiBaseUrl";

export async function unsaveBeach(beachId: string, user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/save`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(`Unsave beach request failed with status ${response.status}`);
  }
}
