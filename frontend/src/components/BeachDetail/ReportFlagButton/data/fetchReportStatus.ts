import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";

export interface ReportStatus {
  alreadyReportedToday: boolean;
}

export async function fetchReportStatus(beachId: string, user: User): Promise<ReportStatus> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/report-status`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(`Report status request failed with status ${response.status}`);
  }

  return response.json() as Promise<ReportStatus>;
}
