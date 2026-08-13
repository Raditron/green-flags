import { ReportRepository } from "../../domain/ports/report/reportRepository";
import { SelfConsistencyRepository } from "../../domain/ports/prediction/selfConsistencyRepository";
import {
  CONFIDENCE_KAPPA,
  CONFIDENCE_KAPPA_SELF,
  ConfidenceResult,
  DistancePriorConditions,
  calibrateConfidence,
  computeDistancePrior,
} from "../../domain/rules/confidence";
import { LeadTier } from "../../domain/rules/lead";

export interface HourConfidenceInput {
  beachId: string;
  date: string;
  hour: number;
  bucketKey: string;
  conditions: DistancePriorConditions;
  /** Defaults to "near" — the near tier is always the one that has real reports and never has a self-consistency track record of its own, since it *is* the verdict Reconciliation grades other Leads against. */
  leadTier?: LeadTier;
}

/**
 * Shared by the daily batch job and live feedback submission: blends an hour's distance-derived
 * prior with historical + today's feedback via the Bayesian pseudo-count update in confidence.ts.
 *
 * For the near tier this is exactly the original single-layer blend (distance prior + report
 * history + today's reports). For mid/far tiers — which never get real reports of their own,
 * since nobody can report on a day before it happens — a `selfConsistencyRepository` layers the
 * Reconciliation-derived self-consistency track record (small kappa) under the physics prior
 * first; report-backed bucket history (large kappa) then refines and, once it exists, dominates
 * that. See docs/adr/0009-self-consistency-reconciliation-weighted-below-reports.md.
 */
export async function computeHourConfidence(
  reportRepository: ReportRepository,
  input: HourConfidenceInput,
  selfConsistencyRepository?: SelfConsistencyRepository
): Promise<ConfidenceResult> {
  const leadTier = input.leadTier ?? "near";
  const { prior, wellClear } = computeDistancePrior(input.conditions);

  if (leadTier === "near" || !selfConsistencyRepository) {
    const [historicalStats, todaysReports] = await Promise.all([
      reportRepository.getBucketStats(input.beachId, input.bucketKey, input.date),
      reportRepository.getTodaysReports(input.beachId, input.date, input.hour),
    ]);

    return calibrateConfidence({ distancePrior: prior, wellClear, historicalStats, todaysReports });
  }

  const [selfConsistencyStats, historicalStats] = await Promise.all([
    selfConsistencyRepository.getStats(input.bucketKey, leadTier),
    reportRepository.getBucketStats(input.beachId, input.bucketKey, input.date),
  ]);

  const selfConsistencyBlended = calibrateConfidence({
    distancePrior: prior,
    wellClear,
    historicalStats: selfConsistencyStats,
    kappa: CONFIDENCE_KAPPA_SELF,
  });

  return calibrateConfidence({
    distancePrior: selfConsistencyBlended.percent / 100,
    wellClear,
    historicalStats,
    kappa: CONFIDENCE_KAPPA,
  });
}
