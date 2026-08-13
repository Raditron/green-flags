import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenMeteoForecastClient } from "../src/infrastructure/openMeteo/openMeteoForecastClient";

const MARINE_FIXTURE = {
  hourly: {
    time: ["2026-08-05T08:00", "2026-08-05T09:00", "2026-08-06T08:00", "2026-08-06T09:00"],
    wave_height: [0.18, 0.2, 0.22, 0.24],
    wave_period: [4.3, 4.1, 4.0, 3.9],
    swell_wave_height: [0.18, 0.18, 0.2, 0.2],
  },
};

const WEATHER_FIXTURE = {
  hourly: {
    time: ["2026-08-05T08:00", "2026-08-05T09:00", "2026-08-06T08:00", "2026-08-06T09:00"],
    wind_speed_10m: [0.72, 0.5, 1.1, 1.4],
    wind_direction_10m: [236, 307, 120, 140],
  },
};

function stubFetch() {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      calls.push(url);
      const body = url.includes("marine-api.open-meteo.com") ? MARINE_FIXTURE : WEATHER_FIXTURE;
      return new Response(JSON.stringify(body), { status: 200 });
    })
  );
  return calls;
}

describe("OpenMeteoForecastClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests both the marine and weather forecast APIs for a 7-day window", async () => {
    const calls = stubFetch();
    const client = new OpenMeteoForecastClient();

    await client.fetchForecastWindow({ lat: 43.19, long: 27.92 });

    expect(calls).toHaveLength(2);
    const marineUrl = new URL(calls.find((url) => url.includes("marine-api.open-meteo.com"))!);
    expect(marineUrl.searchParams.get("latitude")).toBe("43.19");
    expect(marineUrl.searchParams.get("longitude")).toBe("27.92");
    expect(marineUrl.searchParams.get("timezone")).toBe("auto");
    expect(marineUrl.searchParams.get("forecast_days")).toBe("7");

    const weatherUrl = new URL(calls.find((url) => url.includes("api.open-meteo.com") && !url.includes("marine"))!);
    expect(weatherUrl.searchParams.get("latitude")).toBe("43.19");
    expect(weatherUrl.searchParams.get("wind_speed_unit")).toBe("ms");
    expect(weatherUrl.searchParams.get("forecast_days")).toBe("7");
  });

  it("groups merged hourly data into one DailyForecast per date, in ascending date order", async () => {
    stubFetch();
    const client = new OpenMeteoForecastClient();

    const result = await client.fetchForecastWindow({ lat: 43.19, long: 27.92 });

    expect(result.map((day) => day.date)).toEqual(["2026-08-05", "2026-08-06"]);
    expect(result[0].hours).toEqual([
      { hour: 8, windSpeedMps: 0.72, windDirectionDeg: 236, waveHeightM: 0.18, wavePeriodS: 4.3, swellHeightM: 0.18 },
      { hour: 9, windSpeedMps: 0.5, windDirectionDeg: 307, waveHeightM: 0.2, wavePeriodS: 4.1, swellHeightM: 0.18 },
    ]);
    expect(result[1].hours).toEqual([
      { hour: 8, windSpeedMps: 1.1, windDirectionDeg: 120, waveHeightM: 0.22, wavePeriodS: 4.0, swellHeightM: 0.2 },
      { hour: 9, windSpeedMps: 1.4, windDirectionDeg: 140, waveHeightM: 0.24, wavePeriodS: 3.9, swellHeightM: 0.2 },
    ]);
  });

  it("throws when the marine API responds with a non-2xx status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes("marine-api.open-meteo.com")) {
          return new Response("server error", { status: 500 });
        }
        return new Response(JSON.stringify(WEATHER_FIXTURE), { status: 200 });
      })
    );
    const client = new OpenMeteoForecastClient();

    await expect(client.fetchForecastWindow({ lat: 43.19, long: 27.92 })).rejects.toThrow(/500/);
  });
});
