import { describe, expect, it } from "vitest";
import { isWithinLegalSeason, isWithinLegalWindow } from "../src/domain/rules/legalWindow";

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

describe("isWithinLegalSeason", () => {
  it("excludes the month just before the season opens (May)", () => {
    expect(isWithinLegalSeason("2026-05-31")).toBe(false);
  });

  it("includes the season's opening month (June)", () => {
    expect(isWithinLegalSeason("2026-06-01")).toBe(true);
  });

  it("includes the season's closing month (September)", () => {
    expect(isWithinLegalSeason("2026-09-30")).toBe(true);
  });

  it("excludes the month just after the season closes (October)", () => {
    expect(isWithinLegalSeason("2026-10-01")).toBe(false);
  });
});
