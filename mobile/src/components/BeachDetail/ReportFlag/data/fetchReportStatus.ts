import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";
import type { FlagColor } from "../../../../shared/types/Beach";
import type { ReportedFlag } from "../interfaces";

// RN port of frontend/src/components/BeachDetail/ReportFlag/data/fetchReportStatus.ts, verbatim.
export type ReportStatus =
  | { alreadyReportedToday: false }
  | { alreadyReportedToday: true; reported: ReportedFlag };

/** The raw wire shape — flagColor/agreesWithPrediction arrive as siblings of alreadyReportedToday, present only when it's true. */
interface ReportStatusResponseBody {
  alreadyReportedToday: boolean;
  flagColor?: FlagColor;
  agreesWithPrediction?: boolean;
}

export async function fetchReportStatus(beachId: string, user: User): Promise<ReportStatus> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/report-status`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(`Report status request failed with status ${response.status}`);
  }

  const body = (await response.json()) as ReportStatusResponseBody;

  if (!body.alreadyReportedToday) {
    return { alreadyReportedToday: false };
  }

  // The controller always sends flagColor/agreesWithPrediction alongside alreadyReportedToday:
  // true — treated as a contract violation rather than silently defaulted, so a malformed
  // response fails the fetch (callers already fail closed on a rejected promise) instead of
  // reporting a color the user never actually picked.
  if (!body.flagColor || body.agreesWithPrediction === undefined) {
    throw new Error("Report status response was missing flagColor/agreesWithPrediction for an already-reported day");
  }

  return {
    alreadyReportedToday: true,
    reported: { flagColor: body.flagColor, agreesWithPrediction: body.agreesWithPrediction },
  };
}
