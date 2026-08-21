import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { WaterQualityProvider } from "../../../domain/ports/batch/waterQualityProvider";
import { evaluateWaterQualityRating } from "../../../domain/rules/evaluateWaterQualityRating";
import { BeachBatchFailure } from "./runDailyBatch";

export interface RunWaterQualityBatchDependencies {
  beachRepository: BeachRepository;
  waterQualityProvider: WaterQualityProvider;
}

export interface RunWaterQualityBatchResult {
  beachesProcessed: number;
  failures: BeachBatchFailure[];
}

/**
 * Fetches each beach's latest RZI water-quality sample (RziWaterQualityProvider, issue #122) and
 * persists its derived rating (evaluateWaterQualityRating, issue #121) onto the beach document
 * itself — unlike runDailyBatch's Predictions, which accrue one document per Lead per day, this
 * overwrites in place since RZI only republishes on its own ~biweekly cadence and only the latest
 * rating is ever displayed (see .github/workflows/water-quality-batch-trigger.yml for the cadence
 * this is actually triggered on).
 *
 * A `null` sample — a beach with no RZI zone mapping (rziZoneMapping.ts), or a region fetch that
 * genuinely found nothing for its mapped zones — is silently skipped: the beach keeps whatever
 * rating it already had rather than being cleared. A per-beach exception is caught and recorded in
 * `failures`, the same isolation `runDailyBatch` uses, so one region's fetch failing doesn't stop
 * the rest of the beach list from being processed.
 */
export async function runWaterQualityBatch(deps: RunWaterQualityBatchDependencies): Promise<RunWaterQualityBatchResult> {
  const { beachRepository, waterQualityProvider } = deps;
  const beaches = await beachRepository.listBeaches();

  let beachesProcessed = 0;
  const failures: BeachBatchFailure[] = [];

  for (const beach of beaches) {
    try {
      const sample = await waterQualityProvider.fetchLatestSample(beach.id);
      if (sample) {
        await beachRepository.updateWaterQualityRating(beach.id, evaluateWaterQualityRating(sample));
      }
      beachesProcessed += 1;
    } catch (error) {
      failures.push({
        beachId: beach.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { beachesProcessed, failures };
}
