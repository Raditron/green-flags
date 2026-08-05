import { DailyForecast, ForecastCoordinates, ForecastProvider, HourlyForecast } from "../../domain/ports/forecastProvider";

const MARINE_ENDPOINT = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

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
 * Fetches a beach's full day of hourly forecast from Open-Meteo — one call each to the Marine
 * Weather API (wave/swell) and the Weather Forecast API (wind), both with `timezone=auto` so
 * hourly timestamps come back already in the beach's own local time (no server-timezone math
 * needed downstream). Per .scratch/green-flags-mvp/issues/09-rule-engine-threshold-standard.md,
 * Open-Meteo is the sole rule-engine data source.
 */
export class OpenMeteoForecastClient implements ForecastProvider {
  async fetchDailyForecast(coordinates: ForecastCoordinates): Promise<DailyForecast> {
    const [marine, weather] = await Promise.all([
      fetchJson<{ hourly: MarineHourly }>(this.buildMarineUrl(coordinates)),
      fetchJson<{ hourly: WeatherHourly }>(this.buildWeatherUrl(coordinates)),
    ]);

    const windByHour = new Map(
      weather.hourly.time.map((time, index) => [
        hourOf(time),
        { windSpeedMps: weather.hourly.wind_speed_10m[index], windDirectionDeg: weather.hourly.wind_direction_10m[index] },
      ])
    );

    const hours: HourlyForecast[] = marine.hourly.time.flatMap((time, index) => {
      const wind = windByHour.get(hourOf(time));
      if (!wind) return [];

      return [
        {
          hour: hourOf(time),
          windSpeedMps: wind.windSpeedMps,
          windDirectionDeg: wind.windDirectionDeg,
          waveHeightM: marine.hourly.wave_height[index],
          wavePeriodS: marine.hourly.wave_period[index],
          swellHeightM: marine.hourly.swell_wave_height[index],
        },
      ];
    });

    return { date: dateOf(marine.hourly.time[0]), hours };
  }

  private buildMarineUrl(coordinates: ForecastCoordinates): URL {
    const url = new URL(MARINE_ENDPOINT);
    url.searchParams.set("latitude", String(coordinates.lat));
    url.searchParams.set("longitude", String(coordinates.long));
    url.searchParams.set("hourly", "wave_height,wave_period,swell_wave_height");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");
    return url;
  }

  private buildWeatherUrl(coordinates: ForecastCoordinates): URL {
    const url = new URL(WEATHER_ENDPOINT);
    url.searchParams.set("latitude", String(coordinates.lat));
    url.searchParams.set("longitude", String(coordinates.long));
    url.searchParams.set("hourly", "wind_speed_10m,wind_direction_10m");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("wind_speed_unit", "ms");
    return url;
  }
}
