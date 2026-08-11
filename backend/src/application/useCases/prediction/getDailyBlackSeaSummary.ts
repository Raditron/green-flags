import { BeachDailyPredictions, HourlyPrediction, PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { BeachAreas, BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { FlagColor, RipCurrentRisk, effectiveWaveHeightM } from "../../../domain/rules/evaluateHourlyFlag";
import { WindSpeedReadable, beaufortForceToReadable, windSpeedToBeaufortForce } from "../../../domain/rules/beaufortScale";
import { SeaStateReadable, douglasSeaStateToReadable, waveHeightToDouglasSeaState } from "../../../domain/rules/douglasSeaState";
import { todayInSofia } from "../../../domain/shared/today";

/** Share of hourly predictions (0-100) that fell into each flag color, across whatever slice
 * (whole sea, or a single area) this distribution was computed for. Sums to ~100. */
export interface FlagColorDistribution {
  green: number;
  yellow: number;
  red: number;
}

/** Share of hourly predictions (0-100) that fell into each rip current risk tier. Sums to ~100. */
export interface RipCurrentRiskDistribution {
  low: number;
  moderate: number;
  high: number;
}

/** Share of hourly predictions (0-100) whose confidence figure rested on each basis. Sums to ~100. */
export interface ConfidenceBasisDistribution {
  certain: number;
  prior: number;
  blended: number;
}

/**
 * Everything the beach-detail timeline surfaces for a single hour (flag color, rip current risk,
 * confidence, readable wind/sea state), rolled up into averages/distributions across many hourly
 * predictions and many beaches. Powers the dashboard's sea-wide card and its per-area cards.
 */
export interface AverageAttributes {
  /** Most common flag color across the averaged predictions; the dashboard's headline color. */
  dominantFlagColor: FlagColor;
  flagColorDistribution: FlagColorDistribution;

  /** Most common rip current risk tier across the averaged predictions. */
  dominantRipCurrentRisk: RipCurrentRisk;
  ripCurrentRiskDistribution: RipCurrentRiskDistribution;

  /** Mean confidence percent (0-100) across the averaged predictions. */
  averageConfidencePercent: number;
  confidenceBasisDistribution: ConfidenceBasisDistribution;

  /** Mean raw wind speed, in m/s, across the averaged predictions. */
  averageWindSpeedMps: number;
  /** Readable label for averageWindSpeedMps, via the same Beaufort lookup the rule engine uses. */
  readableWindSpeed: WindSpeedReadable;

  /** Mean effective wave height (wind-wave vs. swell, whichever is taller), in metres. */
  averageWaveHeightM: number;
  /** Readable label for averageWaveHeightM, via the same Douglas sea-state lookup the rule engine uses. */
  readableSeaState: SeaStateReadable;
  /** Mean wave period, in seconds. */
  averageWavePeriodS: number;

  /** Share (0-100) of the averaged predictions issued while a storm warning was active. */
  stormWarningActivePercent: number;

  /** Number of hourly predictions this average was computed over — the sample size behind every
   * figure above, so the frontend can caveat a card backed by very few readings. */
  sampleSize: number;
  /** Number of distinct beaches contributing to this average. */
  beachCount: number;
}

/** A beach area's averages, alongside which area they belong to and how many beaches fed them —
 * an area with zero unguarded/guarded beaches reporting today simply won't appear. */
export interface AreaAverageAttributes extends AverageAttributes {
  area: BeachAreas;
}

export interface DailySummary {
  date: Date;
  averageAttributesBySea: AverageAttributes;
  averageAttributesByArea: AreaAverageAttributes[];
}

/** Ordered lowest to highest severity. On a tie between counts, {@link pickDominant} favors the
 * later (worse) entry — a safety dashboard should round a coin-flip up to the more cautious call. */
const FLAG_COLOR_SEVERITY_ORDER: FlagColor[] = ["green", "yellow", "red"];
const RIP_CURRENT_RISK_SEVERITY_ORDER: RipCurrentRisk[] = ["low", "moderate", "high"];

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Share of `total` that `count` represents, as a rounded 0-100 percent; 0 (not NaN) when `total` is 0. */
function percentOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

function pickDominant<T extends string>(counts: Record<T, number>, severityOrderLowToHigh: readonly T[]): T {
  let dominant = severityOrderLowToHigh[0];
  let max = counts[dominant];
  for (const key of severityOrderLowToHigh) {
    if (counts[key] >= max) {
      max = counts[key];
      dominant = key;
    }
  }
  return dominant;
}

/** Rolls up every hourly prediction across the given beaches' daily predictions into one
 * AverageAttributes. Empty input yields a zeroed-out (not NaN) average with sampleSize 0. */
function summarizePredictions(beachPredictions: BeachDailyPredictions[]): AverageAttributes {
  const hourlyPredictions: HourlyPrediction[] = beachPredictions.flatMap((b) => b.hourlyPredictions);
  const sampleSize = hourlyPredictions.length;
  const beachCount = new Set(beachPredictions.map((b) => b.beachId)).size;

  const flagCounts: FlagColorDistribution = { green: 0, yellow: 0, red: 0 };
  const ripCounts: RipCurrentRiskDistribution = { low: 0, moderate: 0, high: 0 };
  const basisCounts: ConfidenceBasisDistribution = { certain: 0, prior: 0, blended: 0 };
  let stormWarningActiveCount = 0;

  for (const hour of hourlyPredictions) {
    flagCounts[hour.flagColor]++;
    ripCounts[hour.ripCurrentRisk]++;
    basisCounts[hour.confidence.basis]++;
    if (hour.forecast.stormWarningActive) stormWarningActiveCount++;
  }

  const averageWindSpeedMps = average(hourlyPredictions.map((h) => h.forecast.windSpeedMps));
  const averageWaveHeightM = average(hourlyPredictions.map((h) => effectiveWaveHeightM(h.forecast)));
  const averageWavePeriodS = average(hourlyPredictions.map((h) => h.forecast.wavePeriodS));
  const averageConfidencePercent = Math.round(average(hourlyPredictions.map((h) => h.confidence.percent)));

  return {
    dominantFlagColor: pickDominant(flagCounts, FLAG_COLOR_SEVERITY_ORDER),
    flagColorDistribution: {
      green: percentOf(flagCounts.green, sampleSize),
      yellow: percentOf(flagCounts.yellow, sampleSize),
      red: percentOf(flagCounts.red, sampleSize),
    },
    dominantRipCurrentRisk: pickDominant(ripCounts, RIP_CURRENT_RISK_SEVERITY_ORDER),
    ripCurrentRiskDistribution: {
      low: percentOf(ripCounts.low, sampleSize),
      moderate: percentOf(ripCounts.moderate, sampleSize),
      high: percentOf(ripCounts.high, sampleSize),
    },
    averageConfidencePercent,
    confidenceBasisDistribution: {
      certain: percentOf(basisCounts.certain, sampleSize),
      prior: percentOf(basisCounts.prior, sampleSize),
      blended: percentOf(basisCounts.blended, sampleSize),
    },
    averageWindSpeedMps,
    readableWindSpeed: beaufortForceToReadable(windSpeedToBeaufortForce(averageWindSpeedMps)),
    averageWaveHeightM,
    readableSeaState: douglasSeaStateToReadable(waveHeightToDouglasSeaState(averageWaveHeightM)),
    averageWavePeriodS,
    stormWarningActivePercent: percentOf(stormWarningActiveCount, sampleSize),
    sampleSize,
    beachCount,
  };
}

export async function getDailyBlackSeaSummary(
  repository: PredictionRepository,
  beachRepository: BeachRepository,
  now: Date = new Date()
): Promise<DailySummary> {
  const date = todayInSofia(now);
  // Scoped to today's Sofia-local date at the query level, so this never has to load (or blend
  // in) stale predictions from previous batch runs.
  const todaysPredictions = (await repository.getDailyPredictions(date)) ?? [];

  const beaches = await beachRepository.listBeaches();
  const areaByBeachId = new Map(beaches.map((beach) => [beach.id, beach.area]));

  const predictionsByArea = new Map<BeachAreas, BeachDailyPredictions[]>();
  for (const prediction of todaysPredictions) {
    const area = areaByBeachId.get(prediction.beachId);
    if (!area) continue; // prediction for a beach no longer in the beach list; skip rather than misattribute

    const predictionsForArea = predictionsByArea.get(area);
    if (predictionsForArea) predictionsForArea.push(prediction);
    else predictionsByArea.set(area, [prediction]);
  }

  const averageAttributesByArea: AreaAverageAttributes[] = Array.from(predictionsByArea.entries()).map(
    ([area, predictions]) => ({
      area,
      ...summarizePredictions(predictions),
    })
  );

  return {
    date: now,
    averageAttributesBySea: summarizePredictions(todaysPredictions),
    averageAttributesByArea,
  };
}
