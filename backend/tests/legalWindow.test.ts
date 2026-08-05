import { describe, expect, it } from "vitest";
import { isWithinLegalWindow } from "../src/domain/rules/legalWindow";

describe("isWithinLegalWindow", () => {
  it("excludes the hour just before the window opens (08:00)", () => {
    expect(isWithinLegalWindow(8)).toBe(false);
  });

  it("includes the window's opening hour (09:00)", () => {
    expect(isWithinLegalWindow(9)).toBe(true);
  });

  it("includes the window's last whole hour (18:00), which still falls before the 18:30 close", () => {
    expect(isWithinLegalWindow(18)).toBe(true);
  });

  it("excludes the hour after the window closes (19:00)", () => {
    expect(isWithinLegalWindow(19)).toBe(false);
  });
});
