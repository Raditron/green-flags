import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { MongoUserRepository } from "../src/infrastructure/repositories/mongoUserRepository";

const UID = "firebase-uid-1";

describe("MongoUserRepository", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let repository: MongoUserRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    db = client.db("green-flags-test");
    repository = new MongoUserRepository(db);
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection("users").deleteMany({});
  });

  it("creates a user document keyed by Firebase UID on first sight", async () => {
    const result = await repository.findOrCreate(UID, false);

    expect(result).toEqual({ uid: UID, emailVerified: false });
    const stored = await db.collection("users").findOne({ _id: UID } as never);
    expect(stored?.emailVerified).toBe(false);
  });

  it("does not duplicate the document on a repeat call with the same UID", async () => {
    await repository.findOrCreate(UID, false);
    await repository.findOrCreate(UID, false);

    expect(await db.collection("users").countDocuments({ _id: UID } as never)).toBe(1);
  });

  it("syncs emailVerified to the token's current claim on subsequent calls", async () => {
    await repository.findOrCreate(UID, false);

    const result = await repository.findOrCreate(UID, true);

    expect(result).toEqual({ uid: UID, emailVerified: true });
  });
});
