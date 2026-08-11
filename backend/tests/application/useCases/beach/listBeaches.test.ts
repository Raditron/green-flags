import { describe, expect, it } from "vitest";
import { listBeaches } from "../../../../src/application/useCases/beach/listBeaches";
import { Beach, BeachAreas, BeachRepository } from "../../../../src/domain/ports/beach/beachRepository";
import { BeachDailyPredictions, PredictionRepository } from "../../../../src/domain/ports/prediction/predictionRepository";
import { currentOrNearestLegalHour, todayInSofia } from "../../../../src/domain/shared/today";

const NOW = new Date("2026-08-11T12:00:00Z");
const DATE = todayInSofia(NOW);
const HOUR = currentOrNearestLegalHour(NOW);

const BEACH_A: Beach = {
  id: "beach-a",
  name: "Beach A",
  lat: 0,
  long: 0,
  onshoreWindDirectionDeg: 75,
  area: BeachAreas.Varna,
  isUnguarded: false,
};

const BEACH_B: Beach = {
  id: "beach-b",
  name: "Beach B",
  lat: 0,
  long: 0,
  onshoreWindDirectionDeg: 75,
  area: BeachAreas.Burgas,
  isUnguarded: false,
};

function buildFakeBeachRepository(overrides: Partial<BeachRepository> = {}): BeachRepository {
  return {
    listBeaches: async () => [BEACH_A, BEACH_B],
    findBeachById: async (beachId) => [BEACH_A, BEACH_B].find((beach) => beach.id === beachId) ?? null,
    ...overrides,
  };
}

function buildFakePredictionRepository(overrides: Partial<PredictionRepository> = {}): PredictionRepository {
  return {
    saveDailyPredictions: async () => {},
    findByBeachAndDate: async () => null,
    getDailyPredictions: async () => null,
    ...overrides,
  };
}

function dailyPredictions(beachId: string): BeachDailyPredictions {
  return {
    beachId,
    date: DATE,
    hourlyPredictions: [
      {
        hour: HOUR,
        flagColor: "green",
        ripCurrentRisk: "low",
        forecast: {
          windSpeedMps: 3,
          windDirectionDeg: 90,
          waveHeightM: 0.2,
          wavePeriodS: 5,
          stormWarningActive: false,
        },
        confidence: { percent: 90, basis: "prior", sampleSize: 0 },
        readableWindSpeed: "gentle breeze",
        readableSeaState: "calm",
      },
    ],
    computedAt: NOW,
  } as BeachDailyPredictions;
}

describe("listBeaches", () => {
  it("returns every beach with today's current-hour report absent when no prediction has been persisted", async () => {
    const summaries = await listBeaches(buildFakeBeachRepository(), buildFakePredictionRepository(), NOW);

    expect(summaries.map((summary) => summary.id)).toEqual(["beach-a", "beach-b"]);
    expect(summaries.every((summary) => summary.currentFlagColor === undefined)).toBe(true);
  });

  it("enriches each beach with its own today/current-hour flag color and confidence", async () => {
    const summaries = await listBeaches(
      buildFakeBeachRepository(),
      buildFakePredictionRepository({
        findByBeachAndDate: async (beachId, date) => (date === DATE ? dailyPredictions(beachId) : null),
      }),
      NOW
    );

    expect(summaries).toEqual([
      expect.objectContaining({ id: "beach-a", currentFlagColor: "green", currentConfidencePercent: 90 }),
      expect.objectContaining({ id: "beach-b", currentFlagColor: "green", currentConfidencePercent: 90 }),
    ]);
  });
});
