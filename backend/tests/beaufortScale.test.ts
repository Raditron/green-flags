import { describe, expect, it } from "vitest";
import { windSpeedToBeaufortForce } from "../src/domain/rules/beaufortScale";

describe("windSpeedToBeaufortForce", () => {
  it.each([
    [0, 0],
    [0.2, 0],
    [0.3, 1],
    [1.5, 1],
    [1.6, 2],
    [3.3, 2],
    [3.4, 3],
    [5.4, 3],
    [5.5, 4],
    [7.9, 4],
    [8.0, 5],
    [10.7, 5],
    [10.8, 6],
    [13.8, 6],
    [13.9, 7],
    [17.1, 7],
    [17.2, 8],
    [20.7, 8],
    [20.8, 9],
    [24.4, 9],
    [24.5, 10],
    [28.4, 10],
    [28.5, 11],
    [32.6, 11],
    [32.7, 12],
    [50, 12],
  ])("classifies %d m/s as Beaufort force %d", (windSpeedMps, expectedForce) => {
    expect(windSpeedToBeaufortForce(windSpeedMps)).toBe(expectedForce);
  });

  it("rejects a negative wind speed", () => {
    expect(() => windSpeedToBeaufortForce(-1)).toThrow();
  });
});
