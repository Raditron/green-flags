import { describe, expect, it } from "vitest";
import { RziDobrichClient } from "../src/infrastructure/rzi/rziDobrichClient";

describe("RziDobrichClient", () => {
  it("throws a clear not-implemented error rather than silently returning no data", async () => {
    await expect(new RziDobrichClient().fetchLatestSamplesByZone()).rejects.toThrow(/not implemented/i);
  });
});
