import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../apiBaseUrl";

// RN port of frontend/src/saved/data/unsaveBeach.ts, verbatim — same endpoint
// (backend/src/presentation/routes/user/user.route.ts's DELETE /api/beaches/:beachId/save), which
// is idempotent server-side (unsaving an already-unsaved beach is a no-op).
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
