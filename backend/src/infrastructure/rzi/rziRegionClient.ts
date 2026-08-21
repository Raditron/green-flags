import { WaterQualitySample } from "../../domain/waterQualitySample";

/**
 * One RZI region's source document (a single PDF/XLS covering every zone in that region) parsed
 * into the latest sample per zone. Implemented per-region (rziVarnaClient.ts, rziBurgasClient.ts,
 * rziDobrichClient.ts) since each publishes in a different, bespoke format — see issue #122.
 */
export interface RziRegionClient {
  /** Every zone's latest sample this region's current source document has, keyed by zone code (e.g. "03007", "02020" — RZI Varna and RZI Burgas each number zones from 1 within their own document, so codes are only unique within a region, not globally). Zones with no parseable sample row are omitted rather than defaulted. */
  fetchLatestSamplesByZone(): Promise<Map<string, WaterQualitySample>>;
}
