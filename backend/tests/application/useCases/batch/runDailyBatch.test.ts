import { describe, expect, it } from "vitest";
import { runDailyBatch } from "../../../../src/application/useCases/batch/runDailyBatch";
import { Beach } from "../../../../src/domain/ports/beach/beachRepository";
import { DailyForecast, ForecastProvider } from "../../../../src/domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../../../src/domain/ports/batch/stormWarningProvider";
import { BeachDailyPredictions, PredictionRepository } from "../../../../src/domain/ports/prediction/predictionRepository";
import { SelfConsistencyRepository } from "../../../../src/domain/ports/prediction/selfConsistencyRepository";
import { ReportRepository } from "../../../../src/domain/ports/report/reportRepository";
import { LeadTier } from "../../../../src/domain/rules/lead";

const BEACHES: Beach[] = [
  { id: "beach-a", name: "Beach A", lat: 43.2, long: 27.9, onshoreWindDirectionDeg: 90 },
  { id: "beach-b", name: "Beach B", lat: 42.5, long: 27.5, onshoreWindDirectionDeg: 90 },
];

const ISSUED_DATE = "2026-08-05";
const NOW = new Date("2026-08-05T12:00:00Z");

function makeFullDayForecast(date: string): DailyForecast {
  return {
    date,
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      windSpeedMps: 2,
      windDirectionDeg: 0,
      waveHeightM: 0.1,
      wavePeriodS: 3,
    })),
  };
}

function buildFakeBeachRepository(beaches: Beach[]) {
  return { listBeaches: async () => beaches };
}

function buildFakeReportRepository(overrides: Partial<ReportRepository> = {}): ReportRepository {
  return {
    getBucketStats: async () => ({ hits: 0, total: 0 }),
    getTodaysReports: async () => ({ agree: 0, total: 0 }),
    getTodaysReport: async () => null,
    recordReport: async () => {},
    ...overrides,
  };
}

function buildFakePredictionRepository(overrides: Partial<PredictionRepository> = {}): PredictionRepository & { saved: BeachDailyPredictions[] } {
  const saved: BeachDailyPredictions[] = [];
  return {
    saved,
    saveDailyPredictions: async (predictions) => {
      saved.push(predictions);
    },
    findByBeachAndDate: async () => null,
    getDailyPredictions: async () => null,
    getIssuedPredictionsForTargetDate: async () => [],
    ...overrides,
  };
}

function buildFakeSelfConsistencyRepository(overrides: Partial<SelfConsistencyRepository> = {}): SelfConsistencyRepository & { statsCalls: LeadTier[] } {
  const statsCalls: LeadTier[] = [];
  return {
    statsCalls,
    getStats: async (_bucketKey, leadTier) => {
      statsCalls.push(leadTier);
      return { hits: 0, total: 0 };
    },
    recordOutcomes: async () => {},
    ...overrides,
  };
}

describe("runDailyBatch", () => {
  it("evaluates only hours within the legal window (09:00-18:00) and persists them per beach", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [makeFullDayForecast(ISSUED_DATE)],
    };
    const stormWarningProvider: StormWarningProvider = {
      checkActiveStormWarning: async () => false,
    };
    const predictionRepository = buildFakePredictionRepository();

    const result = await runDailyBatch({
      beachRepository: buildFakeBeachRepository(BEACHES),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    expect(result.beachesProcessed).toBe(2);
    expect(predictionRepository.saved).toHaveLength(2);
    expect(predictionRepository.saved[0].beachId).toBe("beach-a");
    expect(predictionRepository.saved[0].date).toBe("2026-08-05");
    expect(predictionRepository.saved[0].issuedDate).toBe(ISSUED_DATE);
    expect(predictionRepository.saved[0].hourlyPredictions.map((p) => p.hour)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });

  it("computes flag color and rip current risk per hour from that hour's forecast", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [
        {
          date: "2026-08-05",
          hours: [
            { hour: 9, windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 },
            { hour: 10, windSpeedMps: 12, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 },
          ],
        },
      ],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    const [calm, stormy] = predictionRepository.saved[0].hourlyPredictions;
    expect(calm.flagColor).toBe("green");
    expect(stormy.flagColor).toBe("red");
    expect(stormy.forecast.windSpeedMps).toBe(12);
  });

  it("folds an active storm warning into every hour and every beach", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [makeFullDayForecast("2026-08-05")],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => true };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository(BEACHES),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    for (const beachPredictions of predictionRepository.saved) {
      for (const prediction of beachPredictions.hourlyPredictions) {
        expect(prediction.flagColor).toBe("red");
        expect(prediction.forecast.stormWarningActive).toBe(true);
      }
    }
  });

  it("skips hours the forecast provider didn't return, rather than failing the whole run", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [
        { date: "2026-08-05", hours: [{ hour: 9, windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 }] },
      ],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    expect(predictionRepository.saved[0].hourlyPredictions).toHaveLength(1);
  });

  it("isolates a per-beach failure: other beaches still get processed and the failure is reported", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async (coordinates) => {
        if (coordinates.lat === BEACHES[0].lat) {
          throw new Error("upstream forecast API timed out");
        }
        return [makeFullDayForecast("2026-08-05")];
      },
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    const result = await runDailyBatch({
      beachRepository: buildFakeBeachRepository(BEACHES),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    expect(result.beachesProcessed).toBe(1);
    expect(result.failures).toEqual([{ beachId: "beach-a", message: "upstream forecast API timed out" }]);
    expect(predictionRepository.saved).toHaveLength(1);
    expect(predictionRepository.saved[0].beachId).toBe("beach-b");
  });

  it("attaches a 'certain' confidence to calm hours that are well clear of every threshold", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [makeFullDayForecast("2026-08-05")],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    for (const prediction of predictionRepository.saved[0].hourlyPredictions) {
      expect(prediction.confidence.basis).toBe("certain");
    }
  });

  it("attaches a 'prior' confidence to borderline hours when the bucket has no feedback history", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [
        { date: "2026-08-05", hours: [{ hour: 10, windSpeedMps: 12, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 }] },
      ],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    expect(predictionRepository.saved[0].hourlyPredictions[0].confidence.basis).toBe("prior");
  });

  it("attaches a 'blended' confidence to borderline hours when the report repository has feedback data", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [
        { date: "2026-08-05", hours: [{ hour: 10, windSpeedMps: 12, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 }] },
      ],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository({
        getBucketStats: async () => ({ hits: 8, total: 10 }),
        getTodaysReports: async () => ({ agree: 2, total: 2 }),
      }),
      now: NOW,
    });

    expect(predictionRepository.saved[0].hourlyPredictions[0].confidence.basis).toBe("blended");
    expect(predictionRepository.saved[0].hourlyPredictions[0].confidence.sampleSize).toBe(12);
  });

  it("issues one Prediction per date in the forecast window, all stamped with today's issuedDate", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [
        makeFullDayForecast("2026-08-05"),
        makeFullDayForecast("2026-08-06"),
        makeFullDayForecast("2026-08-11"),
      ],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    expect(predictionRepository.saved).toHaveLength(3);
    expect(predictionRepository.saved.map((p) => p.date)).toEqual(["2026-08-05", "2026-08-06", "2026-08-11"]);
    expect(predictionRepository.saved.every((p) => p.issuedDate === ISSUED_DATE)).toBe(true);
  });

  it("uses the self-consistency track record (not report history) for mid/far-Lead dates in the window", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [
        makeFullDayForecast("2026-08-05"), // Lead 0 -> near
        makeFullDayForecast("2026-08-08"), // Lead 3 -> mid
        makeFullDayForecast("2026-08-11"), // Lead 6 -> far
      ],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const predictionRepository = buildFakePredictionRepository();
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository,
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    // The near-tier date never touches self-consistency; the mid/far-tier dates do, once per hour.
    expect(selfConsistencyRepository.statsCalls.filter((tier) => tier === "near")).toHaveLength(0);
    expect(selfConsistencyRepository.statsCalls.filter((tier) => tier === "mid").length).toBeGreaterThan(0);
    expect(selfConsistencyRepository.statsCalls.filter((tier) => tier === "far").length).toBeGreaterThan(0);
  });

  it("reconciles yesterday's closed-out Predictions before issuing any new ones", async () => {
    const forecastProvider: ForecastProvider = {
      fetchForecastWindow: async () => [makeFullDayForecast("2026-08-05")],
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const reconciliationCalls: string[] = [];
    const predictionRepository = buildFakePredictionRepository({
      getIssuedPredictionsForTargetDate: async (date) => {
        reconciliationCalls.push(date);
        return [];
      },
    });

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      selfConsistencyRepository: buildFakeSelfConsistencyRepository(),
      reportRepository: buildFakeReportRepository(),
      now: NOW,
    });

    expect(reconciliationCalls).toEqual(["2026-08-04"]);
  });
});
