import { ForecastProvider } from "../../src/domain/ports/forecastProvider";
import { StormWarningProvider } from "../../src/domain/ports/stormWarningProvider";
import { PredictionRepository } from "../../src/domain/ports/predictionRepository";

/** Batch-related AppDependencies fields, stubbed out for tests (e.g. health/beaches) that don't exercise the batch route. */
export function stubBatchDependencies(): {
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  batchTriggerSecret: string;
} {
  return {
    forecastProvider: {
      fetchDailyForecast: async () => ({ date: "1970-01-01", hours: [] }),
    },
    stormWarningProvider: {
      checkActiveStormWarning: async () => false,
    },
    predictionRepository: {
      saveDailyPredictions: async () => {},
    },
    batchTriggerSecret: "test-batch-secret",
  };
}
