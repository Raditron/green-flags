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
  /** One entry per date in the rolling forecast window (today .. today+6), in ascending date order. */
  fetchForecastWindow(coordinates: ForecastCoordinates): Promise<DailyForecast[]>;
}
