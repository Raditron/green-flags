import { BeachRepository } from "../../domain/ports/beachRepository";
import { ForecastProvider } from "../../domain/ports/forecastProvider";
import { StormWarningProvider } from "../../domain/ports/stormWarningProvider";
import { HourlyPrediction, PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository } from "../../domain/ports/reportRepository";
import { evaluateHourlyFlag } from "../../domain/rules/evaluateHourlyFlag";
import { isWithinLegalWindow } from "../../domain/rules/legalWindow";
import { deriveConditionBucketKey } from "../../domain/rules/conditionBucket";
import { calibrateConfidence, computeDistancePrior } from "../../domain/rules/confidence";

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
            const { prior, wellClear } = computeDistancePrior(conditions);

            const [historicalStats, todaysReports] = await Promise.all([
              reportRepository.getBucketStats(beach.id, bucketKey, dailyForecast.date),
              reportRepository.getTodaysReports(beach.id, dailyForecast.date, hour),
            ]);

            const confidence = calibrateConfidence({ distancePrior: prior, wellClear, historicalStats, todaysReports });

            return {
              hour,
              flagColor: assessment.flagColor,
              ripCurrentRisk: assessment.ripCurrentRisk,
              forecast: { ...reading, stormWarningActive },
              confidence,
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
