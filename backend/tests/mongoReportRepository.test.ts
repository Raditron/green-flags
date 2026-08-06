import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { MongoReportRepository } from "../src/infrastructure/repositories/mongoReportRepository";

const BEACH_ID = "beach-a";
const BUCKET_KEY = "beaufort-4_douglas-3";

describe("MongoReportRepository", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let repository: MongoReportRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    db = client.db("green-flags-test");
    repository = new MongoReportRepository(db);
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection("reports").deleteMany({});
  });

  describe("getBucketStats", () => {
    it("tallies hits and total across past dates for the given beach and bucket", async () => {
      await db.collection("reports").insertMany([
        { beachId: BEACH_ID, date: "2026-08-01", hour: 10, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u1", createdAt: new Date() },
        { beachId: BEACH_ID, date: "2026-08-02", hour: 11, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u2", createdAt: new Date() },
        { beachId: BEACH_ID, date: "2026-08-03", hour: 12, bucketKey: BUCKET_KEY, agreesWithPrediction: false, userId: "u3", createdAt: new Date() },
      ]);

      const result = await repository.getBucketStats(BEACH_ID, BUCKET_KEY, "2026-08-05");

      expect(result).toEqual({ hits: 2, total: 3 });
    });

    it("excludes the given date so today's reports aren't double-counted against the historical baseline", async () => {
      await db.collection("reports").insertMany([
        { beachId: BEACH_ID, date: "2026-08-01", hour: 10, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u1", createdAt: new Date() },
        { beachId: BEACH_ID, date: "2026-08-05", hour: 12, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u2", createdAt: new Date() },
      ]);

      const result = await repository.getBucketStats(BEACH_ID, BUCKET_KEY, "2026-08-05");

      expect(result).toEqual({ hits: 1, total: 1 });
    });

    it("ignores reports for other beaches or other buckets", async () => {
      await db.collection("reports").insertMany([
        { beachId: "beach-b", date: "2026-08-01", hour: 10, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u1", createdAt: new Date() },
        { beachId: BEACH_ID, date: "2026-08-01", hour: 10, bucketKey: "beaufort-1_douglas-1", agreesWithPrediction: true, userId: "u2", createdAt: new Date() },
      ]);

      const result = await repository.getBucketStats(BEACH_ID, BUCKET_KEY, "2026-08-05");

      expect(result).toEqual({ hits: 0, total: 0 });
    });

    it("returns zero totals when no reports exist yet", async () => {
      const result = await repository.getBucketStats(BEACH_ID, BUCKET_KEY, "2026-08-05");
      expect(result).toEqual({ hits: 0, total: 0 });
    });
  });

  describe("getTodaysReports", () => {
    it("tallies agree/total for the given beach, date, and hour only", async () => {
      await db.collection("reports").insertMany([
        { beachId: BEACH_ID, date: "2026-08-05", hour: 12, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u1", createdAt: new Date() },
        { beachId: BEACH_ID, date: "2026-08-05", hour: 12, bucketKey: BUCKET_KEY, agreesWithPrediction: false, userId: "u2", createdAt: new Date() },
        { beachId: BEACH_ID, date: "2026-08-05", hour: 13, bucketKey: BUCKET_KEY, agreesWithPrediction: true, userId: "u3", createdAt: new Date() },
      ]);

      const result = await repository.getTodaysReports(BEACH_ID, "2026-08-05", 12);

      expect(result).toEqual({ agree: 1, total: 2 });
    });
  });
});
