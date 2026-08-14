import { LeadTier } from "../../rules/lead";

export interface SelfConsistencyStats {
  hits: number;
  total: number;
}

/** One graded (candidate Lead>0 Prediction hour) vs (near-tier verdict hour) comparison, produced by Reconciliation. */
export interface SelfConsistencyOutcome {
  bucketKey: string;
  leadTier: LeadTier;
  hit: boolean;
}

/**
 * Self-consistency-derived hit/miss tallies per (condition bucket, Lead Tier) — kept separate from
 * report-backed stats (ReportRepository) and weighted below them in confidence calibration, per
 * docs/adr/0009-self-consistency-reconciliation-weighted-below-reports.md.
 */
export interface SelfConsistencyRepository {
  /** Cumulative hit/total tally for this bucket + Lead Tier. Zero/zero if Reconciliation has never graded a Prediction in this bucket at this tier. */
  getStats(bucketKey: string, leadTier: LeadTier): Promise<SelfConsistencyStats>;
  /** Folds a batch of Reconciliation outcomes into their (bucket, Lead Tier) tallies. */
  recordOutcomes(outcomes: SelfConsistencyOutcome[]): Promise<void>;
}
