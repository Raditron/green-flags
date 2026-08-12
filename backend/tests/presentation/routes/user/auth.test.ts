import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { createApp } from "../../../../src/presentation/app";
import { MongoHealthcheckRepository } from "../../../../src/infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "../../../../src/infrastructure/repositories/mongoBeachRepository";
import { MongoUserRepository } from "../../../../src/infrastructure/repositories/mongoUserRepository";
import { stubBatchDependencies } from "../../../helpers/stubBatchDependencies";
import { stubAuthTokenVerifier } from "../../../helpers/stubAuthTokenVerifier";

const UNVERIFIED_UID = "uid-unverified";
const VERIFIED_UID = "uid-verified";
const FRESH_UID = "uid-fresh";
const RESYNC_UID = "uid-resync";
const LEGACY_UID = "uid-legacy";

describe("GET /api/me (requireAuth + requireVerifiedEmail)", () => {
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
    await db.collection("users").deleteMany({});
  });

  function buildApp() {
    return createApp({
      healthcheckRepository: new MongoHealthcheckRepository(db),
      beachRepository: new MongoBeachRepository(db),
      ...stubBatchDependencies(),
      userRepository: new MongoUserRepository(db),
      authTokenVerifier: stubAuthTokenVerifier({
        "valid-unverified-token": { uid: UNVERIFIED_UID, emailVerified: false },
        "valid-verified-token": { uid: VERIFIED_UID, emailVerified: true },
        "fresh-token-with-claims": {
          uid: FRESH_UID,
          emailVerified: true,
          email: "diver@example.com",
          displayName: "Diver Dan",
        },
        "resync-token-with-claims": {
          uid: RESYNC_UID,
          emailVerified: true,
          email: "diver@example.com",
          displayName: "Diver Dan",
        },
        "resync-token-missing-display-name": { uid: RESYNC_UID, emailVerified: true },
        "legacy-token": { uid: LEGACY_UID, emailVerified: true },
      }),
    });
  }

  it("rejects with 401 when no Authorization header is provided", async () => {
    const response = await request(buildApp()).get("/api/me");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("error");
  });

  it("rejects with 401 when the bearer token is invalid", async () => {
    const response = await request(buildApp()).get("/api/me").set("Authorization", "Bearer garbage-token");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("error");
  });

  it("rejects with 403 and a distinguishable code when the token is valid but the email is unverified", async () => {
    const response = await request(buildApp())
      .get("/api/me")
      .set("Authorization", "Bearer valid-unverified-token");

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ status: "error", code: "email_not_verified" });
  });

  it("passes through both middleware and returns the decoded user when the token is valid and verified", async () => {
    const response = await request(buildApp()).get("/api/me").set("Authorization", "Bearer valid-verified-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      uid: VERIFIED_UID,
      emailVerified: true,
      email: "",
      displayName: "",
      savedBeaches: [],
    });
  });

  it("lazily creates the users document keyed by Firebase UID on first authenticated request", async () => {
    await request(buildApp()).get("/api/me").set("Authorization", "Bearer valid-verified-token");

    const stored = await db.collection("users").findOne({ _id: VERIFIED_UID } as never);
    expect(stored?.emailVerified).toBe(true);
  });

  it("stores and returns email/displayName from the token's claims on a fresh UID's first request", async () => {
    const response = await request(buildApp())
      .get("/api/me")
      .set("Authorization", "Bearer fresh-token-with-claims");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      uid: FRESH_UID,
      email: "diver@example.com",
      displayName: "Diver Dan",
    });

    const stored = await db.collection("users").findOne({ _id: FRESH_UID } as never);
    expect(stored?.email).toBe("diver@example.com");
    expect(stored?.displayName).toBe("Diver Dan");
  });

  it("does not null out a previously-stored displayName when a later request's token is missing that claim", async () => {
    const app = buildApp();
    await request(app).get("/api/me").set("Authorization", "Bearer resync-token-with-claims");

    const response = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer resync-token-missing-display-name");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      uid: RESYNC_UID,
      email: "diver@example.com",
      displayName: "Diver Dan",
    });
  });

  it("reads a pre-feature document's missing email/displayName back as \"\" rather than undefined", async () => {
    await db.collection("users").insertOne({
      _id: LEGACY_UID,
      emailVerified: false,
      savedBeaches: [],
      createdAt: new Date(),
    } as never);

    const response = await request(buildApp()).get("/api/me").set("Authorization", "Bearer legacy-token");

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("");
    expect(response.body.displayName).toBe("");
  });

  it("responds with 503, not 401, when the token is valid but the user repository fails", async () => {
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
      authTokenVerifier: stubAuthTokenVerifier({
        "valid-verified-token": { uid: VERIFIED_UID, emailVerified: true },
      }),
    });

    const response = await request(app).get("/api/me").set("Authorization", "Bearer valid-verified-token");

    expect(response.status).toBe(503);
  });
});
