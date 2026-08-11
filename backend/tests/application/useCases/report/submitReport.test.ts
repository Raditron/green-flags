import { describe, expect, it } from "vitest";
import {
  BeachUnguardedError,
  NoPredictionAvailableError,
  OutsideSeasonError,
  OutsideWindowError,
  submitReport,
} from "../../../../src/application/useCases/report/submitReport";
import { Beach, BeachAreas, BeachRepository } from "../../../../src/domain/ports/beach/beachRepository";
import { BeachDailyPredictions, PredictionRepository } from "../../../../src/domain/ports/prediction/predictionRepository";
import { DuplicateReportError, ReportInput, ReportRepository } from "../../../../src/domain/ports/report/reportRepository";

const BEACH_ID = "beach-a";
const USER_ID = "uid-1";
const IN_SEASON_IN_WINDOW = new Date("2026-08-05T12:00:00Z"); // 15:00 Sofia

const GUARDED_BEACH: Beach = {
  id: BEACH_ID,
  name: "Beach A",
  lat: 0,
  long: 0,
  onshoreWindDirectionDeg: 75,
  area: BeachAreas.Varna,
  isUnguarded: false,
};

const CALM_PREDICTION: BeachDailyPredictions = {
  beachId: BEACH_ID,
  date: "2026-08-05",
  hourlyPredictions: [
    {
      hour: 15,
      flagColor: "green",
      ripCurrentRisk: "low",
      forecast: { windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3, stormWarningActive: false },
      confidence: { percent: 98, basis: "certain", sampleSize: 0 },
    },
  ],
};

// Borderline (not well-clear of a threshold) so calibrateConfidence actually blends in feedback,
// rather than short-circuiting to "certain" the way CALM_PREDICTION's well-clear conditions do.
const BORDERLINE_PREDICTION: BeachDailyPredictions = {
  beachId: BEACH_ID,
  date: "2026-08-05",
  hourlyPredictions: [
    {
      hour: 15,
      flagColor: "yellow",
      ripCurrentRisk: "low",
      forecast: { windSpeedMps: 4.4, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3, stormWarningActive: false },
      confidence: { percent: 70, basis: "prior", sampleSize: 0 },
    },
  ],
};

function buildFakeBeachRepository(overrides: Partial<BeachRepository> = {}): BeachRepository {
  return {
    listBeaches: async () => [GUARDED_BEACH],
    ...overrides,
  };
}

function buildFakePredictionRepository(overrides: Partial<PredictionRepository> = {}): PredictionRepository {
  return {
    saveDailyPredictions: async () => {},
    findByBeachAndDate: async () => CALM_PREDICTION,
    ...overrides,
  };
}

function buildFakeReportRepository(overrides: Partial<ReportRepository> = {}): ReportRepository {
  return {
    getBucketStats: async () => ({ hits: 0, total: 0 }),
    getTodaysReports: async () => ({ agree: 0, total: 0 }),
    hasReportedToday: async () => false,
    recordReport: async () => {},
    ...overrides,
  };
}

describe("submitReport", () => {
  it("records the report and reports whether it agreed with the rule engine's call", async () => {
    const recorded: ReportInput[] = [];
    const result = await submitReport(
      buildFakeBeachRepository(),
      buildFakePredictionRepository(),
      buildFakeReportRepository({
        recordReport: async (report) => {
          recorded.push(report);
        },
      }),
      { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: IN_SEASON_IN_WINDOW }
    );

    expect(result.agreesWithPrediction).toBe(true);
    expect(recorded).toEqual([
      {
        beachId: BEACH_ID,
        userId: USER_ID,
        date: "2026-08-05",
        hour: 15,
        bucketKey: "beaufort-2_douglas-1",
        agreesWithPrediction: true,
      },
    ]);
  });

  it("marks disagreement when the reported color differs from the rule engine's call", async () => {
    const result = await submitReport(buildFakeBeachRepository(), buildFakePredictionRepository(), buildFakeReportRepository(), {
      beachId: BEACH_ID,
      userId: USER_ID,
      flagColor: "red",
      now: IN_SEASON_IN_WINDOW,
    });

    expect(result.agreesWithPrediction).toBe(false);
  });

  it("re-blends and persists the hour's confidence using freshly-recorded today's reports", async () => {
    const saved: BeachDailyPredictions[] = [];
    await submitReport(
      buildFakeBeachRepository(),
      buildFakePredictionRepository({
        findByBeachAndDate: async () => BORDERLINE_PREDICTION,
        saveDailyPredictions: async (predictions) => {
          saved.push(predictions);
        },
      }),
      buildFakeReportRepository({
        getBucketStats: async () => ({ hits: 8, total: 10 }),
        getTodaysReports: async () => ({ agree: 1, total: 1 }),
      }),
      { beachId: BEACH_ID, userId: USER_ID, flagColor: "yellow", now: IN_SEASON_IN_WINDOW }
    );

    expect(saved).toHaveLength(1);
    expect(saved[0].hourlyPredictions[0].confidence.basis).toBe("blended");
    expect(saved[0].hourlyPredictions[0].confidence.sampleSize).toBe(11);
    // Every other hour's prediction (and the rest of the hour's own fields) survive the update untouched.
    expect(saved[0].hourlyPredictions[0].flagColor).toBe("yellow");
  });

  it("throws BeachUnguardedError for a beach with no lifeguard coverage, without recording a report", async () => {
    const recorded: ReportInput[] = [];
    await expect(
      submitReport(
        buildFakeBeachRepository({ listBeaches: async () => [{ ...GUARDED_BEACH, isUnguarded: true }] }),
        buildFakePredictionRepository(),
        buildFakeReportRepository({
          recordReport: async (report) => {
            recorded.push(report);
          },
        }),
        { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: IN_SEASON_IN_WINDOW }
      )
    ).rejects.toBeInstanceOf(BeachUnguardedError);
    expect(recorded).toHaveLength(0);
  });

  it("treats a beachId absent from the repository as guarded rather than rejecting it", async () => {
    const result = await submitReport(
      buildFakeBeachRepository({ listBeaches: async () => [] }),
      buildFakePredictionRepository(),
      buildFakeReportRepository(),
      { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: IN_SEASON_IN_WINDOW }
    );

    expect(result.agreesWithPrediction).toBe(true);
  });

  it("throws OutsideSeasonError outside June-September, without recording a report", async () => {
    const recorded: ReportInput[] = [];
    await expect(
      submitReport(
        buildFakeBeachRepository(),
        buildFakePredictionRepository(),
        buildFakeReportRepository({
          recordReport: async (report) => {
            recorded.push(report);
          },
        }),
        { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: new Date("2026-11-05T12:00:00Z") }
      )
    ).rejects.toBeInstanceOf(OutsideSeasonError);
    expect(recorded).toHaveLength(0);
  });

  it("throws OutsideWindowError outside 09:00-18:30 within season, without recording a report", async () => {
    const recorded: ReportInput[] = [];
    await expect(
      submitReport(
        buildFakeBeachRepository(),
        buildFakePredictionRepository(),
        buildFakeReportRepository({
          recordReport: async (report) => {
            recorded.push(report);
          },
        }),
        { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: new Date("2026-08-05T04:00:00Z") } // 07:00 Sofia
      )
    ).rejects.toBeInstanceOf(OutsideWindowError);
    expect(recorded).toHaveLength(0);
  });

  it("throws NoPredictionAvailableError when no prediction has been persisted for this beach and date", async () => {
    await expect(
      submitReport(
        buildFakeBeachRepository(),
        buildFakePredictionRepository({ findByBeachAndDate: async () => null }),
        buildFakeReportRepository(),
        { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: IN_SEASON_IN_WINDOW }
      )
    ).rejects.toBeInstanceOf(NoPredictionAvailableError);
  });

  it("throws NoPredictionAvailableError when the prediction exists but has no entry for the current hour", async () => {
    await expect(
      submitReport(
        buildFakeBeachRepository(),
        buildFakePredictionRepository({
          findByBeachAndDate: async () => ({ ...CALM_PREDICTION, hourlyPredictions: [] }),
        }),
        buildFakeReportRepository(),
        { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: IN_SEASON_IN_WINDOW }
      )
    ).rejects.toBeInstanceOf(NoPredictionAvailableError);
  });

  it("propagates DuplicateReportError from the report repository as-is", async () => {
    await expect(
      submitReport(
        buildFakeBeachRepository(),
        buildFakePredictionRepository(),
        buildFakeReportRepository({
          recordReport: async () => {
            throw new DuplicateReportError();
          },
        }),
        { beachId: BEACH_ID, userId: USER_ID, flagColor: "green", now: IN_SEASON_IN_WINDOW }
      )
    ).rejects.toBeInstanceOf(DuplicateReportError);
  });
});
