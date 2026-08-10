import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../src/presentation/app";
import { MongoBeachRepository } from "../src/infrastructure/repositories/mongoBeachRepository";
import { MongoHealthcheckRepository } from "../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoPredictionRepository } from "../src/infrastructure/repositories/mongoPredictionRepository";
import { BEACH_SEED_DATA } from "../src/infrastructure/seed/beachSeedData";
import { todayInSofia } from "../src/domain/today";
import { stubBatchDependencies } from "./helpers/stubBatchDependencies";

const BEACH_ID = BEACH_SEED_DATA[0].id;

const HOURLY_PREDICTION = {
  hour: 12,
  flagColor: "green",
  ripCurrentRisk: "low",
  forecast: { windSpeedMps: 3, windDirectionDeg: 180, waveHeightM: 0.3, wavePeriodS: 4, stormWarningActive: false },
  confidence: { percent: 90, basis: "prior", sampleSize: 0 },
  readableWindSpeed: "gentle breeze",
  readableSeaState: "smooth",
};

describe("GET /api/daily-summary", () => {
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
    await db.collection("beaches").insertMany(
      BEACH_SEED_DATA.map((beach) => ({
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

  function buildApp() {
    return createApp({
      ...stubBatchDependencies(),
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      predictionRepository: new MongoPredictionRepository(db),
    });
  }

  it("requires no authentication and aggregates today's persisted predictions into a sea-wide and per-area summary", async () => {
    const today = todayInSofia();
    await db.collection("predictions").insertOne({
      _id: `${BEACH_ID}_${today}`,
      beachId: BEACH_ID,
      date: today,
      hourlyPredictions: [HOURLY_PREDICTION],
      computedAt: new Date(),
    });

    const response = await request(buildApp()).get("/api/daily-summary");

    expect(response.status).toBe(200);
    expect(response.body.averageAttributesBySea.sampleSize).toBe(1);
    expect(response.body.averageAttributesBySea.dominantFlagColor).toBe("green");
    expect(response.body.averageAttributesByArea).toHaveLength(1);
  });

  it("ignores predictions left over from previous days' batch runs", async () => {
    await db.collection("predictions").insertOne({
      _id: `${BEACH_ID}_2020-01-01`,
      beachId: BEACH_ID,
      date: "2020-01-01",
      hourlyPredictions: [HOURLY_PREDICTION],
      computedAt: new Date(),
    });

    const response = await request(buildApp()).get("/api/daily-summary");

    expect(response.status).toBe(200);
    expect(response.body.averageAttributesBySea.sampleSize).toBe(0);
  });

  it("rate-limits repeated requests from the same client", async () => {
    const app = buildApp();
    const REQUESTS_PAST_THE_LIMIT = 31;

    let lastStatus = 0;
    for (let i = 0; i < REQUESTS_PAST_THE_LIMIT; i++) {
      lastStatus = (await request(app).get("/api/daily-summary")).status;
    }

    expect(lastStatus).toBe(429);
  });

  it("returns 503 when the database is unreachable", async () => {
    const failingRepository = {
      saveDailyPredictions: async () => {},
      findByBeachAndDate: async () => null,
      getDailyPredictions: async () => {
        throw new Error("connection lost");
      },
    };
    const app = createApp({
      ...stubBatchDependencies(),
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      predictionRepository: failingRepository,
    });

    const response = await request(app).get("/api/daily-summary");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});
