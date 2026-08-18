import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoPredictionRepository } from "../../../../src/infrastructure/repositories/mongoPredictionRepository";
import { BEACH_SEED_DATA } from "../../../../src/infrastructure/seed/beachSeedData";
import { currentOrNearestLegalHour, todayInSofia } from "../../../../src/domain/shared/today";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";

describe("GET /api/beaches", () => {
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
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      ...stubBatchDependencies(),
    });
  }

  it("requires no authentication and returns all seeded beaches", async () => {
    const response = await request(buildApp()).get("/api/beaches");

    expect(response.status).toBe(200);
    expect(response.body.beaches).toHaveLength(BEACH_SEED_DATA.length);
  });

  it("returns each beach's name, coordinates, and quirk notes", async () => {
    const response = await request(buildApp()).get("/api/beaches");

    const varna = response.body.beaches.find((beach: { id: string }) => beach.id === "varna-central-beach");
    expect(varna).toMatchObject({
      name: "Varna Central Beach",
      lat: 43.193,
      long: 27.928,
      quirkNotes: "Bay-sheltered, generally calmer than open coast",
    });
    expect(varna.mapImageDataUrl).toBeUndefined();
  });

  it("preserves the founder-curated north-to-south beach order", async () => {
    const response = await request(buildApp()).get("/api/beaches");

    expect(response.body.beaches.map((beach: { id: string }) => beach.id)).toEqual(
      BEACH_SEED_DATA.map((beach) => beach.id)
    );
  });

  it("leaves currentFlagColor and currentConfidencePercent undefined when today's batch hasn't run yet", async () => {
    const response = await request(buildApp()).get("/api/beaches");

    const varna = response.body.beaches.find((beach: { id: string }) => beach.id === "varna-central-beach");
    expect(varna.currentFlagColor).toBeUndefined();
    expect(varna.currentConfidencePercent).toBeUndefined();
  });

  it("shows a beach's current-hour flag color and confidence once today's batch has persisted predictions", async () => {
    await db.collection("predictions").deleteMany({});
    const now = new Date();
    const date = todayInSofia(now);
    const hour = currentOrNearestLegalHour(now);
    await db.collection("predictions").insertOne({
      _id: `varna-central-beach_${date}_${date}`,
      beachId: "varna-central-beach",
      date,
      issuedDate: date,
      hourlyPredictions: [
        {
          hour,
          flagColor: "yellow",
          ripCurrentRisk: "moderate",
          forecast: { windSpeedMps: 8, windDirectionDeg: 90, waveHeightM: 0.6, wavePeriodS: 6, stormWarningActive: false },
          confidence: { percent: 76, basis: "prior", sampleSize: 0 },
        },
      ],
      computedAt: now,
    });

    const app = createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      ...stubBatchDependencies(),
      predictionRepository: new MongoPredictionRepository(db),
    });

    const response = await request(app).get("/api/beaches");

    const varna = response.body.beaches.find((beach: { id: string }) => beach.id === "varna-central-beach");
    expect(varna.currentFlagColor).toBe("yellow");
    expect(varna.currentConfidencePercent).toBe(76);
    expect(varna.issuedDate).toBe(date);

    await db.collection("predictions").deleteMany({});
  });

  it("returns 503 when the database is unreachable", async () => {
    const failingRepository = {
      listBeaches: async () => {
        throw new Error("connection lost");
      },
    };
    const app = createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: failingRepository,
      ...stubBatchDependencies(),
    });

    const response = await request(app).get("/api/beaches");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});
