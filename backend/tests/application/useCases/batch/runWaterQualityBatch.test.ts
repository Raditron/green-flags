import { describe, expect, it } from "vitest";
import { runWaterQualityBatch } from "../../../../src/application/useCases/batch/runWaterQualityBatch";
import { Beach } from "../../../../src/domain/ports/beach/beachRepository";
import { WaterQualityProvider } from "../../../../src/domain/ports/batch/waterQualityProvider";
import { WaterQualityRating } from "../../../../src/domain/rules/evaluateWaterQualityRating";
import { WaterQualitySample } from "../../../../src/domain/waterQualitySample";

const BEACHES: Beach[] = [
  { id: "beach-a", name: "Beach A", lat: 43.2, long: 27.9, onshoreWindDirectionDeg: 90 },
  { id: "beach-b", name: "Beach B", lat: 42.5, long: 27.5, onshoreWindDirectionDeg: 90 },
];

function buildFakeBeachRepository(beaches: Beach[]) {
  const updated: Array<{ beachId: string; rating: WaterQualityRating }> = [];
  return {
    updated,
    listBeaches: async () => beaches,
    findBeachById: async (id: string) => beaches.find((beach) => beach.id === id) ?? null,
    updateWaterQualityRating: async (beachId: string, rating: WaterQualityRating) => {
      updated.push({ beachId, rating });
    },
  };
}

const CLEAN_SAMPLE: WaterQualitySample = {
  sampleDate: "2026-08-18",
  intestinalEnterococci: { value: 10, belowDetectionLimit: false },
  eColi: { value: 10, belowDetectionLimit: false },
};

describe("runWaterQualityBatch", () => {
  it("persists a computed rating for every beach with a sample, and skips beaches with none", async () => {
    const beachRepository = buildFakeBeachRepository(BEACHES);
    const waterQualityProvider: WaterQualityProvider = {
      fetchLatestSample: async (beachId) => (beachId === "beach-a" ? CLEAN_SAMPLE : null),
    };

    const result = await runWaterQualityBatch({ beachRepository, waterQualityProvider });

    expect(result).toEqual({ beachesProcessed: 2, failures: [] });
    expect(beachRepository.updated).toEqual([
      { beachId: "beach-a", rating: { band: "excellent", sampleDate: "2026-08-18" } },
    ]);
  });

  it("isolates a per-beach provider failure: other beaches still process and the failure is reported", async () => {
    const beachRepository = buildFakeBeachRepository(BEACHES);
    const waterQualityProvider: WaterQualityProvider = {
      fetchLatestSample: async (beachId) => {
        if (beachId === "beach-a") throw new Error("RZI Varna PDF request failed with status 500");
        return CLEAN_SAMPLE;
      },
    };

    const result = await runWaterQualityBatch({ beachRepository, waterQualityProvider });

    expect(result.beachesProcessed).toBe(1);
    expect(result.failures).toEqual([
      expect.objectContaining({ beachId: "beach-a", message: expect.stringContaining("500") }),
    ]);
    expect(beachRepository.updated).toEqual([
      { beachId: "beach-b", rating: { band: "excellent", sampleDate: "2026-08-18" } },
    ]);
  });
});
