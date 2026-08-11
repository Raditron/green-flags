import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";

describe("GET /api/health", () => {
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
    await db.collection("healthchecks").deleteMany({});
  });

  it("writes a ping to MongoDB and reads it back in the response", async () => {
    const repository = new MongoHealthcheckRepository(db);
    const app = createApp({ healthcheckRepository: repository, beachRepository: new MongoBeachRepository(db), ...stubBatchDependencies() });

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.pingCount).toBe(1);
    expect(typeof response.body.lastPingAt).toBe("string");

    const stored = await db
      .collection<{ _id: string; pingCount: number }>("healthchecks")
      .findOne({ _id: "healthcheck" });
    expect(stored?.pingCount).toBe(1);
  });

  it("increments the ping count on every subsequent call", async () => {
    const repository = new MongoHealthcheckRepository(db);
    const app = createApp({ healthcheckRepository: repository, beachRepository: new MongoBeachRepository(db), ...stubBatchDependencies() });

    await request(app).get("/api/health");
    await request(app).get("/api/health");
    const response = await request(app).get("/api/health");

    expect(response.body.pingCount).toBe(3);
  });

  it("returns 503 when the database is unreachable", async () => {
    const failingRepository = {
      recordPing: async () => {
        throw new Error("connection lost");
      },
    };
    const app = createApp({ healthcheckRepository: failingRepository, beachRepository: new MongoBeachRepository(db), ...stubBatchDependencies() });

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });
});
