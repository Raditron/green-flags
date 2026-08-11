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

    expect(result).toEqual({ uid: UID, emailVerified: false, savedBeaches: [] });
    const stored = await db.collection("users").findOne({ _id: UID } as never);
    expect(stored?.emailVerified).toBe(false);
    expect(stored?.savedBeaches).toEqual([]);
  });

  it("does not duplicate the document on a repeat call with the same UID", async () => {
    await repository.findOrCreate(UID, false);
    await repository.findOrCreate(UID, false);

    expect(await db.collection("users").countDocuments({ _id: UID } as never)).toBe(1);
  });

  it("syncs emailVerified to the token's current claim on subsequent calls", async () => {
    await repository.findOrCreate(UID, false);

    const result = await repository.findOrCreate(UID, true);

    expect(result).toEqual({ uid: UID, emailVerified: true, savedBeaches: [] });
  });

  it("does not wipe existing saved beaches when re-syncing emailVerified on a later call", async () => {
    await repository.findOrCreate(UID, false);
    await repository.update(UID, { savedBeaches: ["kranevo-sunny-day"] });

    const result = await repository.findOrCreate(UID, true);

    expect(result).toEqual({ uid: UID, emailVerified: true, savedBeaches: ["kranevo-sunny-day"] });
  });

  it("getUserById returns the stored record", async () => {
    await repository.findOrCreate(UID, false);

    const result = await repository.getUserById(UID);

    expect(result).toEqual({ uid: UID, emailVerified: false, savedBeaches: [] });
  });

  it("getUserById rejects for a UID with no stored document", async () => {
    await expect(repository.getUserById("no-such-uid")).rejects.toThrow();
  });

  it("update patches only the supplied fields, leaving the rest untouched", async () => {
    await repository.findOrCreate(UID, false);

    const result = await repository.update(UID, { savedBeaches: ["kranevo-sunny-day"] });

    expect(result).toEqual({ uid: UID, emailVerified: false, savedBeaches: ["kranevo-sunny-day"] });
  });

  it("update rejects for a UID with no stored document", async () => {
    await expect(repository.update("no-such-uid", { savedBeaches: [] })).rejects.toThrow();
  });
});
