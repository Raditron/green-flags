/**
 * A single MPN/100cm³ lab result for one bathing-water indicator (intestinal enterococci or E.
 * coli), per Naredba No. 5/2008 (Приложение №1 towards чл.6, ал.1) — see issue #119.
 */
export interface WaterQualityReading {
  /**
   * MPN/100cm³. When `belowDetectionLimit` is true, this is the lab's reporting floor (RZI Varna
   * and RZI Burgas both currently report 15 as "под 15" / "below 15"), not a measured value — still
   * safely below every Naredba No. 5/2008 classification band (100/200/185 and 250/500/500), so it's
   * safe to treat as a normal reading for threshold comparisons.
   */
  value: number;
  belowDetectionLimit: boolean;
}

/** One RZI zone's most recently published sample. */
export interface WaterQualitySample {
  /** Calendar date (YYYY-MM-DD) the sample was actually taken (RZI's "Дата на пробонабиране"). */
  sampleDate: string;
  intestinalEnterococci: WaterQualityReading;
  eColi: WaterQualityReading;
}
