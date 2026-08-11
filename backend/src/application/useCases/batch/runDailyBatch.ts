import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { ForecastProvider } from "../../../domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../../domain/ports/batch/stormWarningProvider";
import { HourlyPrediction, PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { ReportRepository } from "../../../domain/ports/report/reportRepository";
import { evaluateHourlyFlag } from "../../../domain/rules/evaluateHourlyFlag";
import { isWithinLegalWindow } from "../../../domain/rules/legalWindow";
import { deriveConditionBucketKey } from "../../../domain/rules/conditionBucket";
import { computeHourConfidence } from "../../shared/computeHourConfidence";

export interface RunDailyBatchDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
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

export async function runDailyBatch(deps: RunDailyBatchDependencies): Promise<RunDailyBatchResult> {
  const { beachRepository, forecastProvider, stormWarningProvider, predictionRepository, reportRepository, now } = deps;

  const beaches = await beachRepository.listBeaches();
  const stormWarningActive = await stormWarningProvider.checkActiveStormWarning(now);

  let beachesProcessed = 0;
  const failures: BeachBatchFailure[] = [];

  for (const beach of beaches) {
    try {
      const dailyForecast = await forecastProvider.fetchDailyForecast(beach);

      const hourlyPredictions: HourlyPrediction[] = await Promise.all(
        dailyForecast.hours
          .filter((hourlyForecast) => isWithinLegalWindow(hourlyForecast.hour))
          .map(async (hourlyForecast) => {
            const { hour, ...reading } = hourlyForecast;
            const conditions = { ...reading, onshoreWindDirectionDeg: beach.onshoreWindDirectionDeg, stormWarningActive };
            const assessment = evaluateHourlyFlag(conditions);
            const bucketKey = deriveConditionBucketKey(assessment.beaufortForce, assessment.douglasSeaState);
            const confidence = await computeHourConfidence(reportRepository, {
              beachId: beach.id,
              date: dailyForecast.date,
              hour,
              bucketKey,
              conditions,
            });

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
        hourlyPredictions,
      });

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
