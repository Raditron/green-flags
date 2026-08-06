import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";
import type { FlagColor } from "../../interfaces";

export interface SubmitFlagReportResult {
  agreesWithPrediction: boolean;
}

export class ReportSubmissionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function submitFlagReport(beachId: string, user: User, flagColor: FlagColor): Promise<SubmitFlagReportResult> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ flagColor }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ReportSubmissionError(body?.code ?? "unknown_error", body?.message ?? "Could not submit report");
  }

  return body as SubmitFlagReportResult;
}
