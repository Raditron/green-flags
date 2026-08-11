import { describe, expect, it } from "vitest";
import { buildBeachSummary } from "../../../../src/application/useCases/beach/buildBeachSummary";
import { Beach, BeachAreas } from "../../../../src/domain/ports/beach/beachRepository";
import { BeachDailyPredictions, PredictionRepository } from "../../../../src/domain/ports/prediction/predictionRepository";

const DATE = "2026-08-11";
const HOUR = 12;

const BEACH: Beach = {
  id: "beach-a",
  name: "Beach A",
  lat: 43.2,
  long: 27.9,
  quirkNotes: "Bay-sheltered",
  onshoreWindDirectionDeg: 75,
  area: BeachAreas.Varna,
  isUnguarded: false,
};

function buildFakePredictionRepository(overrides: Partial<PredictionRepository> = {}): PredictionRepository {
  return {
    saveDailyPredictions: async () => {},
    findByBeachAndDate: async () => null,
    getDailyPredictions: async () => null,
    ...overrides,
  };
}

function dailyPredictions(hour: number): BeachDailyPredictions {
  return {
    beachId: BEACH.id,
    date: DATE,
    hourlyPredictions: [
      {
        hour,
        flagColor: "yellow",
        ripCurrentRisk: "moderate",
        forecast: {
          windSpeedMps: 8,
          windDirectionDeg: 90,
          waveHeightM: 0.6,
          wavePeriodS: 6,
          stormWarningActive: false,
        },
        confidence: { percent: 76, basis: "prior", sampleSize: 0 },
        readableWindSpeed: "moderate breeze",
        readableSeaState: "slight",
      },
    ],
    computedAt: new Date(),
  } as BeachDailyPredictions;
}

describe("buildBeachSummary", () => {
  it("leaves currentFlagColor and currentConfidencePercent undefined when no predictions exist for the date", async () => {
    const summary = await buildBeachSummary(BEACH, buildFakePredictionRepository(), DATE, HOUR);

    expect(summary.currentFlagColor).toBeUndefined();
    expect(summary.currentConfidencePercent).toBeUndefined();
  });

  it("resolves the current-hour prediction's flag color and confidence when one exists for that hour", async () => {
    const summary = await buildBeachSummary(
      BEACH,
      buildFakePredictionRepository({
        findByBeachAndDate: async (beachId, date) =>
          beachId === BEACH.id && date === DATE ? dailyPredictions(HOUR) : null,
      }),
      DATE,
      HOUR
    );

    expect(summary.currentFlagColor).toBe("yellow");
    expect(summary.currentConfidencePercent).toBe(76);
  });

  it("leaves currentFlagColor undefined when predictions exist for the date but not for the requested hour", async () => {
    const summary = await buildBeachSummary(
      BEACH,
      buildFakePredictionRepository({
        findByBeachAndDate: async () => dailyPredictions(HOUR + 1),
      }),
      DATE,
      HOUR
    );

    expect(summary.currentFlagColor).toBeUndefined();
    expect(summary.currentConfidencePercent).toBeUndefined();
  });

  it("carries over the beach's id, name, coordinates, area, and unguarded flag unchanged", async () => {
    const summary = await buildBeachSummary(BEACH, buildFakePredictionRepository(), DATE, HOUR);

    expect(summary).toMatchObject({
      id: BEACH.id,
      name: BEACH.name,
      lat: BEACH.lat,
      long: BEACH.long,
      quirkNotes: BEACH.quirkNotes,
      area: BEACH.area,
      isUnguarded: BEACH.isUnguarded,
    });
  });

  it("converts a beach's mapImage buffer into a displayable data URL", async () => {
    const summary = await buildBeachSummary(
      { ...BEACH, mapImage: { data: Buffer.from("fake-image-bytes"), contentType: "image/png" } },
      buildFakePredictionRepository(),
      DATE,
      HOUR
    );

    expect(summary.mapImageDataUrl).toBe(
      `data:image/png;base64,${Buffer.from("fake-image-bytes").toString("base64")}`
    );
  });

  it("leaves mapImageDataUrl undefined when the beach has no map image", async () => {
    const summary = await buildBeachSummary(BEACH, buildFakePredictionRepository(), DATE, HOUR);

    expect(summary.mapImageDataUrl).toBeUndefined();
  });
});
