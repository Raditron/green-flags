import { WaterQualityProvider } from "../../domain/ports/batch/waterQualityProvider";
import { WaterQualityReading, WaterQualitySample } from "../../domain/waterQualitySample";
import { RziRegionClient } from "./rziRegionClient";
import { BEACH_TO_RZI_ZONES, RziRegion } from "./rziZoneMapping";

function worseReading(readings: WaterQualityReading[]): WaterQualityReading {
  return readings.reduce((worst, reading) => (reading.value > worst.value ? reading : worst));
}

/**
 * Combines a beach's zone samples (see rziZoneMapping.ts — most beaches map to one zone, some to
 * several) into the single latest-sample-per-beach `WaterQualityProvider` promises: picks the most
 * recent `sampleDate` among the beach's zones, then — on same-day multi-zone beaches — the worse
 * (higher MPN) reading per indicator, following evaluateHourlyFlag.ts's existing "worst factor wins"
 * precedent (see issue #118's map notes).
 */
export function mergeZoneSamples(samples: WaterQualitySample[]): WaterQualitySample | null {
  if (samples.length === 0) return null;

  const latestDate = samples.reduce((max, sample) => (sample.sampleDate > max ? sample.sampleDate : max), samples[0].sampleDate);
  const sameDaySamples = samples.filter((sample) => sample.sampleDate === latestDate);

  return {
    sampleDate: latestDate,
    intestinalEnterococci: worseReading(sameDaySamples.map((sample) => sample.intestinalEnterococci)),
    eColi: worseReading(sameDaySamples.map((sample) => sample.eColi)),
  };
}

/**
 * Composes the per-region RZI clients (rziVarnaClient.ts, rziBurgasClient.ts, rziDobrichClient.ts)
 * behind the single beach-keyed `WaterQualityProvider` port `runDailyBatch`-style callers use.
 *
 * Each region client fetches one source document covering every zone in that region, so — unlike
 * ForecastProvider, which is genuinely called once per beach — this caches each region's fetch for
 * the lifetime of the provider instance: a caller working through the whole beach list still only
 * fetches RZI Varna's PDF and RZI Burgas's xls once each, not once per beach.
 */
export class RziWaterQualityProvider implements WaterQualityProvider {
  private readonly regionSamplesByZone = new Map<RziRegion, Promise<Map<string, WaterQualitySample>>>();

  constructor(private readonly regionClients: Record<RziRegion, RziRegionClient>) {}

  async fetchLatestSample(beachId: string): Promise<WaterQualitySample | null> {
    const mapping = BEACH_TO_RZI_ZONES[beachId];
    if (!mapping) return null;

    const samplesByZone = await this.fetchRegion(mapping.region);
    const zoneSamples = mapping.zoneCodes
      .map((zoneCode) => samplesByZone.get(zoneCode))
      .filter((sample): sample is WaterQualitySample => sample !== undefined);

    return mergeZoneSamples(zoneSamples);
  }

  private fetchRegion(region: RziRegion): Promise<Map<string, WaterQualitySample>> {
    let pending = this.regionSamplesByZone.get(region);
    if (!pending) {
      pending = this.regionClients[region].fetchLatestSamplesByZone();
      this.regionSamplesByZone.set(region, pending);
    }
    return pending;
  }
}
