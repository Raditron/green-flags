import { describe, expect, it } from "vitest";
import { BEACH_TO_RZI_ZONES } from "../src/infrastructure/rzi/rziZoneMapping";

describe("BEACH_TO_RZI_ZONES", () => {
  it("never assigns the same region's zone code to two different beaches", () => {
    const ownerByRegionZone = new Map<string, string>();

    for (const [beachId, mapping] of Object.entries(BEACH_TO_RZI_ZONES)) {
      for (const zoneCode of mapping.zoneCodes) {
        const key = `${mapping.region}:${zoneCode}`;
        const owner = ownerByRegionZone.get(key);
        expect(owner, `zone ${key} claimed by both "${owner}" and "${beachId}"`).toBeUndefined();
        ownerByRegionZone.set(key, beachId);
      }
    }
  });

  it("gives every beach at least one zone code", () => {
    for (const [beachId, mapping] of Object.entries(BEACH_TO_RZI_ZONES)) {
      expect(mapping.zoneCodes.length, `${beachId} has no zone codes`).toBeGreaterThan(0);
    }
  });
});
