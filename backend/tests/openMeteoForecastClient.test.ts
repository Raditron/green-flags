import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenMeteoForecastClient } from "../src/infrastructure/openMeteo/openMeteoForecastClient";

const MARINE_FIXTURE = {
  hourly: {
    time: ["2026-08-05T08:00", "2026-08-05T09:00", "2026-08-05T18:00"],
    wave_height: [0.18, 0.2, 0.28],
    wave_period: [4.3, 4.1, 3.45],
    swell_wave_height: [0.18, 0.18, 0.28],
  },
};

const WEATHER_FIXTURE = {
  hourly: {
    time: ["2026-08-05T08:00", "2026-08-05T09:00", "2026-08-05T18:00"],
    wind_speed_10m: [0.72, 0.5, 2.97],
    wind_direction_10m: [236, 307, 110],
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

  it("requests both the marine and weather forecast APIs with the beach coordinates", async () => {
    const calls = stubFetch();
    const client = new OpenMeteoForecastClient();

    await client.fetchDailyForecast({ lat: 43.19, long: 27.92 });

    expect(calls).toHaveLength(2);
    const marineUrl = new URL(calls.find((url) => url.includes("marine-api.open-meteo.com"))!);
    expect(marineUrl.searchParams.get("latitude")).toBe("43.19");
    expect(marineUrl.searchParams.get("longitude")).toBe("27.92");
    expect(marineUrl.searchParams.get("timezone")).toBe("auto");

    const weatherUrl = new URL(calls.find((url) => url.includes("api.open-meteo.com") && !url.includes("marine"))!);
    expect(weatherUrl.searchParams.get("latitude")).toBe("43.19");
    expect(weatherUrl.searchParams.get("wind_speed_unit")).toBe("ms");
  });

  it("merges marine and weather hourly data by hour of day, in the beach's own local time", async () => {
    stubFetch();
    const client = new OpenMeteoForecastClient();

    const result = await client.fetchDailyForecast({ lat: 43.19, long: 27.92 });

    expect(result.date).toBe("2026-08-05");
    expect(result.hours).toEqual([
      { hour: 8, windSpeedMps: 0.72, windDirectionDeg: 236, waveHeightM: 0.18, wavePeriodS: 4.3, swellHeightM: 0.18 },
      { hour: 9, windSpeedMps: 0.5, windDirectionDeg: 307, waveHeightM: 0.2, wavePeriodS: 4.1, swellHeightM: 0.18 },
      { hour: 18, windSpeedMps: 2.97, windDirectionDeg: 110, waveHeightM: 0.28, wavePeriodS: 3.45, swellHeightM: 0.28 },
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

    await expect(client.fetchDailyForecast({ lat: 43.19, long: 27.92 })).rejects.toThrow(/500/);
  });
});
