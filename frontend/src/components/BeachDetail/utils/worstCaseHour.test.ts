import { describe, expect, it } from "vitest";
import { worstCaseHour } from "./worstCaseHour";
import type { HourlyPrediction } from "../interfaces";

function hour(overrides: Partial<HourlyPrediction> & { hour: number }): HourlyPrediction {
  return {
    flagColor: "green",
    ripCurrentRisk: "low",
    confidence: { percent: 90, basis: "certain", sampleSize: 0 },
    readableWindSpeed: "calm",
    readableSeaState: "calm",
    ...overrides,
  };
}

describe("worstCaseHour", () => {
  it("returns null when there are no hours in the 9-18 lifeguard window", () => {
    expect(worstCaseHour([])).toBeNull();
  });

  it("picks the earliest hour on an all-green day", () => {
    const hours = [hour({ hour: 9 }), hour({ hour: 12 }), hour({ hour: 18 })];
    expect(worstCaseHour(hours)?.hour).toBe(9);
  });

  it("ignores a red hour outside the 9-18 window and picks the worst hour within it", () => {
    const hours = [
      hour({ hour: 8, flagColor: "red" }),
      hour({ hour: 9, flagColor: "green" }),
      hour({ hour: 12, flagColor: "yellow" }),
      hour({ hour: 19, flagColor: "red" }),
    ];
    expect(worstCaseHour(hours)).toMatchObject({ hour: 12, flagColor: "yellow" });
  });

  it("orders severity red > yellow > green", () => {
    const hours = [hour({ hour: 9, flagColor: "yellow" }), hour({ hour: 15, flagColor: "red" })];
    expect(worstCaseHour(hours)).toMatchObject({ hour: 15, flagColor: "red" });
  });

  it("tie-breaks two equally severe hours to the earliest, regardless of input order", () => {
    const hours = [hour({ hour: 17, flagColor: "red" }), hour({ hour: 10, flagColor: "red" })];
    expect(worstCaseHour(hours)).toMatchObject({ hour: 10, flagColor: "red" });
  });

  it("passes confidence and basis through unchanged for a day with no reports yet", () => {
    const noReportsConfidence: HourlyPrediction["confidence"] = { percent: 62, basis: "prior", sampleSize: 0 };
    const hours = [hour({ hour: 11, flagColor: "yellow", confidence: noReportsConfidence })];
    expect(worstCaseHour(hours)?.confidence).toEqual(noReportsConfidence);
  });
});
