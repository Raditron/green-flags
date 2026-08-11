import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { MongoUserRepository } from "../../../../src/infrastructure/repositories/mongoUserRepository";
import { MongoPredictionRepository } from "../../../../src/infrastructure/repositories/mongoPredictionRepository";
import { BEACH_SEED_DATA } from "../../../../src/infrastructure/seed/beachSeedData";
import { currentOrNearestLegalHour, todayInSofia } from "../../../../src/domain/shared/today";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";
import { stubAuthTokenVerifier } from "../../../helpers/stubAuthTokenVerifier";

const UID = "uid-saved-beaches";
const SAVED_BEACH_ID = "varna-central-beach";

describe("GET /api/beaches/saved", () => {
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
    await db.collection("predictions").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("users").insertOne({
      _id: UID,
      emailVerified: true,
      savedBeaches: [SAVED_BEACH_ID],
      createdAt: new Date(),
    } as never);
  });

  function buildApp() {
    return createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      ...stubBatchDependencies(),
      userRepository: new MongoUserRepository(db),
      predictionRepository: new MongoPredictionRepository(db),
      authTokenVerifier: stubAuthTokenVerifier({
        "valid-token": { uid: UID, emailVerified: true },
      }),
    });
  }

  it("requires authentication", async () => {
    const response = await request(buildApp()).get("/api/beaches/saved");

    expect(response.status).toBe(401);
  });

  it("returns the user's saved beaches with currentFlagColor undefined when today's batch hasn't run yet", async () => {
    const response = await request(buildApp())
      .get("/api/beaches/saved")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ id: SAVED_BEACH_ID });
    expect(response.body[0].currentFlagColor).toBeUndefined();
  });

  it("shows the same current-hour flag color and confidence today's batch persisted, matching /api/beaches", async () => {
    const now = new Date();
    const date = todayInSofia(now);
    const hour = currentOrNearestLegalHour(now);
    await db.collection("predictions").insertOne({
      _id: `${SAVED_BEACH_ID}_${date}`,
      beachId: SAVED_BEACH_ID,
      date,
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

    const app = buildApp();

    const [savedResponse, beachesResponse] = await Promise.all([
      request(app).get("/api/beaches/saved").set("Authorization", "Bearer valid-token"),
      request(app).get("/api/beaches"),
    ]);

    const savedVarna = savedResponse.body.find((beach: { id: string }) => beach.id === SAVED_BEACH_ID);
    const listedVarna = beachesResponse.body.beaches.find(
      (beach: { id: string }) => beach.id === SAVED_BEACH_ID
    );

    expect(savedVarna.currentFlagColor).toBe("yellow");
    expect(savedVarna.currentConfidencePercent).toBe(76);
    expect(savedVarna.currentFlagColor).toBe(listedVarna.currentFlagColor);
    expect(savedVarna.currentConfidencePercent).toBe(listedVarna.currentConfidencePercent);
  });

  it("returns 503 when the database is unreachable", async () => {
    const app = createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      ...stubBatchDependencies(),
      userRepository: {
        findOrCreate: async () => {
          throw new Error("connection refused");
        },
        getUserById: async () => {
          throw new Error("connection refused");
        },
        update: async () => {
          throw new Error("connection refused");
        },
      },
      predictionRepository: new MongoPredictionRepository(db),
      authTokenVerifier: stubAuthTokenVerifier({
        "valid-token": { uid: UID, emailVerified: true },
      }),
    });

    const response = await request(app).get("/api/beaches/saved").set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});
