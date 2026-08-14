import { describe, expect, it } from "vitest";
import { reconcileClosedPredictions } from "../../../../src/application/useCases/batch/reconcilePredictions";
import { BeachDailyPredictions, HourlyPrediction, PredictionRepository } from "../../../../src/domain/ports/prediction/predictionRepository";
import { SelfConsistencyOutcome, SelfConsistencyRepository } from "../../../../src/domain/ports/prediction/selfConsistencyRepository";
import { FlagColor } from "../../../../src/domain/rules/evaluateHourlyFlag";

const TARGET_DATE = "2026-08-12";

function makeHourlyPrediction(hour: number, flagColor: FlagColor, windSpeedMps = 2): HourlyPrediction {
  return {
    hour,
    flagColor,
    ripCurrentRisk: "low",
    forecast: { windSpeedMps, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3, stormWarningActive: false },
    confidence: { percent: 80, basis: "prior", sampleSize: 0 },
    readableWindSpeed: "light air",
    readableSeaState: "calm",
  };
}

function makePrediction(overrides: Partial<BeachDailyPredictions> & Pick<BeachDailyPredictions, "issuedDate" | "hourlyPredictions">): BeachDailyPredictions {
  return { beachId: "beach-a", date: TARGET_DATE, ...overrides };
}

function buildFakePredictionRepository(predictions: BeachDailyPredictions[]): PredictionRepository {
  return {
    saveDailyPredictions: async () => {},
    findByBeachAndDate: async () => null,
    getDailyPredictions: async () => null,
    getIssuedPredictionsForTargetDate: async () => predictions,
  };
}

function buildFakeSelfConsistencyRepository(): SelfConsistencyRepository & { recorded: SelfConsistencyOutcome[][] } {
  const recorded: SelfConsistencyOutcome[][] = [];
  return {
    recorded,
    getStats: async () => ({ hits: 0, total: 0 }),
    recordOutcomes: async (outcomes) => {
      recorded.push(outcomes);
    },
  };
}

describe("reconcileClosedPredictions", () => {
  it("grades an older-Lead Prediction as a hit when it agrees with the near-tier verdict for the same hour", async () => {
    const verdict = makePrediction({ issuedDate: TARGET_DATE, hourlyPredictions: [makeHourlyPrediction(12, "green")] });
    const candidate = makePrediction({ issuedDate: "2026-08-10", hourlyPredictions: [makeHourlyPrediction(12, "green")] });
    const predictionRepository = buildFakePredictionRepository([verdict, candidate]);
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, TARGET_DATE);

    expect(selfConsistencyRepository.recorded).toHaveLength(1);
    expect(selfConsistencyRepository.recorded[0]).toEqual([
      { bucketKey: expect.any(String), leadTier: "mid", hit: true },
    ]);
  });

  it("grades an older-Lead Prediction as a miss when it disagrees with the near-tier verdict", async () => {
    const verdict = makePrediction({ issuedDate: TARGET_DATE, hourlyPredictions: [makeHourlyPrediction(12, "red")] });
    const candidate = makePrediction({ issuedDate: "2026-08-11", hourlyPredictions: [makeHourlyPrediction(12, "green")] });
    const predictionRepository = buildFakePredictionRepository([verdict, candidate]);
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, TARGET_DATE);

    expect(selfConsistencyRepository.recorded[0]).toEqual([
      { bucketKey: expect.any(String), leadTier: "near", hit: false },
    ]);
  });

  it("never grades the verdict Prediction against itself", async () => {
    const verdict = makePrediction({ issuedDate: TARGET_DATE, hourlyPredictions: [makeHourlyPrediction(12, "green")] });
    const predictionRepository = buildFakePredictionRepository([verdict]);
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, TARGET_DATE);

    expect(selfConsistencyRepository.recorded).toHaveLength(0);
  });

  it("does nothing for a beach with no near-tier verdict yet to grade against", async () => {
    const candidate = makePrediction({ issuedDate: "2026-08-06", hourlyPredictions: [makeHourlyPrediction(12, "green")] });
    const predictionRepository = buildFakePredictionRepository([candidate]);
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, TARGET_DATE);

    expect(selfConsistencyRepository.recorded).toHaveLength(0);
  });

  it("grades every beach's Predictions independently", async () => {
    const predictions: BeachDailyPredictions[] = [
      makePrediction({ beachId: "beach-a", issuedDate: TARGET_DATE, hourlyPredictions: [makeHourlyPrediction(12, "green")] }),
      makePrediction({ beachId: "beach-a", issuedDate: "2026-08-09", hourlyPredictions: [makeHourlyPrediction(12, "green")] }),
      makePrediction({ beachId: "beach-b", issuedDate: TARGET_DATE, hourlyPredictions: [makeHourlyPrediction(12, "red")] }),
      makePrediction({ beachId: "beach-b", issuedDate: "2026-08-09", hourlyPredictions: [makeHourlyPrediction(12, "red")] }),
    ];
    const predictionRepository = buildFakePredictionRepository(predictions);
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, TARGET_DATE);

    const outcomes = selfConsistencyRepository.recorded.flat();
    expect(outcomes).toHaveLength(2);
    expect(outcomes.every((outcome) => outcome.hit)).toBe(true);
  });

  it("derives the Lead Tier from issuedDate vs targetDate for each candidate independently", async () => {
    const verdict = makePrediction({ issuedDate: TARGET_DATE, hourlyPredictions: [makeHourlyPrediction(9, "green"), makeHourlyPrediction(18, "green")] });
    const nearMiss = makePrediction({ issuedDate: "2026-08-11", hourlyPredictions: [makeHourlyPrediction(9, "green")] }); // Lead 1 -> near
    const farMiss = makePrediction({ issuedDate: "2026-08-06", hourlyPredictions: [makeHourlyPrediction(18, "green")] }); // Lead 6 -> far
    const predictionRepository = buildFakePredictionRepository([verdict, nearMiss, farMiss]);
    const selfConsistencyRepository = buildFakeSelfConsistencyRepository();

    await reconcileClosedPredictions(predictionRepository, selfConsistencyRepository, TARGET_DATE);

    const outcomes = selfConsistencyRepository.recorded.flat();
    expect(outcomes.map((outcome) => outcome.leadTier).sort()).toEqual(["far", "near"]);
  });
});
