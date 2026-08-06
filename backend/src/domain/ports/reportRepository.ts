/**
 * Read-side of the empirical hit-rate tracking the calibration layer depends on. Recording a
 * report (the auth-gated, rate-limited write path) belongs to the feedback submission feature
 * (.scratch/green-flags-mvp/issues/07-auth-implementation.md,
 * .scratch/green-flags-mvp/issues/04-feedback-abuse-resistance.md) — this port only defines what
 * the calibration layer needs to read back.
 */
export interface ReportRepository {
  /** Historical hit-rate for this beach + condition bucket, excluding the given date so today's live reports aren't double-counted against the baseline they're blended with. */
  getBucketStats(beachId: string, bucketKey: string, excludeDate: string): Promise<{ hits: number; total: number }>;
  /** Today's live reports for this beach + hour, as an agree/total tally against the rule engine's call. */
  getTodaysReports(beachId: string, date: string, hour: number): Promise<{ agree: number; total: number }>;
}
