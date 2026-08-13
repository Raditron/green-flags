import { DailyForecast, ForecastCoordinates, ForecastProvider, HourlyForecast } from "../../domain/ports/batch/forecastProvider";

const MARINE_ENDPOINT = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

/** Days of hourly data requested per call: today plus the 6 days after it, matching the 7-day rolling forecast window. */
const FORECAST_WINDOW_DAYS = 7;

interface MarineHourly {
  time: string[];
  wave_height: number[];
  wave_period: number[];
  swell_wave_height: number[];
}

interface WeatherHourly {
  time: string[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
}

/** Extracts "HH" -> hour-of-day from an Open-Meteo `timezone=auto` local timestamp like "2026-08-05T09:00". */
function hourOf(localTimestamp: string): number {
  return Number(localTimestamp.slice(11, 13));
}

/** Extracts "YYYY-MM-DD" from an Open-Meteo `timezone=auto` local timestamp like "2026-08-05T09:00". */
function dateOf(localTimestamp: string): string {
  return localTimestamp.slice(0, 10);
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo request to ${url.hostname} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches a beach's 7-day rolling window of hourly forecast from Open-Meteo — one call each to the
 * Marine Weather API (wave/swell) and the Weather Forecast API (wind), both with `timezone=auto` so
 * hourly timestamps come back already in the beach's own local time (no server-timezone math
 * needed downstream). Per .scratch/green-flags-mvp/issues/09-rule-engine-threshold-standard.md,
 * Open-Meteo is the sole rule-engine data source.
 */
export class OpenMeteoForecastClient implements ForecastProvider {
  async fetchForecastWindow(coordinates: ForecastCoordinates): Promise<DailyForecast[]> {
    const [marine, weather] = await Promise.all([
      fetchJson<{ hourly: MarineHourly }>(this.buildMarineUrl(coordinates)),
      fetchJson<{ hourly: WeatherHourly }>(this.buildWeatherUrl(coordinates)),
    ]);

    const windByTimestamp = new Map(
      weather.hourly.time.map((time, index) => [
        time,
        { windSpeedMps: weather.hourly.wind_speed_10m[index], windDirectionDeg: weather.hourly.wind_direction_10m[index] },
      ])
    );

    const hoursByDate = new Map<string, HourlyForecast[]>();

    marine.hourly.time.forEach((time, index) => {
      const wind = windByTimestamp.get(time);
      if (!wind) return;

      const date = dateOf(time);
      const hours = hoursByDate.get(date) ?? [];
      hours.push({
        hour: hourOf(time),
        windSpeedMps: wind.windSpeedMps,
        windDirectionDeg: wind.windDirectionDeg,
        waveHeightM: marine.hourly.wave_height[index],
        wavePeriodS: marine.hourly.wave_period[index],
        swellHeightM: marine.hourly.swell_wave_height[index],
      });
      hoursByDate.set(date, hours);
    });

    // Map preserves insertion order, and Open-Meteo returns timestamps in chronological order, so
    // this is already ascending by date without a separate sort.
    return Array.from(hoursByDate.entries()).map(([date, hours]) => ({ date, hours }));
  }

  private buildMarineUrl(coordinates: ForecastCoordinates): URL {
    const url = new URL(MARINE_ENDPOINT);
    url.searchParams.set("latitude", String(coordinates.lat));
    url.searchParams.set("longitude", String(coordinates.long));
    url.searchParams.set("hourly", "wave_height,wave_period,swell_wave_height");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", String(FORECAST_WINDOW_DAYS));
    return url;
  }

  private buildWeatherUrl(coordinates: ForecastCoordinates): URL {
    const url = new URL(WEATHER_ENDPOINT);
    url.searchParams.set("latitude", String(coordinates.lat));
    url.searchParams.set("longitude", String(coordinates.long));
    url.searchParams.set("hourly", "wind_speed_10m,wind_direction_10m");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", String(FORECAST_WINDOW_DAYS));
    url.searchParams.set("wind_speed_unit", "ms");
    return url;
  }
}
