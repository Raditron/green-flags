export interface ReportFlagButtonProps {
  beachId: string;
}

export type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; agreesWithPrediction: boolean }
  | { status: "error"; message: string };
