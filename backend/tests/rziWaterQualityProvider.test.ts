import { describe, expect, it, vi } from "vitest";
import { WaterQualitySample } from "../src/domain/waterQualitySample";
import { RziRegionClient } from "../src/infrastructure/rzi/rziRegionClient";
import { mergeZoneSamples, RziWaterQualityProvider } from "../src/infrastructure/rzi/rziWaterQualityProvider";

function sample(sampleDate: string, entero: number, ecoli: number): WaterQualitySample {
  return {
    sampleDate,
    intestinalEnterococci: { value: entero, belowDetectionLimit: false },
    eColi: { value: ecoli, belowDetectionLimit: false },
  };
}

function stubRegionClient(samplesByZone: Map<string, WaterQualitySample>): RziRegionClient {
  return { fetchLatestSamplesByZone: vi.fn(async () => samplesByZone) };
}

describe("mergeZoneSamples", () => {
  it("returns null for no samples", () => {
    expect(mergeZoneSamples([])).toBeNull();
  });

  it("passes a single zone's sample through unchanged", () => {
    expect(mergeZoneSamples([sample("2026-08-04", 30, 46)])).toEqual(sample("2026-08-04", 30, 46));
  });

  it("picks the most recent date across zones", () => {
    const merged = mergeZoneSamples([sample("2026-07-21", 100, 100), sample("2026-08-04", 30, 46)]);
    expect(merged?.sampleDate).toBe("2026-08-04");
  });

  it("on a same-day tie between zones, takes the worse (higher) reading per indicator independently", () => {
    const merged = mergeZoneSamples([sample("2026-08-04", 80, 20), sample("2026-08-04", 30, 90)]);
    expect(merged).toEqual({
      sampleDate: "2026-08-04",
      intestinalEnterococci: { value: 80, belowDetectionLimit: false },
      eColi: { value: 90, belowDetectionLimit: false },
    });
  });
});

describe("RziWaterQualityProvider", () => {
  it("returns null for a beach with no zone mapping", async () => {
    const provider = new RziWaterQualityProvider({
      varna: stubRegionClient(new Map()),
      burgas: stubRegionClient(new Map()),
    });

    expect(await provider.fetchLatestSample("some-unmapped-beach")).toBeNull();
  });

  it("returns a single-zone beach's sample from the right region", async () => {
    const provider = new RziWaterQualityProvider({
      varna: stubRegionClient(new Map([["03012", sample("2026-08-04", 30, 110)]])),
      burgas: stubRegionClient(new Map()),
    });

    expect(await provider.fetchLatestSample("varna-central-beach")).toEqual(sample("2026-08-04", 30, 110));
  });

  it("merges a multi-zone beach's samples", async () => {
    const provider = new RziWaterQualityProvider({
      varna: stubRegionClient(
        new Map([
          ["03001", sample("2026-08-04", 15, 15)],
          ["03002", sample("2026-08-04", 15, 15)],
          ["03003", sample("2026-08-04", 15, 15)],
          ["03004", sample("2026-08-04", 46, 15)],
        ])
      ),
      burgas: stubRegionClient(new Map()),
    });

    const result = await provider.fetchLatestSample("golden-sands");
    expect(result?.intestinalEnterococci.value).toBe(46);
  });

  it("fetches each region's source document at most once, however many beaches are looked up", async () => {
    const varnaClient = stubRegionClient(
      new Map([
        ["03012", sample("2026-08-04", 30, 110)],
        ["03021", sample("2026-08-03", 46, 15)],
      ])
    );
    const provider = new RziWaterQualityProvider({ varna: varnaClient, burgas: stubRegionClient(new Map()) });

    await provider.fetchLatestSample("varna-central-beach");
    await provider.fetchLatestSample("byala");
    await provider.fetchLatestSample("varna-central-beach");

    expect(varnaClient.fetchLatestSamplesByZone).toHaveBeenCalledTimes(1);
  });
});
