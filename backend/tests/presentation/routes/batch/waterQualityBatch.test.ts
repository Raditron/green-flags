import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { BEACH_SEED_DATA } from "../../../../src/infrastructure/seed/beachSeedData";
import { WaterQualityProvider } from "../../../../src/domain/ports/batch/waterQualityProvider";
import { WaterQualitySample } from "../../../../src/domain/waterQualitySample";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";

const BATCH_SECRET = "test-batch-secret";
const [BEACH_A, BEACH_B] = BEACH_SEED_DATA;

const CLEAN_SAMPLE: WaterQualitySample = {
  sampleDate: "2026-08-18",
  intestinalEnterococci: { value: 10, belowDetectionLimit: false },
  eColi: { value: 10, belowDetectionLimit: false },
};

describe("POST /api/batch/water-quality", () => {
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
      [BEACH_A, BEACH_B].map((beach) => ({
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

  function buildApp(waterQualityProvider: WaterQualityProvider) {
    return createApp({
      ...stubBatchDependencies(),
      beachRepository: new MongoBeachRepository(db),
      waterQualityProvider,
      batchTriggerSecret: BATCH_SECRET,
    });
  }

  it("rejects the request when no secret header is provided", async () => {
    const app = buildApp({ fetchLatestSample: async () => null });

    const response = await request(app).post("/api/batch/water-quality");

    expect(response.status).toBe(401);
  });

  it("rejects the request when the wrong secret is provided", async () => {
    const app = buildApp({ fetchLatestSample: async () => null });

    const response = await request(app).post("/api/batch/water-quality").set("X-Batch-Secret", "wrong-secret");

    expect(response.status).toBe(401);
  });

  it("persists a computed water-quality rating onto each mapped beach's own document", async () => {
    const app = buildApp({
      fetchLatestSample: async (beachId) => (beachId === BEACH_A.id ? CLEAN_SAMPLE : null),
    });

    const response = await request(app).post("/api/batch/water-quality").set("X-Batch-Secret", BATCH_SECRET);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", beachesProcessed: 2, failures: [] });

    const beachA = await db.collection("beaches").findOne({ _id: BEACH_A.id });
    expect(beachA?.waterQualityRating).toEqual({ band: "excellent", sampleDate: "2026-08-18" });

    const beachB = await db.collection("beaches").findOne({ _id: BEACH_B.id });
    expect(beachB?.waterQualityRating).toBeUndefined();
  });

  it("isolates a per-beach provider failure: other beaches still persist and the response reports it (207)", async () => {
    const app = buildApp({
      fetchLatestSample: async (beachId) => {
        if (beachId === BEACH_A.id) throw new Error("RZI Varna PDF request failed with status 500");
        return CLEAN_SAMPLE;
      },
    });

    const response = await request(app).post("/api/batch/water-quality").set("X-Batch-Secret", BATCH_SECRET);

    expect(response.status).toBe(207);
    expect(response.body.status).toBe("partial");
    expect(response.body.beachesProcessed).toBe(1);
    expect(response.body.failures).toEqual([expect.objectContaining({ beachId: BEACH_A.id })]);

    const beachB = await db.collection("beaches").findOne({ _id: BEACH_B.id });
    expect(beachB?.waterQualityRating).toEqual({ band: "excellent", sampleDate: "2026-08-18" });
  });
});
