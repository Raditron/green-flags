import { ForecastReading } from "../../forecastReading";

export interface HourlyForecast extends ForecastReading {
  /** Local hour of day (0-23) this forecast entry applies to, in the beach's own timezone. */
  hour: number;
}

export interface DailyForecast {
  /** Calendar date (YYYY-MM-DD) the hourly entries belong to, in the beach's own timezone. */
  date: string;
  hours: HourlyForecast[];
}

export interface ForecastCoordinates {
  lat: number;
  long: number;
}

export interface ForecastProvider {
  fetchDailyForecast(coordinates: ForecastCoordinates): Promise<DailyForecast>;
}
