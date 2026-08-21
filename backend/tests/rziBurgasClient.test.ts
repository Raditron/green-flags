import { describe, expect, it } from "vitest";
import { parseBurgasWorkbookRows, pickLatestMonthlyXlsUrl } from "../src/infrastructure/rzi/rziBurgasClient";

// Excel serials (1899-12-30 epoch) for a few 2026 dates, as XLSX.utils.sheet_to_json({header:1})
// would hand them back for date-formatted cells.
const AUG_03_2026 = 46237;
const AUG_10_2026 = 46244;
const AUG_17_2026 = 46251;

describe("parseBurgasWorkbookRows", () => {
  it("mirrors the real workbook's repeating zone-header/data-row layout", () => {
    const rows: unknown[][] = [
      ["ПУНКТ ЗА ВЗЕМАНЕ НА ПРОБИ №", "", "02001", "наименование:", "", "Zone One Beach"],
      ["географски координати:", "", "ширина", "N 42 49 14", "дължина", "E 27 53 07"],
      ["времетраене на сезона за къпане ", "", "от", 46174, "до", "30.9.2026г."],
      [],
      ["", "", "", "", "", "", "ДРУГИ ДОПЪЛНИТЕЛНО ИЗСЛЕДВАНИ..."],
      ["Планирана дата...", "Дата на пробонабиране", "чревни ентерококи", "Ешерихия коли"],
      [AUG_03_2026, AUG_03_2026, 15, 15],
      [AUG_10_2026, AUG_10_2026, 46, 30],
      [AUG_17_2026, "", "", ""], // not sampled yet — blank actual-date/values
      [],
      ["ПУНКТ ЗА ВЗЕМАНЕ НА ПРОБИ №", "", "02002", "наименование:", "", "Zone Two Beach"],
      [AUG_03_2026, AUG_03_2026, "под 15", "под 15"],
      [AUG_10_2026, AUG_10_2026, 195, 197],
    ];

    const samples = parseBurgasWorkbookRows(rows);

    expect(samples.get("02001")).toEqual({
      sampleDate: "2026-08-10",
      intestinalEnterococci: { value: 46, belowDetectionLimit: false },
      eColi: { value: 30, belowDetectionLimit: false },
    });
    expect(samples.get("02002")).toEqual({
      sampleDate: "2026-08-10",
      intestinalEnterococci: { value: 195, belowDetectionLimit: false },
      eColi: { value: 197, belowDetectionLimit: false },
    });
  });

  it("omits a zone with no sampled rows yet, rather than defaulting it", () => {
    const rows: unknown[][] = [
      ["ПУНКТ ЗА ВЗЕМАНЕ НА ПРОБИ №", "", "02003", "наименование:", "", "Unsampled Beach"],
      [AUG_03_2026, "", "", ""],
      [AUG_10_2026, "", "", ""],
    ];

    expect(parseBurgasWorkbookRows(rows).has("02003")).toBe(false);
  });

  it("returns an empty map for rows with no zone header", () => {
    expect(parseBurgasWorkbookRows([[AUG_03_2026, AUG_03_2026, 15, 15]]).size).toBe(0);
  });
});

describe("pickLatestMonthlyXlsUrl", () => {
  const PAGE_HTML = `
    <a href="https://rzi-burgas.bg/wp-content/uploads/2025/09/tablici-monitoring-more-mz-2025.xls">2025</a>
    <a href="https://rzi-burgas.bg/wp-content/uploads/2026/08/tablici-monitoring-more-mz-202608.xls">Aug 2026</a>
    <a href="https://rzi-burgas.bg/wp-content/uploads/2024/10/tablici-monitoring-more-mz-20249.xls">2024</a>
  `;

  it("picks the most recent yearmonth link off the water-quality page", () => {
    expect(pickLatestMonthlyXlsUrl(PAGE_HTML)).toBe(
      "https://rzi-burgas.bg/wp-content/uploads/2026/08/tablici-monitoring-more-mz-202608.xls"
    );
  });

  it("returns null when the page has no matching link", () => {
    expect(pickLatestMonthlyXlsUrl("<a href=\"https://example.com/other.pdf\">no match</a>")).toBeNull();
  });
});
