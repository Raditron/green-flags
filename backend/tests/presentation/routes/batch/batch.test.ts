import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "../../../../src/infrastructure/repositories/mongoPredictionRepository";
import { MongoSelfConsistencyRepository } from "../../../../src/infrastructure/repositories/mongoSelfConsistencyRepository";
import { MongoReportRepository } from "../../../../src/infrastructure/repositories/mongoReportRepository";
import { OpenMeteoForecastClient } from "../../../../src/infrastructure/openMeteo/openMeteoForecastClient";
import { MeteoalarmStormWarningClient } from "../../../../src/infrastructure/meteoalarm/meteoalarmStormWarningClient";
import { BEACH_SEED_DATA } from "../../../../src/infrastructure/seed/beachSeedData";

const BATCH_SECRET = "test-batch-secret";

// Hours 8 and 19 sit just outside the legal window (09:00-18:30); 9 and 18 sit at its edges. Included
// here so the E2E run exercises the same boundary the legalWindow unit tests cover, end to end.
const MARINE_FIXTURE = {
  hourly: {
    time: ["2026-08-05T08:00", "2026-08-05T09:00", "2026-08-05T18:00", "2026-08-05T19:00"],
    wave_height: [0.1, 0.1, 0.1, 0.1],
    wave_period: [3, 3, 3, 3],
    swell_wave_height: [0.1, 0.1, 0.1, 0.1],
  },
};

const CALM_WEATHER_FIXTURE = {
  hourly: {
    time: ["2026-08-05T08:00", "2026-08-05T09:00", "2026-08-05T18:00", "2026-08-05T19:00"],
    wind_speed_10m: [2, 2, 2, 2],
    wind_direction_10m: [0, 0, 0, 0],
  },
};

const EMPTY_METEOALARM_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:cap="urn:oasis:names:tc:emergency:cap:1.2">
  <id>tag:meteoalarm.org,2021-02-19:BG</id>
  <updated>2026-08-05T15:06:33.734086Z</updated>
</feed>`;

// Onset/expires span an enormous range so the fixture is reliably "active" regardless of the real
// wall-clock time the test happens to run at (the batch route always evaluates against `new Date()`).
const ACTIVE_METEOALARM_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:cap="urn:oasis:names:tc:emergency:cap:1.2">
  <id>tag:meteoalarm.org,2021-02-19:BG</id>
  <updated>2026-08-05T15:06:33.734086Z</updated>
  <entry>
    <cap:areaDesc>Varna</cap:areaDesc>
    <cap:event>Wind</cap:event>
    <cap:severity>Severe</cap:severity>
    <cap:onset>2000-01-01T00:00:00+00:00</cap:onset>
    <cap:expires>2100-01-01T00:00:00+00:00</cap:expires>
    <title>Warning issued for Bulgaria - Varna</title>
  </entry>
</feed>`;

function stubExternalApis(meteoalarmFeed: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("marine-api.open-meteo.com")) {
        return new Response(JSON.stringify(MARINE_FIXTURE), { status: 200 });
      }
      if (url.includes("api.open-meteo.com")) {
        return new Response(JSON.stringify(CALM_WEATHER_FIXTURE), { status: 200 });
      }
      if (url.includes("feeds.meteoalarm.org")) {
        return new Response(meteoalarmFeed, { status: 200 });
      }
      throw new Error(`Unexpected fetch to ${url}`);
    })
  );
}

describe("POST /api/batch", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    db = client.db("green-flags-test");
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection("beaches").deleteMany({});
    await db.collection("predictions").deleteMany({});
    await db.collection("selfConsistencyStats").deleteMany({});
    await db.collection("beaches").insertMany(
      BEACH_SEED_DATA.slice(0, 2).map((beach) => ({
        _id: beach.id,
        name: beach.name,
        lat: beach.lat,
        long: beach.long,
        quirkNotes: beach.quirkNotes,
        order: beach.order,
        onshoreWindDirectionDeg: beach.onshoreWindDirectionDeg,
        area: beach.area,
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function buildApp() {
    return createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      predictionRepository: new MongoPredictionRepository(db),
      selfConsistencyRepository: new MongoSelfConsistencyRepository(db),
      reportRepository: new MongoReportRepository(db),
      forecastProvider: new OpenMeteoForecastClient(),
      stormWarningProvider: new MeteoalarmStormWarningClient(),
      batchTriggerSecret: BATCH_SECRET,
    });
  }

  it("rejects the request when no secret header is provided", async () => {
    stubExternalApis(EMPTY_METEOALARM_FEED);

    const response = await request(buildApp()).post("/api/batch");

    expect(response.status).toBe(401);
    expect(await db.collection("predictions").countDocuments()).toBe(0);
  });

  it("rejects the request when the wrong secret is provided", async () => {
    stubExternalApis(EMPTY_METEOALARM_FEED);

    const response = await request(buildApp()).post("/api/batch").set("X-Batch-Secret", "wrong-secret");

    expect(response.status).toBe(401);
    expect(await db.collection("predictions").countDocuments()).toBe(0);
  });

  it("fetches forecasts, evaluates the legal window, and persists calm predictions per beach", async () => {
    stubExternalApis(EMPTY_METEOALARM_FEED);

    const response = await request(buildApp()).post("/api/batch").set("X-Batch-Secret", BATCH_SECRET);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", beachesProcessed: 2 });

    const persisted = await db.collection("predictions").find({}).toArray();
    expect(persisted).toHaveLength(2);

    const firstBeach = persisted.find((doc) => doc.beachId === BEACH_SEED_DATA[0].id);
    if (!firstBeach) throw new Error("expected a persisted prediction for the first seeded beach");
    expect(firstBeach.date).toBe("2026-08-05");
    // Boundary condition: hour 8 (before 09:00) and hour 19 (after 18:30) are dropped; 9 and 18 kept.
    expect(firstBeach.hourlyPredictions.map((p: { hour: number }) => p.hour)).toEqual([9, 18]);
    for (const prediction of firstBeach.hourlyPredictions) {
      expect(prediction.flagColor).toBe("green");
      expect(prediction.forecast.stormWarningActive).toBe(false);
    }
  });

  it("isolates a per-beach upstream failure: other beaches still persist and the response reports it", async () => {
    const failingBeachLat = String(BEACH_SEED_DATA[0].lat);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes("marine-api.open-meteo.com")) {
          if (new URL(url).searchParams.get("latitude") === failingBeachLat) {
            return new Response("Internal Server Error", { status: 500 });
          }
          return new Response(JSON.stringify(MARINE_FIXTURE), { status: 200 });
        }
        if (url.includes("api.open-meteo.com")) {
          return new Response(JSON.stringify(CALM_WEATHER_FIXTURE), { status: 200 });
        }
        if (url.includes("feeds.meteoalarm.org")) {
          return new Response(EMPTY_METEOALARM_FEED, { status: 200 });
        }
        throw new Error(`Unexpected fetch to ${url}`);
      })
    );

    const response = await request(buildApp()).post("/api/batch").set("X-Batch-Secret", BATCH_SECRET);

    expect(response.status).toBe(207);
    expect(response.body.status).toBe("partial");
    expect(response.body.beachesProcessed).toBe(1);
    expect(response.body.failures).toEqual([
      expect.objectContaining({ beachId: BEACH_SEED_DATA[0].id }),
    ]);

    const persisted = await db.collection("predictions").find({}).toArray();
    expect(persisted).toHaveLength(1);
    expect(persisted[0].beachId).toBe(BEACH_SEED_DATA[1].id);
  });

  it("folds an active coastal storm warning from Meteoalarm into every persisted hour", async () => {
    stubExternalApis(ACTIVE_METEOALARM_FEED);

    const response = await request(buildApp()).post("/api/batch").set("X-Batch-Secret", BATCH_SECRET);

    expect(response.status).toBe(200);

    const persisted = await db.collection("predictions").find({}).toArray();
    expect(persisted).toHaveLength(2);
    for (const beachPredictions of persisted) {
      for (const prediction of beachPredictions.hourlyPredictions) {
        expect(prediction.flagColor).toBe("red");
        expect(prediction.forecast.stormWarningActive).toBe(true);
      }
    }
  });
});
