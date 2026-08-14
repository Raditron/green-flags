import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { ForecastProvider } from "../../../domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../../domain/ports/batch/stormWarningProvider";
import { HourlyPrediction, PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { ReportRepository } from "../../../domain/ports/report/reportRepository";
import { SelfConsistencyRepository } from "../../../domain/ports/prediction/selfConsistencyRepository";
import { evaluateHourlyFlag } from "../../../domain/rules/evaluateHourlyFlag";
import { isWithinLegalWindow } from "../../../domain/rules/legalWindow";
import { deriveConditionBucketKey } from "../../../domain/rules/conditionBucket";
import { deriveLead, deriveLeadTier } from "../../../domain/rules/lead";
import { previousCalendarDate, todayInSofia } from "../../../domain/shared/today";
import { computeHourConfidence } from "../../shared/computeHourConfidence";
import { reconcileClosedPredictions } from "./reconcilePredictions";

export interface RunDailyBatchDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
  selfConsistencyRepository: SelfConsistencyRepository;
  now: Date;
}

export interface BeachBatchFailure {
  beachId: string;
  message: string;
}

export interface RunDailyBatchResult {
  beachesProcessed: number;
  failures: BeachBatchFailure[];
}

/**
 * Re-issues a Prediction for every date in the rolling 7-day forecast window (today..today+6), per
 * docs/adr/0007-prediction-keyed-by-target-and-issued-date.md, and — as its first step, before any
 * new Predictions are written — grades out yesterday's closed-out Predictions via Reconciliation
 * (docs/adr/0008-reconciliation-runs-in-daily-batch-trigger.md) so mid/far-Lead confidence for
 * today's run can draw on a freshly updated self-consistency track record.
 */
export async function runDailyBatch(deps: RunDailyBatchDependencies): Promise<RunDailyBatchResult> {
  const {
    beachRepository,
    forecastProvider,
    stormWarningProvider,
    predictionRepository,
    reportRepository,
    selfConsistencyRepository,
    now,
  } = deps;

  const issuedDate = todayInSofia(now);
  await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, previousCalendarDate(issuedDate));

  const beaches = await beachRepository.listBeaches();
  const stormWarningActive = await stormWarningProvider.checkActiveStormWarning(now);

  let beachesProcessed = 0;
  const failures: BeachBatchFailure[] = [];

  for (const beach of beaches) {
    try {
      const forecastWindow = await forecastProvider.fetchForecastWindow(beach);

      for (const dailyForecast of forecastWindow) {
        const leadTier = deriveLeadTier(deriveLead(issuedDate, dailyForecast.date));

        const hourlyPredictions: HourlyPrediction[] = await Promise.all(
          dailyForecast.hours
            .filter((hourlyForecast) => isWithinLegalWindow(hourlyForecast.hour))
            .map(async (hourlyForecast) => {
              const { hour, ...reading } = hourlyForecast;
              const conditions = { ...reading, onshoreWindDirectionDeg: beach.onshoreWindDirectionDeg, stormWarningActive };
              const assessment = evaluateHourlyFlag(conditions);
              const bucketKey = deriveConditionBucketKey(assessment.beaufortForce, assessment.douglasSeaState);
              const confidence = await computeHourConfidence(
                reportRepository,
                {
                  beachId: beach.id,
                  date: dailyForecast.date,
                  hour,
                  bucketKey,
                  conditions,
                  leadTier,
                },
                selfConsistencyRepository
              );

              return {
                hour,
                flagColor: assessment.flagColor,
                ripCurrentRisk: assessment.ripCurrentRisk,
                forecast: { ...reading, stormWarningActive },
                confidence,
                readableWindSpeed: assessment.readableWindSpeed,
                readableSeaState: assessment.readableSeaState,
              };
            })
        );

        await predictionRepository.saveDailyPredictions({
          beachId: beach.id,
          date: dailyForecast.date,
          issuedDate,
          hourlyPredictions,
        });
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
