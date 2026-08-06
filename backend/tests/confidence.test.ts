import { describe, expect, it } from "vitest";
import { calibrateConfidence, computeDistancePrior } from "../src/domain/rules/confidence";
import { HourlyConditions } from "../src/domain/rules/evaluateHourlyFlag";

const baseConditions: HourlyConditions = {
  windSpeedMps: 2,
  windDirectionDeg: 0,
  waveHeightM: 0.1,
  wavePeriodS: 3,
  onshoreWindDirectionDeg: 180,
  stormWarningActive: false,
};

describe("computeDistancePrior", () => {
  it("is a coin flip (0.5) right on the Beaufort yellow boundary (5.4 m/s)", () => {
    const result = computeDistancePrior({ ...baseConditions, windSpeedMps: 5.4, waveHeightM: 0 });
    expect(result.prior).toBeCloseTo(0.5);
    expect(result.wellClear).toBe(false);
  });

  it("is a coin flip (0.5) right on the Douglas yellow boundary (0.5 m)", () => {
    const result = computeDistancePrior({ ...baseConditions, windSpeedMps: 0, waveHeightM: 0.5 });
    expect(result.prior).toBeCloseTo(0.5);
    expect(result.wellClear).toBe(false);
  });

  it("ramps up partway between a boundary and the well-clear margin", () => {
    // 1.0 m/s short of the 5.4 boundary, half of the 2 m/s well-clear margin.
    const result = computeDistancePrior({ ...baseConditions, windSpeedMps: 4.4, waveHeightM: 0.1 });
    expect(result.prior).toBeCloseTo(0.7);
    expect(result.wellClear).toBe(false);
  });

  it("is well clear once both wind and wave sit outside their margins from every boundary", () => {
    const result = computeDistancePrior({ ...baseConditions, windSpeedMps: 2, waveHeightM: 0.1 });
    expect(result.wellClear).toBe(true);
    expect(result.prior).toBeGreaterThan(0.9);
  });

  it("is not well clear if only one of wind or wave has cleared its margin", () => {
    const result = computeDistancePrior({ ...baseConditions, windSpeedMps: 2, waveHeightM: 0.5 });
    expect(result.wellClear).toBe(false);
  });

  it("is well clear whenever a storm warning is active, regardless of wind/wave values", () => {
    const result = computeDistancePrior({ ...baseConditions, windSpeedMps: 5.4, waveHeightM: 0.5, stormWarningActive: true });
    expect(result.wellClear).toBe(true);
  });

  it("factors swell height into the effective wave height, same as the rule engine", () => {
    const calm = computeDistancePrior({ ...baseConditions, waveHeightM: 0.1 });
    const swollen = computeDistancePrior({ ...baseConditions, waveHeightM: 0.1, swellHeightM: 0.5 });
    expect(swollen.prior).toBeLessThan(calm.prior);
  });
});

describe("calibrateConfidence", () => {
  it("prior-only: falls back to the distance prior when the bucket has no feedback history at all", () => {
    const result = calibrateConfidence({ distancePrior: 0.7, wellClear: false });
    expect(result.basis).toBe("prior");
    expect(result.percent).toBe(70);
    expect(result.sampleSize).toBe(0);
  });

  it("blended: combines a historical bucket hit-rate with today's live reports via the kappa-weighted update", () => {
    const result = calibrateConfidence({
      distancePrior: 0.7,
      wellClear: false,
      historicalStats: { hits: 8, total: 10 },
      todaysReports: { agree: 2, total: 2 },
      kappa: 9,
    });
    // posterior = (0.8*9 + 2) / (9 + 2) = 9.2/11
    expect(result.basis).toBe("blended");
    expect(result.percent).toBe(84);
    expect(result.sampleSize).toBe(12);
  });

  it("blended: uses the distance prior as the baseline when there's no historical bucket data yet, only today's reports", () => {
    const result = calibrateConfidence({
      distancePrior: 0.6,
      wellClear: false,
      todaysReports: { agree: 5, total: 5 },
      kappa: 9,
    });
    // posterior = (0.6*9 + 5) / (9 + 5) = 10.4/14
    expect(result.basis).toBe("blended");
    expect(result.percent).toBe(74);
    expect(result.sampleSize).toBe(5);
  });

  it("full-certainty: states high confidence when conditions are well clear, ignoring feedback volume", () => {
    const result = calibrateConfidence({
      distancePrior: 0.98,
      wellClear: true,
      historicalStats: { hits: 1, total: 20 },
      todaysReports: { agree: 0, total: 5 },
    });
    expect(result.basis).toBe("certain");
    expect(result.percent).toBe(98);
  });

  it("kappa is tunable: a larger kappa anchors the posterior closer to the baseline against the same reports", () => {
    const input = {
      distancePrior: 0.7,
      wellClear: false,
      historicalStats: { hits: 5, total: 10 },
      todaysReports: { agree: 2, total: 2 },
    };
    const lowKappa = calibrateConfidence({ ...input, kappa: 1 });
    const highKappa = calibrateConfidence({ ...input, kappa: 20 });

    // Today's reports (100% agree) pull the posterior up from the 0.5 baseline; a smaller kappa
    // lets that same-day evidence move it further.
    expect(lowKappa.percent).toBeGreaterThan(highKappa.percent);
  });
});
