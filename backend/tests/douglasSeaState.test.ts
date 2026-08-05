import { describe, expect, it } from "vitest";
import { waveHeightToDouglasSeaState } from "../src/domain/rules/douglasSeaState";

describe("waveHeightToDouglasSeaState", () => {
  it.each([
    [0, 0],
    [0.05, 1],
    [0.1, 1],
    [0.3, 2],
    [0.5, 2],
    [0.51, 3],
    [1.25, 3],
    [1.26, 4],
    [2.5, 4],
    [2.51, 5],
    [4, 5],
    [4.01, 6],
    [6, 6],
    [6.01, 7],
    [9, 7],
    [9.01, 8],
    [14, 8],
    [14.01, 9],
    [20, 9],
  ])("classifies a %d m wave height as Douglas sea state %d", (waveHeightM, expectedState) => {
    expect(waveHeightToDouglasSeaState(waveHeightM)).toBe(expectedState);
  });

  it("rejects a negative wave height", () => {
    expect(() => waveHeightToDouglasSeaState(-1)).toThrow();
  });
});
