import { describe, expect, it } from "vitest";
import { evaluateWaterQualityRating } from "../src/domain/rules/evaluateWaterQualityRating";
import { WaterQualitySample } from "../src/domain/waterQualitySample";

function sample(entero: number, ecoli: number, sampleDate = "2026-08-18"): WaterQualitySample {
  return {
    sampleDate,
    intestinalEnterococci: { value: entero, belowDetectionLimit: false },
    eColi: { value: ecoli, belowDetectionLimit: false },
  };
}

describe("evaluateWaterQualityRating — per-indicator bands", () => {
  it("is excellent when both indicators are at/under their excellent cutoffs (100 / 250)", () => {
    expect(evaluateWaterQualityRating(sample(100, 250)).band).toBe("excellent");
  });

  it("turns good the moment enterococci exceeds its excellent cutoff (101)", () => {
    expect(evaluateWaterQualityRating(sample(101, 250)).band).toBe("good");
  });

  it("turns good the moment E. coli exceeds its excellent cutoff (251)", () => {
    expect(evaluateWaterQualityRating(sample(100, 251)).band).toBe("good");
  });

  it("stays good right at each indicator's good cutoff (200 / 500)", () => {
    expect(evaluateWaterQualityRating(sample(200, 500)).band).toBe("good");
  });

  it("turns poor the moment enterococci exceeds its good cutoff (201)", () => {
    expect(evaluateWaterQualityRating(sample(201, 500)).band).toBe("poor");
  });

  it("turns poor the moment E. coli exceeds its good cutoff (501)", () => {
    expect(evaluateWaterQualityRating(sample(200, 501)).band).toBe("poor");
  });

  it("never produces 'sufficient': the law's cutoff for it (185) sits inside enterococci's own 'good' range", () => {
    // 190 is above the law's real "sufficient" cutoff (185) but this formula never compares against
    // it directly (see evaluateWaterQualityRating's doc comment) — it's still <= the "good" cutoff.
    expect(evaluateWaterQualityRating(sample(190, 250)).band).toBe("good");
  });
});

describe("evaluateWaterQualityRating — combination (worst indicator wins)", () => {
  it("takes the worse of the two indicators when they disagree", () => {
    expect(evaluateWaterQualityRating(sample(100, 501)).band).toBe("poor");
    expect(evaluateWaterQualityRating(sample(201, 250)).band).toBe("poor");
  });

  it("lets a clean E. coli reading not drag down a poor enterococci reading, or vice versa — worst still wins", () => {
    expect(evaluateWaterQualityRating(sample(300, 100)).band).toBe("poor");
  });
});

describe("evaluateWaterQualityRating — sample date", () => {
  it("passes the sample's date through unchanged, for the 'as of' label", () => {
    expect(evaluateWaterQualityRating(sample(50, 100, "2026-07-04")).sampleDate).toBe("2026-07-04");
  });
});
