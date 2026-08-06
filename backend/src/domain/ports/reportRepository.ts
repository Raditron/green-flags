/**
 * Read side feeds the calibration layer's empirical hit-rate; write side is the auth-gated,
 * rate-limited feedback submission path (issue #9), which enforces the one-submission-per-
 * user-per-beach-per-day cap from
 * .scratch/green-flags-mvp/issues/04-feedback-abuse-resistance.md.
 */
export interface ReportInput {
  beachId: string;
  userId: string;
  date: string;
  hour: number;
  bucketKey: string;
  agreesWithPrediction: boolean;
}

/** Thrown by `recordReport` when this user has already submitted a report for this beach on this date — the one-submission-per-user-per-beach-per-day cap from .scratch/green-flags-mvp/issues/04-feedback-abuse-resistance.md. */
export class DuplicateReportError extends Error {}

export interface ReportRepository {
  /** Historical hit-rate for this beach + condition bucket, excluding the given date so today's live reports aren't double-counted against the baseline they're blended with. */
  getBucketStats(beachId: string, bucketKey: string, excludeDate: string): Promise<{ hits: number; total: number }>;
  /** Today's live reports for this beach + hour, as an agree/total tally against the rule engine's call. */
  getTodaysReports(beachId: string, date: string, hour: number): Promise<{ agree: number; total: number }>;
  /** True if this user has already submitted a report for this beach on this date. */
  hasReportedToday(beachId: string, userId: string, date: string): Promise<boolean>;
  /** Records one user's report. Throws DuplicateReportError instead of writing a second report for the same user/beach/day. */
  recordReport(report: ReportInput): Promise<void>;
}
