import { WaterQualitySample } from "../waterQualitySample";

/**
 * Наредба № 5/2008's four classification labels (see issue #119), reused here for their familiar
 * official vocabulary even though this formula derives them differently than the law does — see
 * evaluateWaterQualityRating's doc comment for why "sufficient" never actually comes out of it.
 */
export type WaterQualityBand = "excellent" | "good" | "sufficient" | "poor";

interface IndicatorThresholds {
  /** MPN/100cm³ ceiling for "excellent" (the law's own 95th-percentile evaluation). */
  excellent: number;
  /** MPN/100cm³ ceiling for "good" (the law's own 95th-percentile evaluation). */
  good: number;
}

/**
 * Наредба № 5/2008 Приложение №1 coastal/transitional-water cutoffs (see issue #119's research),
 * cited again in issue #121. The law's "sufficient" cutoff (185 enterococci / 500 E. coli,
 * evaluated at the 90th percentile) is deliberately omitted here — see the module doc below.
 */
const ENTEROCOCCI_THRESHOLDS: IndicatorThresholds = { excellent: 100, good: 200 };
const ECOLI_THRESHOLDS: IndicatorThresholds = { excellent: 250, good: 500 };

function bandForValue(value: number, thresholds: IndicatorThresholds): WaterQualityBand {
  if (value <= thresholds.excellent) return "excellent";
  if (value <= thresholds.good) return "good";
  return "poor";
}

/** Worse-band-wins ranking, mirroring evaluateHourlyFlag.ts's existing precedent (deriveFlagColor,
 * deriveRipCurrentRisk) for combining multiple factors into one rating. */
const BAND_SEVERITY: Record<WaterQualityBand, number> = { excellent: 0, good: 1, sufficient: 2, poor: 3 };

function worseBand(a: WaterQualityBand, b: WaterQualityBand): WaterQualityBand {
  return BAND_SEVERITY[a] >= BAND_SEVERITY[b] ? a : b;
}

export interface WaterQualityRating {
  band: WaterQualityBand;
  /**
   * Calendar date (YYYY-MM-DD) of the sample this rating was derived from. Always show this
   * alongside the band (e.g. "Good — as of Aug 18 sample") so it reads as latest-sample-based,
   * not Наредба № 5/2008's own seasonal classification — see issue #121's "Labels" resolution.
   */
  sampleDate: string;
}

/**
 * Derives a beach's displayed water-quality rating from its single latest RZI sample (issue #121)
 * — a simplified, project-chosen formula, *not* the official Наредба № 5/2008 / EU Bathing Water
 * Directive classification, which needs 4 accumulated bathing seasons evaluated as a log-normal
 * percentile (see issue #119's research) that Green Flags doesn't have yet. Same "honest about not
 * being official" posture as the safety flag's own thresholds — see
 * .scratch/green-flags-mvp/research/02-bulgarian-flag-legal-criteria.md, "Implication for the
 * Green Flags rule engine".
 *
 * Bands per indicator reuse the law's own excellent/good numeric cutoffs (Приложение №1), but
 * deliberately skip its "sufficient" cutoff. The law evaluates "good" at a 95th percentile and
 * "sufficient" at a 90th percentile over a season of samples — different statistics that aren't
 * directly comparable as flat numbers. Compared naively, "sufficient"'s cutoff (185 enterococci /
 * 500 E. coli — the latter tying E. coli's own "good" cutoff) is *tighter than or equal to*
 * "good"'s (200 / 500), so any single sample that would qualify as "sufficient" already qualifies
 * as "good" first: the label is mathematically unreachable per indicator, for both indicators.
 * Rather than invert the scale to force it reachable (which would rate a dirtier sample
 * "sufficient" and a cleaner one right above it "good" — backwards), this formula only ever emits
 * excellent/good/poor from a single sample. "sufficient" stays in `WaterQualityBand` for
 * vocabulary parity with the law, and in case a future revision reintroduces season-aware
 * evaluation that can actually produce it.
 *
 * Combination: the beach's band is the worse of the two indicators' bands, following
 * evaluateHourlyFlag.ts's existing "worst factor wins" precedent (deriveFlagColor,
 * deriveRipCurrentRisk). Recommended by issue #121, not yet confirmed against the EU Directive's
 * own combination rule.
 */
export function evaluateWaterQualityRating(sample: WaterQualitySample): WaterQualityRating {
  const enterococciBand = bandForValue(sample.intestinalEnterococci.value, ENTEROCOCCI_THRESHOLDS);
  const eColiBand = bandForValue(sample.eColi.value, ECOLI_THRESHOLDS);

  return {
    band: worseBand(enterococciBand, eColiBand),
    sampleDate: sample.sampleDate,
  };
}
