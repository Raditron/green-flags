import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "../../../../src/infrastructure/repositories/mongoPredictionRepository";
import { MongoReportRepository } from "../../../../src/infrastructure/repositories/mongoReportRepository";
import { MongoUserRepository } from "../../../../src/infrastructure/repositories/mongoUserRepository";
import { MongoCommentRepository } from "../../../../src/infrastructure/repositories/mongoCommentRepository";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";
import { stubAuthTokenVerifier } from "../../../helpers/stubAuthTokenVerifier";

const BEACH_ID = "beach-a";
const OTHER_BEACH_ID = "beach-b";
const VERIFIED_UID = "uid-verified";
const VERIFIED_DISPLAY_NAME = "Verified Visitor";
const VERIFIED_EMAIL = "verified@example.com";
const OTHER_VERIFIED_UID = "uid-verified-2";
const UNVERIFIED_UID = "uid-unverified";

describe("comments (GET/POST /api/beaches/:beachId/comments, DELETE /api/beaches/:beachId/comments/:commentId)", () => {
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
    await db.collection("comments").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("beaches").insertMany([
      { _id: BEACH_ID, name: "Beach A", lat: 0, long: 0, order: 0, onshoreWindDirectionDeg: 75, area: "Varna" },
      { _id: OTHER_BEACH_ID, name: "Beach B", lat: 0, long: 0, order: 1, onshoreWindDirectionDeg: 75, area: "Varna" },
    ]);
  });

  function buildApp() {
    return createApp({
      ...stubBatchDependencies(),
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      predictionRepository: new MongoPredictionRepository(db),
      reportRepository: new MongoReportRepository(db),
      userRepository: new MongoUserRepository(db),
      commentRepository: new MongoCommentRepository(db),
      authTokenVerifier: stubAuthTokenVerifier({
        "verified-token": { uid: VERIFIED_UID, emailVerified: true, email: VERIFIED_EMAIL, displayName: VERIFIED_DISPLAY_NAME },
        "verified-token-2": { uid: OTHER_VERIFIED_UID, emailVerified: true, email: "other@example.com", displayName: "Other Visitor" },
        "unverified-token": { uid: UNVERIFIED_UID, emailVerified: false },
      }),
    });
  }

  describe("GET /api/beaches/:beachId/comments", () => {
    it("returns an empty list for a beach with no comments", async () => {
      const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/comments`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("works unauthenticated", async () => {
      const response = await request(buildApp()).get(`/api/beaches/${BEACH_ID}/comments`);

      expect(response.status).toBe(200);
    });

    it("returns comments newest-first, each with the commenter's current displayName", async () => {
      const app = buildApp();

      await request(app)
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "first comment" });
      await request(app)
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token-2")
        .send({ description: "second comment" });

      const response = await request(app).get(`/api/beaches/${BEACH_ID}/comments`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        description: "second comment",
        displayName: "Other Visitor",
        email: "other@example.com",
        userId: OTHER_VERIFIED_UID,
      });
      expect(response.body[1]).toMatchObject({
        description: "first comment",
        displayName: VERIFIED_DISPLAY_NAME,
        email: VERIFIED_EMAIL,
        userId: VERIFIED_UID,
      });
    });

    it("reflects a commenter's current displayName, not a snapshot from post time", async () => {
      const app = buildApp();

      await request(app)
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "before rename" });
      await db.collection("users").updateOne({ _id: VERIFIED_UID }, { $set: { displayName: "Renamed Visitor" } });

      const response = await request(app).get(`/api/beaches/${BEACH_ID}/comments`);

      expect(response.body[0]).toMatchObject({ displayName: "Renamed Visitor" });
    });

    it("rejects with 400 for a malformed beachId", async () => {
      const response = await request(buildApp()).get(`/api/beaches/${encodeURIComponent("bad id")}/comments`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "invalid_beach_id" });
    });

    it("rejects with 404 for a well-formed but unknown beachId", async () => {
      const response = await request(buildApp()).get("/api/beaches/no-such-beach/comments");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: "beach_not_found" });
    });
  });

  describe("POST /api/beaches/:beachId/comments", () => {
    it("rejects with 401 when no Authorization header is provided", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .send({ description: "hello" });

      expect(response.status).toBe(401);
    });

    it("rejects with 403 when the email is unverified", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer unverified-token")
        .send({ description: "hello" });

      expect(response.status).toBe(403);
    });

    it("rejects with 400 for an empty description", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "   " });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "invalid_description" });
    });

    it("rejects with 400 for a missing description", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "invalid_description" });
    });

    it("rejects with 400 for a description over 1000 characters", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "a".repeat(1001) });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "invalid_description" });
    });

    it("rejects with 400 for a malformed beachId", async () => {
      const response = await request(buildApp())
        .post(`/api/beaches/${encodeURIComponent("bad id")}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "hello" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "invalid_beach_id" });
    });

    it("rejects with 404 for a well-formed but unknown beachId", async () => {
      const response = await request(buildApp())
        .post("/api/beaches/no-such-beach/comments")
        .set("Authorization", "Bearer verified-token")
        .send({ description: "hello" });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: "beach_not_found" });
    });

    it("persists a valid comment, visible via a subsequent GET", async () => {
      const app = buildApp();

      const postResponse = await request(app)
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "great beach!" });

      expect(postResponse.status).toBe(204);

      const getResponse = await request(app).get(`/api/beaches/${BEACH_ID}/comments`);
      expect(getResponse.body).toHaveLength(1);
      expect(getResponse.body[0]).toMatchObject({
        description: "great beach!",
        userId: VERIFIED_UID,
        beachId: BEACH_ID,
      });
    });
  });

  describe("DELETE /api/beaches/:beachId/comments/:commentId", () => {
    async function postComment(app: ReturnType<typeof buildApp>, token: string, description: string) {
      await request(app)
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({ description });
      const { body } = await request(app).get(`/api/beaches/${BEACH_ID}/comments`);
      return body[0].id as string;
    }

    it("rejects with 401 when no Authorization header is provided", async () => {
      const app = buildApp();
      const commentId = await postComment(app, "verified-token", "delete me");

      const response = await request(app).delete(`/api/beaches/${BEACH_ID}/comments/${commentId}`);

      expect(response.status).toBe(401);
    });

    it("rejects with 403 when the caller doesn't own the comment", async () => {
      const app = buildApp();
      const commentId = await postComment(app, "verified-token", "not yours");

      const response = await request(app)
        .delete(`/api/beaches/${BEACH_ID}/comments/${commentId}`)
        .set("Authorization", "Bearer verified-token-2");

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: "unauthorized" });
    });

    it("rejects with 404 for an unknown commentId", async () => {
      const response = await request(buildApp())
        .delete(`/api/beaches/${BEACH_ID}/comments/no-such-comment`)
        .set("Authorization", "Bearer verified-token");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: "comment_not_found" });
    });

    it("rejects with 404 for a well-formed but unknown beachId", async () => {
      const app = buildApp();
      const commentId = await postComment(app, "verified-token", "hi");

      const response = await request(app)
        .delete(`/api/beaches/no-such-beach/comments/${commentId}`)
        .set("Authorization", "Bearer verified-token");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: "beach_not_found" });
    });

    it("rejects with 404 when the commentId belongs to a different (existing) beach", async () => {
      const app = buildApp();
      await request(app)
        .post(`/api/beaches/${BEACH_ID}/comments`)
        .set("Authorization", "Bearer verified-token")
        .send({ description: "on beach A" });
      const { body } = await request(app).get(`/api/beaches/${BEACH_ID}/comments`);
      const commentId = body[0].id as string;

      const response = await request(app)
        .delete(`/api/beaches/${OTHER_BEACH_ID}/comments/${commentId}`)
        .set("Authorization", "Bearer verified-token");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: "comment_not_found" });
    });

    it("removes the comment, confirmed via a subsequent GET", async () => {
      const app = buildApp();
      const commentId = await postComment(app, "verified-token", "bye");

      const deleteResponse = await request(app)
        .delete(`/api/beaches/${BEACH_ID}/comments/${commentId}`)
        .set("Authorization", "Bearer verified-token");
      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app).get(`/api/beaches/${BEACH_ID}/comments`);
      expect(getResponse.body).toEqual([]);
    });
  });
});
