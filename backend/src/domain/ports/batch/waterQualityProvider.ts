import { WaterQualitySample } from "../../waterQualitySample";

/**
 * Feeds beach-level water-quality ratings (issue #121, not yet built) with the single latest RZI
 * sample per beach — see issue #122 and .scratch/green-flags-mvp/issues/../map.md (#118). Unlike
 * ForecastProvider, this isn't queried per-beach-per-batch-run against a live API: RZI publishes on
 * its own ~biweekly cadence (see docs/adr for the eventual scheduled-job decision), so a real
 * implementation is expected to fetch each RZI region's source document once and serve every beach's
 * latest sample from that in-memory result.
 */
export interface WaterQualityProvider {
  /**
   * The beach's latest published RZI sample, or null if this beach has no RZI zone mapping yet
   * (see rziZoneMapping.ts) — either because it falls in RZI Dobrich's coverage area (not yet
   * scraped, see rziDobrichClient.ts) or because no confident zone match was made.
   */
  fetchLatestSample(beachId: string): Promise<WaterQualitySample | null>;
}
