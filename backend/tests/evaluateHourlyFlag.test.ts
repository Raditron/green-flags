import { describe, expect, it } from "vitest";
import { evaluateHourlyFlag, HourlyConditions } from "../src/domain/rules/evaluateHourlyFlag";

const baseConditions: HourlyConditions = {
  windSpeedMps: 2,
  windDirectionDeg: 0,
  waveHeightM: 0.1,
  wavePeriodS: 3,
  onshoreWindDirectionDeg: 180,
  stormWarningActive: false,
};

describe("evaluateHourlyFlag — flag color", () => {
  it("is green when both wind (Beaufort <= 3) and sea state (Douglas <= 2) are calm", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 3.4, waveHeightM: 0.5 });
    expect(result.flagColor).toBe("green");
  });

  it("turns yellow right at the Beaufort force 4 boundary (5.5 m/s)", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 5.5, waveHeightM: 0.1 });
    expect(result.flagColor).toBe("yellow");
  });

  it("stays green just below the Beaufort force 4 boundary (5.4 m/s)", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 5.4, waveHeightM: 0.1 });
    expect(result.flagColor).toBe("green");
  });

  it("turns yellow right at the Douglas sea state 3 boundary (0.51 m)", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 2, waveHeightM: 0.51 });
    expect(result.flagColor).toBe("yellow");
  });

  it("stays green just below the Douglas sea state 3 boundary (0.5 m)", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 2, waveHeightM: 0.5 });
    expect(result.flagColor).toBe("green");
  });

  it("turns red right at the Beaufort force 6 boundary (10.8 m/s)", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 10.8, waveHeightM: 0.1 });
    expect(result.flagColor).toBe("red");
  });

  it("turns red right at the Douglas sea state 5 boundary (2.51 m)", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, windSpeedMps: 2, waveHeightM: 2.51 });
    expect(result.flagColor).toBe("red");
  });

  it("is red whenever a storm warning is active, even in otherwise calm conditions", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, stormWarningActive: true });
    expect(result.flagColor).toBe("red");
  });

  it("factors swell height into the sea state alongside wind-wave height", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, waveHeightM: 0.1, swellHeightM: 2.6 });
    expect(result.flagColor).toBe("red");
  });
});

describe("evaluateHourlyFlag — rip current risk", () => {
  it("is low when wave height, period, and onshore wind are all negligible", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, waveHeightM: 0.1, wavePeriodS: 3 });
    expect(result.ripCurrentRisk).toBe("low");
  });

  it("stays low with a single factor sitting exactly on its moderate threshold", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, waveHeightM: 0.5, wavePeriodS: 3 });
    expect(result.ripCurrentRisk).toBe("low");
  });

  it("becomes moderate once two factors cross their moderate threshold", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, waveHeightM: 0.5, wavePeriodS: 6 });
    expect(result.ripCurrentRisk).toBe("moderate");
  });

  it("becomes high once wave height and period both cross their high threshold", () => {
    const result = evaluateHourlyFlag({ ...baseConditions, waveHeightM: 1.0, wavePeriodS: 8 });
    expect(result.ripCurrentRisk).toBe("high");
  });

  it("ignores wind blowing offshore, however strong, for rip current risk", () => {
    const result = evaluateHourlyFlag({
      ...baseConditions,
      waveHeightM: 0.1,
      wavePeriodS: 3,
      windSpeedMps: 10,
      windDirectionDeg: 0,
      onshoreWindDirectionDeg: 180,
    });
    expect(result.ripCurrentRisk).toBe("low");
  });

  it("counts strong onshore wind toward rip current risk", () => {
    const result = evaluateHourlyFlag({
      ...baseConditions,
      waveHeightM: 0.1,
      wavePeriodS: 3,
      windSpeedMps: 10,
      windDirectionDeg: 180,
      onshoreWindDirectionDeg: 180,
    });
    expect(result.ripCurrentRisk).toBe("moderate");
  });
});
