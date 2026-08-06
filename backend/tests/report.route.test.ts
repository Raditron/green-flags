import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../src/presentation/app";
import { MongoHealthcheckRepository } from "../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "../src/infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "../src/infrastructure/repositories/mongoPredictionRepository";
import { MongoReportRepository } from "../src/infrastructure/repositories/mongoReportRepository";
import { MongoUserRepository } from "../src/infrastructure/repositories/mongoUserRepository";
import { stubBatchDependencies } from "./helpers/stubBatchDependencies";
import { stubAuthTokenVerifier } from "./helpers/stubAuthTokenVerifier";

const BEACH_ID = "beach-a";
const VERIFIED_UID = "uid-verified";
const OTHER_VERIFIED_UID = "uid-verified-2";
const UNVERIFIED_UID = "uid-unverified";
const DATE = "2026-08-05";
const HOUR = 15;

// 2026-08-05T12:00:00Z is 15:00 Europe/Sofia (summer, UTC+3) — within the June-September season
// and the 09:00-18:30 legal window, matching HOUR above.
const IN_SEASON_IN_WINDOW = new Date("2026-08-05T12:00:00Z");

const GREEN_PREDICTION_DOC = {
  _id: `${BEACH_ID}_${DATE}`,
  beachId: BEACH_ID,
  date: DATE,
  hourlyPredictions: [
    {
      hour: HOUR,
      flagColor: "green",
      ripCurrentRisk: "low",
      forecast: { windSpeedMps: 2, windDirectionDeg: 0, waveHeightM: 0.1, wavePeriodS: 3, stormWarningActive: false },
      confidence: { percent: 98, basis: "certain", sampleSize: 0 },
    },
  ],
  computedAt: new Date(),
};

describe("feedback submission (POST /api/beaches/:beachId/reports, GET /api/beaches/:beachId/report-status)", () => {
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
    await db.collection("predictions").deleteMany({});
    await db.collection("reports").deleteMany({});
    await db.collection("users").deleteMany({});
    // Fake only Date — supertest/mongodb-memory-server rely on real timers/sockets for I/O.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(IN_SEASON_IN_WINDOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function buildApp() {
    return createApp({
      ...stubBatchDependencies(),
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      predictionRepository: new MongoPredictionRepository(db),
      reportRepository: new MongoReportRepository(db),
      userRepository: new MongoUserRepository(db),
      authTokenVerifier: stubAuthTokenVerifier({
        "verified-token": { uid: VERIFIED_UID, emailVerified: true },
        "verified-token-2": { uid: OTHER_VERIFIED_UID, emailVerified: true },
        "unverified-token": { uid: UNVERIFIED_UID, emailVerified: false },
      }),
    });
  }

  describe("POST /api/beaches/:beachId/reports", () => {
    it("accepts a matching report and reports agreement with the rule engine's call", async () => {
      await db.collection("predictions").insertOne(GREEN_PREDICTION_DOC);

      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "green" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ agreesWithPrediction: true });

      const stored = await db.collection("reports").findOne({ _id: `${BEACH_ID}_${VERIFIED_UID}_${DATE}` } as never);
      expect(stored).toMatchObject({ beachId: BEACH_ID, userId: VERIFIED_UID, date: DATE, hour: HOUR, agreesWithPrediction: true });
    });

    it("rejects with 401 when no Authorization header is provided", async () => {
      const response = await request(buildApp()).post(`/api/beaches/${BEACH_ID}/reports`).send({ flagColor: "green" });

      expect(response.status).toBe(401);
    });

    it("rejects with 401 when the bearer token is invalid", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer garbage-token")
        .send({ flagColor: "green" });

      expect(response.status).toBe(401);
    });

    it("rejects with 403 and a distinguishable code when the email is unverified", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer unverified-token")
        .send({ flagColor: "green" });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: "email_not_verified" });
    });

    it("rejects with 400 for an invalid flagColor", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "purple" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "invalid_flag_color" });
    });

    it("rejects with 403 outside_window outside the 09:00-18:30 window, in season", async () => {
      vi.setSystemTime(new Date("2026-08-05T04:00:00Z")); // 07:00 Sofia

      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "green" });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: "outside_window" });
    });

    it("rejects with 403 outside_season outside June-September, within window hours", async () => {
      vi.setSystemTime(new Date("2026-11-05T12:00:00Z")); // 15:00 Sofia, November

      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "green" });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: "outside_season" });
    });

    it("rejects with 404 when no prediction has been computed for this beach/date/hour", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "green" });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: "no_prediction" });
    });

    it("rejects a second same-day submission from the same user with 409 already_reported", async () => {
      await db.collection("predictions").insertOne(GREEN_PREDICTION_DOC);
      const app = buildApp();

      const first = await request(app)
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "green" });
      expect(first.status).toBe(200);

      const second = await request(app)
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token")
        .send({ flagColor: "red" });

      expect(second.status).toBe(409);
      expect(second.body).toMatchObject({ code: "already_reported" });
    });

    it("allows a different user to submit a report for the same beach and day", async () => {
      await db.collection("predictions").insertOne(GREEN_PREDICTION_DOC);
      const app = buildApp();

      await request(app).post(`/api/beaches/${BEACH_ID}/reports`).set("Authorization", "Bearer verified-token").send({ flagColor: "green" });
      const response = await request(app)
        .post(`/api/beaches/${BEACH_ID}/reports`)
        .set("Authorization", "Bearer verified-token-2")
        .send({ flagColor: "green" });

      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/beaches/:beachId/report-status", () => {
    it("rejects with 401 when no Authorization header is provided", async () => {
      const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/report-status`);

      expect(response.status).toBe(401);
    });

    it("reports alreadyReportedToday: false before any submission", async () => {
      const response = await request(buildApp())
        .get(`/api/beaches/${BEACH_ID}/report-status`)
        .set("Authorization", "Bearer verified-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ alreadyReportedToday: false });
    });

    it("reports alreadyReportedToday: true after a successful submission", async () => {
      await db.collection("predictions").insertOne(GREEN_PREDICTION_DOC);
      const app = buildApp();
      await request(app).post(`/api/beaches/${BEACH_ID}/reports`).set("Authorization", "Bearer verified-token").send({ flagColor: "green" });

      const response = await request(app)
        .get(`/api/beaches/${BEACH_ID}/report-status`)
        .set("Authorization", "Bearer verified-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ alreadyReportedToday: true });
    });

    it("does not require email verification, so an ineligible reason can still be surfaced", async () => {
      const response = await request(buildApp())
        .get(`/api/beaches/${BEACH_ID}/report-status`)
        .set("Authorization", "Bearer unverified-token");

      expect(response.status).toBe(200);
    });
  });
});
