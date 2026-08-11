import { ReportRepository } from "../../domain/ports/report/reportRepository";
import { ConfidenceResult, DistancePriorConditions, calibrateConfidence, computeDistancePrior } from "../../domain/rules/confidence";

export interface HourConfidenceInput {
  beachId: string;
  date: string;
  hour: number;
  bucketKey: string;
  conditions: DistancePriorConditions;
}

/**
 * Shared by the daily batch job and live feedback submission: blends an hour's distance-derived
 * prior with historical + today's feedback via the Bayesian pseudo-count update in confidence.ts.
 */
export async function computeHourConfidence(
  reportRepository: ReportRepository,
  input: HourConfidenceInput
): Promise<ConfidenceResult> {
  const { prior, wellClear } = computeDistancePrior(input.conditions);
  const [historicalStats, todaysReports] = await Promise.all([
    reportRepository.getBucketStats(input.beachId, input.bucketKey, input.date),
    reportRepository.getTodaysReports(input.beachId, input.date, input.hour),
  ]);

  return calibrateConfidence({ distancePrior: prior, wellClear, historicalStats, todaysReports });
}
