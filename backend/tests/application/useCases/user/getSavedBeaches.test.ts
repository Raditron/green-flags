import { describe, expect, it } from "vitest";
import { getSavedBeaches } from "../../../../src/application/useCases/user/getSavedBeaches";
import { Beach, BeachAreas, BeachRepository } from "../../../../src/domain/ports/beach/beachRepository";
import { BeachDailyPredictions, PredictionRepository } from "../../../../src/domain/ports/prediction/predictionRepository";
import { UserRepository } from "../../../../src/domain/ports/user/userRepository";
import { currentOrNearestLegalHour, todayInSofia } from "../../../../src/domain/shared/today";

const UID = "uid-1";
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

function buildFakeUserRepository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findOrCreate: async (uid, emailVerified) => ({ uid, emailVerified, savedBeaches: [] }),
    getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: [] }),
    update: async (uid, changes) => ({ uid, emailVerified: true, savedBeaches: [], ...changes }),
    ...overrides,
  };
}

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
        flagColor: "red",
        ripCurrentRisk: "high",
        forecast: {
          windSpeedMps: 14,
          windDirectionDeg: 90,
          waveHeightM: 1.4,
          wavePeriodS: 7,
          stormWarningActive: false,
        },
        confidence: { percent: 82, basis: "prior", sampleSize: 0 },
        readableWindSpeed: "strong breeze",
        readableSeaState: "rough",
      },
    ],
    computedAt: NOW,
  } as BeachDailyPredictions;
}

describe("getSavedBeaches", () => {
  it("resolves the user's saved beach ids to enriched beach summaries, in order", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["beach-b", "beach-a"] }),
      }),
      buildFakeBeachRepository(),
      buildFakePredictionRepository(),
      UID,
      NOW,
    );

    expect(beaches.map((beach) => beach.id)).toEqual(["beach-b", "beach-a"]);
  });

  it("returns an empty list for a user with no saved beaches", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository(),
      buildFakeBeachRepository(),
      buildFakePredictionRepository(),
      UID,
      NOW,
    );

    expect(beaches).toEqual([]);
  });

  it("silently drops saved ids that no longer resolve to a beach", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["beach-a", "deleted-beach"] }),
      }),
      buildFakeBeachRepository(),
      buildFakePredictionRepository(),
      UID,
      NOW,
    );

    expect(beaches.map((beach) => beach.id)).toEqual(["beach-a"]);
  });

  it("enriches each saved beach with today's current-hour flag color and confidence, like listBeaches does", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["beach-a"] }),
      }),
      buildFakeBeachRepository(),
      buildFakePredictionRepository({
        findByBeachAndDate: async (beachId, date) => (date === DATE ? dailyPredictions(beachId) : null),
      }),
      UID,
      NOW,
    );

    expect(beaches).toEqual([
      expect.objectContaining({ id: "beach-a", currentFlagColor: "red", currentConfidencePercent: 82 }),
    ]);
  });

  it("leaves currentFlagColor and currentConfidencePercent undefined when today's batch hasn't run yet", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["beach-a"] }),
      }),
      buildFakeBeachRepository(),
      buildFakePredictionRepository(),
      UID,
      NOW,
    );

    expect(beaches[0].currentFlagColor).toBeUndefined();
    expect(beaches[0].currentConfidencePercent).toBeUndefined();
  });
});
