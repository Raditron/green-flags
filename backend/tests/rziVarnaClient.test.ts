import { describe, expect, it } from "vitest";
import { parseVarnaPdfText, parseVarnaZoneName } from "../src/infrastructure/rzi/rziVarnaClient";

/**
 * Mirrors mvodi-2026.pdf's real layout (verified live against RZI Varna, August 2026): the first
 * zone's table sits before any "РЕЗУЛТАТИ ОТ МОНИТОРИНГА..." marker, with its own code/name label
 * only appearing right after the *first* marker occurrence — every later zone's table and label are
 * both inside the same marker-delimited chunk. See rziVarnaClient.ts's parseVarnaPdfText doc.
 */
const FIXTURE_TEXT = `МЕТОДИКА ЗА ОЦЕНКА НА ВОДИТЕ ЗА КЪПАНЕ
[... legal methodology text omitted ...]

-- 1 of 2 --

ДРУГИ ДОПЪЛНИТЕЛНО ИЗСЛЕДВАНИ ПРИ НЕОБХОДИМОСТ ПОКАЗАТЕЛИ**
Планирана дата ... Дата на пробонабиране ...
2026-05-27 2026-05-27 под 15 под 15
2026-06-09 2026-06-09 15 30
Географски координати: ширина N 43018'12'' дължина E 28003'12''
РЕЗУЛТАТИ ОТ МОНИТОРИНГА НА МОРСКИ ВОДИ ОТ ЗОНИТЕ ЗА КЪПАНЕ-РЕГИОН ВАРНА 2026 Г.
Пункт за вземане на проби №03001 Наименование Zone One Beach
Времетраене на сезона за къпане: от 1.06.2026 г. до 30.09.2026 г.
стр.1

-- 2 of 2 --

РЕЗУЛТАТИ ОТ МОНИТОРИНГА НА МОРСКИ ВОДИ ОТ ЗОНИТЕ ЗА КЪПАНЕ-РЕГИОН ВАРНА 2026 Г.
ДРУГИ ДОПЪЛНИТЕЛНО ИЗСЛЕДВАНИ ПРИ НЕОБХОДИМОСТ ПОКАЗАТЕЛИ**
Sal. NAG
2026-05-27 2026-05-27 30 46
2026-06-09 2026-06-09 61 под 15 отсъства отсъства
2026-06-16 2026-06-16 4 124 34 659 след пороен дъжд
Географски координати: ширина N .43013'45'' дължина E .28000'53''
Пункт за вземане на проби № 03002 Наименование: Zone Two Beach
Времетраене на сезона за къпане: от 1.06.2026 г. до 30.09.2026 г.
стр.2
`;

describe("parseVarnaPdfText", () => {
  it("realigns the first zone's table (which sits before any marker) with its own label", () => {
    const samples = parseVarnaPdfText(FIXTURE_TEXT);

    expect(samples.get("03001")).toEqual({
      sampleDate: "2026-06-09",
      intestinalEnterococci: { value: 15, belowDetectionLimit: false },
      eColi: { value: 30, belowDetectionLimit: false },
    });
  });

  it("picks the latest well-formed row, ignoring trailing Sal./NAG columns", () => {
    const samples = parseVarnaPdfText(FIXTURE_TEXT);

    expect(samples.get("03002")).toEqual({
      sampleDate: "2026-06-09",
      intestinalEnterococci: { value: 61, belowDetectionLimit: false },
      eColi: { value: 15, belowDetectionLimit: true },
    });
  });

  it("skips a row whose values got split into extra tokens rather than mispairing them", () => {
    const samples = parseVarnaPdfText(FIXTURE_TEXT);

    // The 2026-06-16 row ("4 124 34 659 след пороен дъжд") is later than 2026-06-09 but ambiguous —
    // it must not become zone 03002's latest sample with a wrong value.
    expect(samples.get("03002")?.sampleDate).toBe("2026-06-09");
  });

  it("returns an empty map for text with no zone tables", () => {
    expect(parseVarnaPdfText("no zones here").size).toBe(0);
  });
});

describe("parseVarnaZoneName", () => {
  it("finds a zone's name by code", () => {
    expect(parseVarnaZoneName(FIXTURE_TEXT, "03002")).toBe("Zone Two Beach");
  });

  it("returns null for an unknown zone code", () => {
    expect(parseVarnaZoneName(FIXTURE_TEXT, "99999")).toBeNull();
  });
});
