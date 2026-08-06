import { ForecastProvider } from "../../src/domain/ports/forecastProvider";
import { StormWarningProvider } from "../../src/domain/ports/stormWarningProvider";
import { PredictionRepository } from "../../src/domain/ports/predictionRepository";
import { ReportRepository } from "../../src/domain/ports/reportRepository";

/** Batch-related AppDependencies fields, stubbed out for tests (e.g. health/beaches) that don't exercise the batch route. */
export function stubBatchDependencies(): {
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
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
      findByBeachAndDate: async () => null,
    },
    reportRepository: {
      getBucketStats: async () => ({ hits: 0, total: 0 }),
      getTodaysReports: async () => ({ agree: 0, total: 0 }),
    },
    batchTriggerSecret: "test-batch-secret",
  };
}
