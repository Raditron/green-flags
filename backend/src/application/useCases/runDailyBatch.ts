import { BeachRepository } from "../../domain/ports/beachRepository";
import { ForecastProvider } from "../../domain/ports/forecastProvider";
import { StormWarningProvider } from "../../domain/ports/stormWarningProvider";
import { HourlyPrediction, PredictionRepository } from "../../domain/ports/predictionRepository";
import { evaluateHourlyFlag } from "../../domain/rules/evaluateHourlyFlag";
import { isWithinLegalWindow } from "../../domain/rules/legalWindow";

export interface RunDailyBatchDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
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
  const { beachRepository, forecastProvider, stormWarningProvider, predictionRepository, now } = deps;

  const beaches = await beachRepository.listBeaches();
  const stormWarningActive = await stormWarningProvider.checkActiveStormWarning(now);

  let beachesProcessed = 0;
  const failures: BeachBatchFailure[] = [];

  for (const beach of beaches) {
    try {
      const dailyForecast = await forecastProvider.fetchDailyForecast(beach);

      const hourlyPredictions: HourlyPrediction[] = dailyForecast.hours
        .filter((hourlyForecast) => isWithinLegalWindow(hourlyForecast.hour))
        .map((hourlyForecast) => {
          const { hour, ...reading } = hourlyForecast;
          const assessment = evaluateHourlyFlag({
            ...reading,
            onshoreWindDirectionDeg: beach.onshoreWindDirectionDeg,
            stormWarningActive,
          });

          return {
            hour,
            flagColor: assessment.flagColor,
            ripCurrentRisk: assessment.ripCurrentRisk,
            forecast: { ...reading, stormWarningActive },
          };
        });

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
