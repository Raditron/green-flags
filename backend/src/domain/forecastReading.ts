/** A single hour's raw marine/weather measurements, shared by forecast fetching, rule evaluation, and persistence. */
export interface ForecastReading {
  windSpeedMps: number;
  /** Meteorological convention: compass bearing the wind is blowing FROM. */
  windDirectionDeg: number;
  waveHeightM: number;
  wavePeriodS: number;
  /** Optional swell height on top of the wind-wave height, in metres. */
  swellHeightM?: number;
}
