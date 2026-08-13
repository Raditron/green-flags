import { describe, expect, it } from "vitest";
import { deriveLead, deriveLeadTier } from "../src/domain/rules/lead";

describe("deriveLead", () => {
  it("is 0 when a Prediction is issued for the same calendar date it targets", () => {
    expect(deriveLead("2026-08-13", "2026-08-13")).toBe(0);
  });

  it("counts whole calendar days between issued and target dates", () => {
    expect(deriveLead("2026-08-13", "2026-08-16")).toBe(3);
  });

  it("is 6 for a Prediction issued at the start of the 7-day rolling window", () => {
    expect(deriveLead("2026-08-13", "2026-08-19")).toBe(6);
  });

  it("is unaffected by a DST transition falling between the two dates", () => {
    // Europe/Sofia moves clocks back on the last Sunday of October (2026-10-25).
    expect(deriveLead("2026-10-23", "2026-10-27")).toBe(4);
  });
});

describe("deriveLeadTier", () => {
  it("classifies Lead 0 and 1 as near", () => {
    expect(deriveLeadTier(0)).toBe("near");
    expect(deriveLeadTier(1)).toBe("near");
  });

  it("classifies Lead 2 through 4 as mid", () => {
    expect(deriveLeadTier(2)).toBe("mid");
    expect(deriveLeadTier(3)).toBe("mid");
    expect(deriveLeadTier(4)).toBe("mid");
  });

  it("classifies Lead 5 and 6 as far", () => {
    expect(deriveLeadTier(5)).toBe("far");
    expect(deriveLeadTier(6)).toBe("far");
  });

  it("holds the boundary between near and mid at Lead 1 vs 2", () => {
    expect(deriveLeadTier(1)).toBe("near");
    expect(deriveLeadTier(2)).toBe("mid");
  });

  it("holds the boundary between mid and far at Lead 4 vs 5", () => {
    expect(deriveLeadTier(4)).toBe("mid");
    expect(deriveLeadTier(5)).toBe("far");
  });
});
