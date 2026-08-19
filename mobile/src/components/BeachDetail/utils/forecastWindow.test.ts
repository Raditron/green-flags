import { addDays, forecastChipLabel, forecastWindowDates, todayInSofia } from "./forecastWindow";

describe("todayInSofia", () => {
  it("formats a date as YYYY-MM-DD in Europe/Sofia local time", () => {
    // 2026-08-13T22:30:00Z is 2026-08-14 01:30 in Sofia (UTC+3 in August).
    expect(todayInSofia(new Date("2026-08-13T22:30:00Z"))).toBe("2026-08-14");
  });
});

describe("addDays", () => {
  it("adds calendar days regardless of month/year boundaries", () => {
    expect(addDays("2026-08-13", 1)).toBe("2026-08-14");
    expect(addDays("2026-08-13", 6)).toBe("2026-08-19");
    expect(addDays("2026-08-30", 3)).toBe("2026-09-02");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("supports zero days as a no-op", () => {
    expect(addDays("2026-08-13", 0)).toBe("2026-08-13");
  });
});

describe("forecastWindowDates", () => {
  it("returns today followed by the next 6 calendar dates", () => {
    expect(forecastWindowDates(new Date("2026-08-13T10:00:00Z"))).toEqual([
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
    ]);
  });

  it("always returns exactly 7 dates", () => {
    expect(forecastWindowDates(new Date("2026-08-13T10:00:00Z"))).toHaveLength(7);
  });
});

describe("forecastChipLabel", () => {
  it("labels the first date 'Today'", () => {
    expect(forecastChipLabel("2026-08-13", "2026-08-13")).toBe("Today");
  });

  it("labels other dates with a short Sofia-local weekday name", () => {
    // 2026-08-14 is a Friday.
    expect(forecastChipLabel("2026-08-14", "2026-08-13")).toBe("Fri");
  });
});
