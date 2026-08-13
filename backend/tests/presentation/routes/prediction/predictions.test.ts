import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoPredictionRepository } from "../../../../src/infrastructure/repositories/mongoPredictionRepository";
import { BEACH_SEED_DATA } from "../../../../src/infrastructure/seed/beachSeedData";
import { todayInSofia } from "../../../../src/domain/shared/today";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";

const BEACH_ID = BEACH_SEED_DATA[0].id;
const DATE = "2026-08-05";

const HOURLY_PREDICTIONS = [
  {
    hour: 9,
    flagColor: "green",
    ripCurrentRisk: "low",
    forecast: { windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3, stormWarningActive: false },
  },
  {
    hour: 18,
    flagColor: "yellow",
    ripCurrentRisk: "moderate",
    forecast: { windSpeedMps: 8, windDirectionDeg: 90, waveHeightM: 0.6, wavePeriodS: 6, stormWarningActive: false },
  },
];

describe("GET /api/beaches/:beachId/predictions", () => {
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

  it("requires no authentication and returns a seeded beach's hourly predictions for a given date", async () => {
    await db.collection("predictions").insertOne({
      _id: `${BEACH_ID}_${DATE}_${DATE}`,
      beachId: BEACH_ID,
      date: DATE,
      issuedDate: DATE,
      hourlyPredictions: HOURLY_PREDICTIONS,
      computedAt: new Date(),
    });

    const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/predictions?date=${DATE}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      beachId: BEACH_ID,
      date: DATE,
      hourlyPredictions: HOURLY_PREDICTIONS,
    });
  });

  it("returns the freshest (smallest-Lead) Prediction when several Leads exist for the same date", async () => {
    await db.collection("predictions").insertOne({
      _id: `${BEACH_ID}_${DATE}_2026-08-02`,
      beachId: BEACH_ID,
      date: DATE,
      issuedDate: "2026-08-02",
      hourlyPredictions: [{ ...HOURLY_PREDICTIONS[0], flagColor: "red" }],
      computedAt: new Date(),
    });
    await db.collection("predictions").insertOne({
      _id: `${BEACH_ID}_${DATE}_${DATE}`,
      beachId: BEACH_ID,
      date: DATE,
      issuedDate: DATE,
      hourlyPredictions: HOURLY_PREDICTIONS,
      computedAt: new Date(),
    });

    const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/predictions?date=${DATE}`);

    expect(response.status).toBe(200);
    expect(response.body.hourlyPredictions).toEqual(HOURLY_PREDICTIONS);
  });

  it("defaults to today's date (Europe/Sofia) when no date query param is given", async () => {
    const today = todayInSofia();
    await db.collection("predictions").insertOne({
      _id: `${BEACH_ID}_${today}_${today}`,
      beachId: BEACH_ID,
      date: today,
      issuedDate: today,
      hourlyPredictions: HOURLY_PREDICTIONS,
      computedAt: new Date(),
    });

    const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/predictions`);

    expect(response.status).toBe(200);
    expect(response.body.date).toBe(today);
  });

  it("returns 404 when no predictions have been persisted for that beach and date", async () => {
    const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/predictions?date=${DATE}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe("error");
  });

  it("returns 400 for a malformed date query param", async () => {
    const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/predictions?date=not-a-date`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
  });

  it("returns 400 for a malformed beachId", async () => {
    const response = await request(buildApp()).get(`/api/beaches/${encodeURIComponent("bad id")}/predictions?date=${DATE}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: "invalid_beach_id" });
  });

  it("returns 503 when the database is unreachable", async () => {
    const failingRepository = {
      saveDailyPredictions: async () => {},
      findByBeachAndDate: async () => {
        throw new Error("connection lost");
      },
      getDailyPredictions: async () => null,
      getIssuedPredictionsForTargetDate: async () => [],
    };
    const app = createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      ...stubBatchDependencies(),
      predictionRepository: failingRepository,
    });

    const response = await request(app).get(`/api/beaches/${BEACH_ID}/predictions?date=${DATE}`);

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});
