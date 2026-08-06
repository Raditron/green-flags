import { describe, expect, it } from "vitest";
import { currentSofiaHour, resolvePredictionDate, todayInSofia } from "../src/domain/today";

describe("todayInSofia", () => {
  it("formats a UTC instant as YYYY-MM-DD in Europe/Sofia local time", () => {
    // 2026-08-05T21:30:00Z is 2026-08-06T00:30 in Sofia (UTC+3 in August), so the local date has rolled over.
    expect(todayInSofia(new Date("2026-08-05T21:30:00Z"))).toBe("2026-08-06");
  });

  it("stays on the same calendar day when the UTC instant hasn't crossed Sofia's local midnight", () => {
    expect(todayInSofia(new Date("2026-08-05T10:00:00Z"))).toBe("2026-08-05");
  });
});

describe("resolvePredictionDate", () => {
  it("defaults to today in Sofia when no date is given", () => {
    expect(resolvePredictionDate(undefined, new Date("2026-08-05T10:00:00Z"))).toBe("2026-08-05");
  });

  it("passes through a well-formed date", () => {
    expect(resolvePredictionDate("2026-08-01")).toBe("2026-08-01");
  });

  it("returns null for a malformed date", () => {
    expect(resolvePredictionDate("not-a-date")).toBeNull();
  });
});

describe("currentSofiaHour", () => {
  it("returns the current hour (0-23) in Europe/Sofia local time, unclamped", () => {
    // 2026-08-05T05:30:00Z is 08:30 in Sofia (UTC+3 in August).
    expect(currentSofiaHour(new Date("2026-08-05T05:30:00Z"))).toBe(8);
  });

  it("returns hours outside the legal window too, unlike currentOrNearestLegalHour", () => {
    // 2026-08-05T22:00:00Z is 01:00 the next day in Sofia.
    expect(currentSofiaHour(new Date("2026-08-05T22:00:00Z"))).toBe(1);
  });
});
