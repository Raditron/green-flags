import { describe, expect, it } from "vitest";
import { runDailyBatch } from "../src/application/useCases/runDailyBatch";
import { Beach } from "../src/domain/ports/beachRepository";
import { DailyForecast, ForecastProvider } from "../src/domain/ports/forecastProvider";
import { StormWarningProvider } from "../src/domain/ports/stormWarningProvider";
import { BeachDailyPredictions, PredictionRepository } from "../src/domain/ports/predictionRepository";
import { ReportRepository } from "../src/domain/ports/reportRepository";

const BEACHES: Beach[] = [
  { id: "beach-a", name: "Beach A", lat: 43.2, long: 27.9, onshoreWindDirectionDeg: 90 },
  { id: "beach-b", name: "Beach B", lat: 42.5, long: 27.5, onshoreWindDirectionDeg: 90 },
];

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
    ...overrides,
  };
}

describe("runDailyBatch", () => {
  it("evaluates only hours within the legal window (09:00-18:00) and persists them per beach", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => makeFullDayForecast("2026-08-05"),
    };
    const stormWarningProvider: StormWarningProvider = {
      checkActiveStormWarning: async () => false,
    };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    const result = await runDailyBatch({
      beachRepository: buildFakeBeachRepository(BEACHES),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    expect(result.beachesProcessed).toBe(2);
    expect(saved).toHaveLength(2);
    expect(saved[0].beachId).toBe("beach-a");
    expect(saved[0].date).toBe("2026-08-05");
    expect(saved[0].hourlyPredictions.map((p) => p.hour)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });

  it("computes flag color and rip current risk per hour from that hour's forecast", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => ({
        date: "2026-08-05",
        hours: [
          { hour: 9, windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 },
          { hour: 10, windSpeedMps: 12, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 },
        ],
      }),
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    const [calm, stormy] = saved[0].hourlyPredictions;
    expect(calm.flagColor).toBe("green");
    expect(stormy.flagColor).toBe("red");
    expect(stormy.forecast.windSpeedMps).toBe(12);
  });

  it("folds an active storm warning into every hour and every beach", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => makeFullDayForecast("2026-08-05"),
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => true };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository(BEACHES),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    for (const beachPredictions of saved) {
      for (const prediction of beachPredictions.hourlyPredictions) {
        expect(prediction.flagColor).toBe("red");
        expect(prediction.forecast.stormWarningActive).toBe(true);
      }
    }
  });

  it("skips hours the forecast provider didn't return, rather than failing the whole run", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => ({
        date: "2026-08-05",
        hours: [{ hour: 9, windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 }],
      }),
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    expect(saved[0].hourlyPredictions).toHaveLength(1);
  });

  it("isolates a per-beach failure: other beaches still get processed and the failure is reported", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async (coordinates) => {
        if (coordinates.lat === BEACHES[0].lat) {
          throw new Error("upstream forecast API timed out");
        }
        return makeFullDayForecast("2026-08-05");
      },
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    const result = await runDailyBatch({
      beachRepository: buildFakeBeachRepository(BEACHES),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    expect(result.beachesProcessed).toBe(1);
    expect(result.failures).toEqual([{ beachId: "beach-a", message: "upstream forecast API timed out" }]);
    expect(saved).toHaveLength(1);
    expect(saved[0].beachId).toBe("beach-b");
  });

  it("attaches a 'certain' confidence to calm hours that are well clear of every threshold", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => makeFullDayForecast("2026-08-05"),
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    for (const prediction of saved[0].hourlyPredictions) {
      expect(prediction.confidence.basis).toBe("certain");
    }
  });

  it("attaches a 'prior' confidence to borderline hours when the bucket has no feedback history", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => ({
        date: "2026-08-05",
        hours: [{ hour: 10, windSpeedMps: 12, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 }],
      }),
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository(),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    expect(saved[0].hourlyPredictions[0].confidence.basis).toBe("prior");
  });

  it("attaches a 'blended' confidence to borderline hours when the report repository has feedback data", async () => {
    const forecastProvider: ForecastProvider = {
      fetchDailyForecast: async () => ({
        date: "2026-08-05",
        hours: [{ hour: 10, windSpeedMps: 12, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3 }],
      }),
    };
    const stormWarningProvider: StormWarningProvider = { checkActiveStormWarning: async () => false };
    const saved: BeachDailyPredictions[] = [];
    const predictionRepository: PredictionRepository = {
      saveDailyPredictions: async (predictions) => {
        saved.push(predictions);
      },
    };

    await runDailyBatch({
      beachRepository: buildFakeBeachRepository([BEACHES[0]]),
      forecastProvider,
      stormWarningProvider,
      predictionRepository,
      reportRepository: buildFakeReportRepository({
        getBucketStats: async () => ({ hits: 8, total: 10 }),
        getTodaysReports: async () => ({ agree: 2, total: 2 }),
      }),
      now: new Date("2026-08-05T12:00:00Z"),
    });

    expect(saved[0].hourlyPredictions[0].confidence.basis).toBe("blended");
    expect(saved[0].hourlyPredictions[0].confidence.sampleSize).toBe(12);
  });
});
