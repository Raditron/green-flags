import { DailyForecast, ForecastCoordinates, ForecastProvider, HourlyForecast } from "../../domain/ports/batch/forecastProvider";
import { isWithinLegalWindow } from "../../domain/rules/legalWindow";

const MARINE_ENDPOINT = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

/** Days of hourly data requested per call: today plus the 6 days after it, matching the 7-day rolling forecast window. */
const FORECAST_WINDOW_DAYS = 7;

/**
 * Open-Meteo's marine model's wave forecast horizon (currently ~3.5-4 days) is shorter than its wind
 * forecast horizon (the full 7 days), so `wave_height`/`wave_period` can come back `null` for hours
 * beyond it even though the type below claims `number[]` — see issue #87.
 */
interface MarineHourly {
  time: string[];
  wave_height: Array<number | null>;
  wave_period: Array<number | null>;
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

/**
 * An hour's merged reading before the legal-window wave-data gate: `waveHeightM`/`wavePeriodS` still
 * carry the raw (possibly `null`) marine reading, unlike `HourlyForecast`'s honestly non-nullable
 * fields.
 */
interface RawHourlyForecast extends Omit<HourlyForecast, "waveHeightM" | "wavePeriodS"> {
  waveHeightM: number | null;
  wavePeriodS: number | null;
}

/**
 * True once every legal-window hour (09:00-18:00) has a real, non-null wave reading from the primary
 * marine model. Hours outside the legal window aren't checked — nothing downstream consumes them
 * (`runDailyBatch` already filters to `isWithinLegalWindow` hours only), so their nullness can't
 * affect the cutoff. See issue #87.
 */
function hasRealLegalWindowWaveData(hours: RawHourlyForecast[]): boolean {
  return hours
    .filter((hour) => isWithinLegalWindow(hour.hour))
    .every((hour) => hour.waveHeightM !== null && hour.wavePeriodS !== null);
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

    const hoursByDate = new Map<string, RawHourlyForecast[]>();

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
    // this is already ascending by date without a separate sort. Walk dates in that order and stop
    // at the first one whose legal window has any null wave reading — the marine model's wave
    // horizon is a hard cutoff that doesn't resume once it ends, so that date and every later date
    // are omitted entirely rather than persisting a fabricated reading (issue #87).
    const dailyForecasts: DailyForecast[] = [];
    for (const [date, hours] of hoursByDate) {
      if (!hasRealLegalWindowWaveData(hours)) break;
      dailyForecasts.push({
        date,
        hours: hours.map((hour) => ({ ...hour, waveHeightM: hour.waveHeightM as number, wavePeriodS: hour.wavePeriodS as number })),
      });
    }
    return dailyForecasts;
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
