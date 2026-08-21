import { PDFParse } from "pdf-parse";
import { WaterQualityReading, WaterQualitySample } from "../../domain/waterQualitySample";
import { RziRegionClient } from "./rziRegionClient";

/**
 * RZI Varna publishes one PDF per year covering every zone from Golden Sands north through Byala,
 * refreshed in place as new biweekly samples come in — verified live August 2026 (see issue #122
 * and issue #120's research). The URL only became clear by following the site's own "Мониторинг на
 * морските води" page (page_id=2635); `rzi-varna.com/health/mvodi-<year>.pdf` isn't discoverable
 * from the homepage.
 */
const PDF_URL = "https://www.rzi-varna.com/health/mvodi-2026.pdf";

/**
 * Matches "РЕЗУЛТАТИ ОТ МОНИТОРИНГА..." — pdf-parse successfully recovers this Cyrillic PDF's text
 * (including zone names) despite issue #122's note that a shell `pdftotext -layout` couldn't; this
 * repeated section title is what splits the document into one chunk per zone.
 */
const ZONE_SECTION_MARKER = "РЕЗУЛТАТИ ОТ МОНИТОРИНГА";

const ZONE_CODE_PATTERN = /Пункт за вземане на проби\s*№\.?\s*(\d+)/;
const ZONE_NAME_PATTERN = /Наименование:?\s*([^\n]+)/;

/**
 * A data row: "<planned date> <sample date> <enterococci> <ecoli>", optionally followed by more
 * columns (Sal./NAG presence, incident notes, ...) which this intentionally ignores. The
 * `(?![ \t]*\d)` guard (same line only — `\s` would also match the newline before the *next* row's
 * date and reject every row) skips the rare row whose values got split across extra whitespace by
 * PDF text extraction (e.g. a wrap after a rain-driven spike), rather than silently mispairing
 * tokens into a wrong value — see issue #122's follow-up note on 03011.
 */
const ROW_PATTERN = /^(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})\s+(под\s+\d+|\d+)\s+(под\s+\d+|\d+)(?![ \t]*\d)/gm;

function parseReading(raw: string): WaterQualityReading {
  const belowDetectionLimit = raw.match(/под\s+(\d+)/);
  if (belowDetectionLimit) return { value: Number(belowDetectionLimit[1]), belowDetectionLimit: true };
  return { value: Number(raw), belowDetectionLimit: false };
}

/**
 * Parses the full text of a `mvodi-<year>.pdf` extraction into the latest sample per zone.
 *
 * The document interleaves each zone's data table with the *next* zone's section marker before its
 * own code/name label appears (a first-page-only quirk: page 1 crams the legal methodology text
 * above zone 03001's table, and 03001's own label only shows up right before the marker that starts
 * page 2) — except for the very first zone, whose table sits before any marker at all. Splitting on
 * the marker and re-joining the first two pieces realigns every zone's table with its own label; see
 * the parser test for a worked example of the layout this compensates for.
 */
export function parseVarnaPdfText(text: string): Map<string, WaterQualitySample> {
  const parts = text.split(ZONE_SECTION_MARKER);
  const blocks = parts.length > 1 ? [parts[0] + parts[1], ...parts.slice(2)] : parts;

  const samplesByZone = new Map<string, WaterQualitySample>();

  for (const block of blocks) {
    const codeMatch = block.match(ZONE_CODE_PATTERN);
    if (!codeMatch) continue;
    const zoneCode = codeMatch[1];

    let latest: WaterQualitySample | null = null;
    for (const rowMatch of block.matchAll(ROW_PATTERN)) {
      const [, , sampleDate, entero, ecoli] = rowMatch;
      if (latest && sampleDate <= latest.sampleDate) continue;
      latest = { sampleDate, intestinalEnterococci: parseReading(entero), eColi: parseReading(ecoli) };
    }

    if (latest) samplesByZone.set(zoneCode, latest);
  }

  return samplesByZone;
}

/** Only used for the client's own error messages — not part of the parsed sample data. */
export function parseVarnaZoneName(text: string, zoneCode: string): string | null {
  const parts = text.split(ZONE_SECTION_MARKER);
  const blocks = parts.length > 1 ? [parts[0] + parts[1], ...parts.slice(2)] : parts;
  const block = blocks.find((candidate) => candidate.match(ZONE_CODE_PATTERN)?.[1] === zoneCode);
  return block?.match(ZONE_NAME_PATTERN)?.[1]?.trim() ?? null;
}

export class RziVarnaClient implements RziRegionClient {
  async fetchLatestSamplesByZone(): Promise<Map<string, WaterQualitySample>> {
    const response = await fetch(PDF_URL);
    if (!response.ok) {
      throw new Error(`RZI Varna PDF request failed with status ${response.status}`);
    }

    const data = Buffer.from(await response.arrayBuffer());
    const parser = new PDFParse({ data });
    const { text } = await parser.getText();

    return parseVarnaPdfText(text);
  }
}
