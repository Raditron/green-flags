import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../apiBaseUrl";
import type { Beach } from "../../shared/types/Beach";

// RN port of frontend/src/saved/data/fetchSavedBeaches.ts, verbatim — same endpoint
// (backend/src/presentation/routes/user/user.route.ts's GET /api/beaches/saved), same bearer-token
// auth as the rest of mobile's authenticated requests (see auth/data/*.ts).
export async function fetchSavedBeaches(user: User): Promise<Beach[]> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/saved`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(`Saved beaches request failed with status ${response.status}`);
  }

  return (await response.json()) as Beach[];
}
