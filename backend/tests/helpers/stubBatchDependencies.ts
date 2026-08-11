import { ForecastProvider } from "../../src/domain/ports/forecastProvider";
import { StormWarningProvider } from "../../src/domain/ports/stormWarningProvider";
import { PredictionRepository } from "../../src/domain/ports/predictionRepository";
import { ReportRepository } from "../../src/domain/ports/reportRepository";
import { AuthTokenVerifier } from "../../src/domain/ports/authTokenVerifier";
import { UserRepository } from "../../src/domain/ports/userRepository";

/** Batch- and auth-related AppDependencies fields, stubbed out for tests (e.g. health/beaches) that don't exercise those routes. */
export function stubBatchDependencies(): {
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
  batchTriggerSecret: string;
  authTokenVerifier: AuthTokenVerifier;
  userRepository: UserRepository;
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
      getDailyPredictions: async () => null,
    },
    reportRepository: {
      getBucketStats: async () => ({ hits: 0, total: 0 }),
      getTodaysReports: async () => ({ agree: 0, total: 0 }),
      hasReportedToday: async () => false,
      recordReport: async () => {},
    },
    batchTriggerSecret: "test-batch-secret",
    authTokenVerifier: {
      verifyIdToken: async () => {
        throw new Error("not stubbed");
      },
    },
    userRepository: {
      findOrCreate: async (uid, emailVerified) => ({ uid, emailVerified, savedBeaches: [] }),
      getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: [] }),
      update: async (uid, changes) => ({ uid, emailVerified: true, savedBeaches: [], ...changes }),
    },
  };
}
