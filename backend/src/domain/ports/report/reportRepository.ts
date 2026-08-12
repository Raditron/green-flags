import { FlagColor } from "../../rules/evaluateHourlyFlag";

/**
 * The flag color a user reported plus whether it matched the rule engine's call — this pair
 * travels together everywhere a report is written or echoed back (the submission itself, the
 * stored record, the status-check response), so it gets its own type rather than being repeated
 * as two separate fields at each site.
 */
export interface ReportedFlag {
  /** The flag color the user actually observed/reported. */
  flagColor: FlagColor;
  /** Whether that reported color matched the rule engine's prediction for this beach/hour. */
  agreesWithPrediction: boolean;
}

/**
 * Read side feeds the calibration layer's empirical hit-rate; write side is the auth-gated,
 * rate-limited feedback submission path (issue #9), which enforces the one-submission-per-
 * user-per-beach-per-day cap from
 * .scratch/green-flags-mvp/issues/04-feedback-abuse-resistance.md.
 */
export interface ReportInput extends ReportedFlag {
  beachId: string;
  userId: string;
  date: string;
  hour: number;
  bucketKey: string;
}

/** The subset of a stored report the beach detail screen needs to display "you already reported today". */
export interface ReportRecord extends ReportedFlag {
  beachId: string;
  userId: string;
  date: string;
}

/** Thrown by `recordReport` when this user has already submitted a report for this beach on this date — the one-submission-per-user-per-beach-per-day cap from .scratch/green-flags-mvp/issues/04-feedback-abuse-resistance.md. */
export class DuplicateReportError extends Error {}

export interface ReportRepository {
  /** Historical hit-rate for this beach + condition bucket, excluding the given date so today's live reports aren't double-counted against the baseline they're blended with. */
  getBucketStats(beachId: string, bucketKey: string, excludeDate: string): Promise<{ hits: number; total: number }>;
  /** Today's live reports for this beach + hour, as an agree/total tally against the rule engine's call. */
  getTodaysReports(beachId: string, date: string, hour: number): Promise<{ agree: number; total: number }>;
  /** This user's report for this beach on this date, or null if they haven't reported yet. */
  getTodaysReport(beachId: string, userId: string, date: string): Promise<ReportRecord | null>;
  /** Records one user's report. Throws DuplicateReportError instead of writing a second report for the same user/beach/day. */
  recordReport(report: ReportInput): Promise<void>;
}
