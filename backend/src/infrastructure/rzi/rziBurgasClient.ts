import * as XLSX from "xlsx";
import { WaterQualityReading, WaterQualitySample } from "../../domain/waterQualitySample";
import { RziRegionClient } from "./rziRegionClient";

/**
 * RZI Burgas publishes one `.xls` (Excel 97-2003 binary, CP1251 codepage) per month covering every
 * zone from Obzor south through Sinemorets — verified live August 2026, filename pattern
 * `tablici-monitoring-more-mz-<yearmonth>.xls` (see issue #122 and issue #120's research). Unlike
 * RZI Varna's single stable yearly URL, this one changes every month and needs to be discovered from
 * the region's water-quality page each fetch rather than hardcoded.
 */
const WATER_QUALITY_PAGE_URL = "https://rzi-burgas.bg/kachestvo-na-vodite/";

/** Matches e.g. `href="https://rzi-burgas.bg/wp-content/uploads/2026/08/tablici-monitoring-more-mz-202608.xls"`. */
const MONTHLY_XLS_LINK_PATTERN = /href="(https:\/\/rzi-burgas\.bg\/wp-content\/uploads\/\d{4}\/\d{2}\/tablici-monitoring-more-mz-\d+(?:-\d+)?\.xls)"/g;

const ZONE_HEADER_LABEL = "ПУНКТ ЗА ВЗЕМАНЕ";
/** Excel's day-zero, accounting for its classic (wrong) belief that 1900 was a leap year. */
const EXCEL_EPOCH_OFFSET_DAYS = 25569;

function excelSerialToIsoDate(serial: number): string {
  const ms = Math.round((serial - EXCEL_EPOCH_OFFSET_DAYS) * 86400 * 1000);
  return new Date(ms).toISOString().slice(0, 10);
}

function parseReading(rawCell: unknown): WaterQualityReading | null {
  const text = String(rawCell).trim();
  const belowDetectionLimit = text.match(/под\s*(\d+)/i);
  if (belowDetectionLimit) return { value: Number(belowDetectionLimit[1]), belowDetectionLimit: true };
  const value = Number(text);
  return Number.isFinite(value) && text !== "" ? { value, belowDetectionLimit: false } : null;
}

/**
 * Picks the latest of the current site's monthly `tablici-monitoring-more-mz-<yearmonth>.xls` links
 * off the water-quality listing page (sorted lexicographically by yearmonth, which sorts
 * chronologically for this filename pattern) — RZI Burgas keeps every past month's file linked
 * alongside the current one rather than only publishing the latest, so picking "first" or "last
 * href in document order" isn't reliable.
 */
export function pickLatestMonthlyXlsUrl(pageHtml: string): string | null {
  const urls = Array.from(pageHtml.matchAll(MONTHLY_XLS_LINK_PATTERN), (match) => match[1]);
  if (urls.length === 0) return null;
  return urls.sort().at(-1)!;
}

/**
 * Parses one sheet's rows (`XLSX.utils.sheet_to_json(sheet, { header: 1 })` shape — an array of
 * cell-value arrays, one per spreadsheet row) into the latest sample per zone. Each zone is a
 * repeating block: a "ПУНКТ ЗА ВЗЕМАНЕ НА ПРОБИ №" header row naming the zone, then one data row per
 * scheduled sample (`[plannedDateSerial, sampleDateSerial, enterococci, eColi, ...]`, blank once the
 * sample hasn't happened yet), until the next zone's header row.
 */
export function parseBurgasWorkbookRows(rows: unknown[][]): Map<string, WaterQualitySample> {
  const samplesByZone = new Map<string, WaterQualitySample>();
  let currentZoneCode: string | null = null;
  let currentLatest: WaterQualitySample | null = null;

  const flushCurrentZone = () => {
    if (currentZoneCode && currentLatest) samplesByZone.set(currentZoneCode, currentLatest);
  };

  for (const row of rows) {
    const firstCell = String(row[0] ?? "").trim();

    if (firstCell.includes(ZONE_HEADER_LABEL)) {
      flushCurrentZone();
      currentZoneCode = String(row[2] ?? "").trim();
      currentLatest = null;
      continue;
    }

    if (!currentZoneCode) continue;

    const sampleSerial = Number(row[1]);
    if (!Number.isFinite(sampleSerial) || sampleSerial <= 0) continue;

    const entero = parseReading(row[2]);
    const ecoli = parseReading(row[3]);
    if (!entero || !ecoli) continue;

    const sampleDate = excelSerialToIsoDate(sampleSerial);
    if (!currentLatest || sampleDate > currentLatest.sampleDate) {
      currentLatest = { sampleDate, intestinalEnterococci: entero, eColi: ecoli };
    }
  }
  flushCurrentZone();

  return samplesByZone;
}

export class RziBurgasClient implements RziRegionClient {
  async fetchLatestSamplesByZone(): Promise<Map<string, WaterQualitySample>> {
    const pageResponse = await fetch(WATER_QUALITY_PAGE_URL);
    if (!pageResponse.ok) {
      throw new Error(`RZI Burgas water-quality page request failed with status ${pageResponse.status}`);
    }
    const pageHtml = await pageResponse.text();

    const xlsUrl = pickLatestMonthlyXlsUrl(pageHtml);
    if (!xlsUrl) {
      throw new Error("RZI Burgas water-quality page has no tablici-monitoring-more-mz-<yearmonth>.xls link");
    }

    const xlsResponse = await fetch(xlsUrl);
    if (!xlsResponse.ok) {
      throw new Error(`RZI Burgas monitoring xls request to ${xlsUrl} failed with status ${xlsResponse.status}`);
    }

    const data = new Uint8Array(await xlsResponse.arrayBuffer());
    const workbook = XLSX.read(data, { type: "array", codepage: 1251 });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

    return parseBurgasWorkbookRows(rows);
  }
}
