import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../apiBaseUrl";

// RN port of frontend/src/saved/data/saveBeach.ts, verbatim — same endpoint
// (backend/src/presentation/routes/user/user.route.ts's POST /api/beaches/:beachId/save), which is
// idempotent server-side (saving an already-saved beach is a no-op).
export async function saveBeach(beachId: string, user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/save`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(`Save beach request failed with status ${response.status}`);
  }
}
