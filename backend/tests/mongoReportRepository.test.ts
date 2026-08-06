import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { MongoReportRepository } from "../src/infrastructure/repositories/mongoReportRepository";
import { DuplicateReportError } from "../src/domain/ports/reportRepository";

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

  describe("recordReport", () => {
    it("persists a new report", async () => {
      await repository.recordReport({
        beachId: BEACH_ID,
        userId: "u1",
        date: "2026-08-05",
        hour: 12,
        bucketKey: BUCKET_KEY,
        agreesWithPrediction: true,
      });

      const stored = await db.collection("reports").findOne({ beachId: BEACH_ID, userId: "u1" });
      expect(stored).toMatchObject({
        beachId: BEACH_ID,
        userId: "u1",
        date: "2026-08-05",
        hour: 12,
        bucketKey: BUCKET_KEY,
        agreesWithPrediction: true,
      });
    });

    it("throws DuplicateReportError on a second report from the same user for the same beach and date", async () => {
      const report = {
        beachId: BEACH_ID,
        userId: "u1",
        date: "2026-08-05",
        hour: 12,
        bucketKey: BUCKET_KEY,
        agreesWithPrediction: true,
      };
      await repository.recordReport(report);

      await expect(repository.recordReport({ ...report, hour: 13, agreesWithPrediction: false })).rejects.toThrow(
        DuplicateReportError
      );
    });

    it("allows the same user to report the same beach again on a different date", async () => {
      const report = {
        beachId: BEACH_ID,
        userId: "u1",
        date: "2026-08-05",
        hour: 12,
        bucketKey: BUCKET_KEY,
        agreesWithPrediction: true,
      };
      await repository.recordReport(report);

      await expect(repository.recordReport({ ...report, date: "2026-08-06" })).resolves.toBeUndefined();
    });
  });

  describe("hasReportedToday", () => {
    it("returns false when this user hasn't reported this beach on this date", async () => {
      expect(await repository.hasReportedToday(BEACH_ID, "u1", "2026-08-05")).toBe(false);
    });

    it("returns true once this user has reported this beach on this date", async () => {
      await repository.recordReport({
        beachId: BEACH_ID,
        userId: "u1",
        date: "2026-08-05",
        hour: 12,
        bucketKey: BUCKET_KEY,
        agreesWithPrediction: true,
      });

      expect(await repository.hasReportedToday(BEACH_ID, "u1", "2026-08-05")).toBe(true);
    });

    it("ignores reports from other users or other dates", async () => {
      await repository.recordReport({
        beachId: BEACH_ID,
        userId: "u1",
        date: "2026-08-05",
        hour: 12,
        bucketKey: BUCKET_KEY,
        agreesWithPrediction: true,
      });

      expect(await repository.hasReportedToday(BEACH_ID, "u2", "2026-08-05")).toBe(false);
      expect(await repository.hasReportedToday(BEACH_ID, "u1", "2026-08-06")).toBe(false);
    });
  });
});
