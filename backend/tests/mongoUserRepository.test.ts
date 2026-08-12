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
    const result = await repository.findOrCreate(UID, { emailVerified: false });

    expect(result).toEqual({ uid: UID, emailVerified: false, email: "", displayName: "", savedBeaches: [] });
    const stored = await db.collection("users").findOne({ _id: UID } as never);
    expect(stored?.emailVerified).toBe(false);
    expect(stored?.savedBeaches).toEqual([]);
  });

  it("does not duplicate the document on a repeat call with the same UID", async () => {
    await repository.findOrCreate(UID, { emailVerified: false });
    await repository.findOrCreate(UID, { emailVerified: false });

    expect(await db.collection("users").countDocuments({ _id: UID } as never)).toBe(1);
  });

  it("syncs emailVerified to the token's current claim on subsequent calls", async () => {
    await repository.findOrCreate(UID, { emailVerified: false });

    const result = await repository.findOrCreate(UID, { emailVerified: true });

    expect(result).toEqual({ uid: UID, emailVerified: true, email: "", displayName: "", savedBeaches: [] });
  });

  it("does not wipe existing saved beaches when re-syncing emailVerified on a later call", async () => {
    await repository.findOrCreate(UID, { emailVerified: false });
    await repository.update(UID, { savedBeaches: ["kranevo-sunny-day"] });

    const result = await repository.findOrCreate(UID, { emailVerified: true });

    expect(result).toEqual({
      uid: UID,
      emailVerified: true,
      email: "",
      displayName: "",
      savedBeaches: ["kranevo-sunny-day"],
    });
  });

  it("stores and returns email/displayName from the claims on first sight", async () => {
    const result = await repository.findOrCreate(UID, {
      emailVerified: true,
      email: "diver@example.com",
      displayName: "Diver Dan",
    });

    expect(result).toEqual({
      uid: UID,
      emailVerified: true,
      email: "diver@example.com",
      displayName: "Diver Dan",
      savedBeaches: [],
    });
  });

  it("does not null out a previously-stored email/displayName when a later call's claims omit them", async () => {
    await repository.findOrCreate(UID, {
      emailVerified: false,
      email: "diver@example.com",
      displayName: "Diver Dan",
    });

    const result = await repository.findOrCreate(UID, { emailVerified: true });

    expect(result).toEqual({
      uid: UID,
      emailVerified: true,
      email: "diver@example.com",
      displayName: "Diver Dan",
      savedBeaches: [],
    });
  });

  it("getUserById returns the stored record", async () => {
    await repository.findOrCreate(UID, { emailVerified: false });

    const result = await repository.getUserById(UID);

    expect(result).toEqual({ uid: UID, emailVerified: false, email: "", displayName: "", savedBeaches: [] });
  });

  it("getUserById defaults a predates-this-feature document's missing email/displayName to \"\"", async () => {
    await db.collection("users").insertOne({
      _id: UID,
      emailVerified: false,
      savedBeaches: [],
      createdAt: new Date(),
    } as never);

    const result = await repository.getUserById(UID);

    expect(result.email).toBe("");
    expect(result.displayName).toBe("");
  });

  it("getUserById rejects for a UID with no stored document", async () => {
    await expect(repository.getUserById("no-such-uid")).rejects.toThrow();
  });

  it("update patches only the supplied fields, leaving the rest untouched", async () => {
    await repository.findOrCreate(UID, { emailVerified: false });

    const result = await repository.update(UID, { savedBeaches: ["kranevo-sunny-day"] });

    expect(result).toEqual({
      uid: UID,
      emailVerified: false,
      email: "",
      displayName: "",
      savedBeaches: ["kranevo-sunny-day"],
    });
  });

  it("update rejects for a UID with no stored document", async () => {
    await expect(repository.update("no-such-uid", { savedBeaches: [] })).rejects.toThrow();
  });
});
