import type { HourlyPrediction } from "../../interfaces";

export interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
  updatedAt?: string;
  isUnguarded?: boolean;
  // Owns the report-the-flag feature now (see useReportFlag) since its entry point lives
  // inside Verdict and its confirmation card lives directly under it — both one level
  // beneath where BeachDetail used to render the standalone ReportFlagButton.
  beachId: string;
}
