import { describe, expect, it } from "vitest";
import { saveBeach } from "../src/application/useCases/saveBeach";
import { UserRecord, UserRepository } from "../src/domain/ports/userRepository";

const UID = "uid-1";
const BEACH_ID = "kranevo-sunny-day";

function buildFakeUserRepository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findOrCreate: async (uid, emailVerified) => ({ uid, emailVerified, savedBeaches: [] }),
    getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: [] }),
    update: async (uid, changes) => ({ uid, emailVerified: true, savedBeaches: [], ...changes }),
    ...overrides,
  };
}

describe("saveBeach", () => {
  it("adds the beach id to a user with no saved beaches yet", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await saveBeach(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: [] }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, savedBeaches: [], ...changes };
        },
      }),
      UID,
      BEACH_ID,
    );

    expect(updates).toEqual([{ savedBeaches: [BEACH_ID] }]);
  });

  it("appends to an existing list without disturbing other saved beaches", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await saveBeach(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["other-beach"] }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, savedBeaches: [], ...changes };
        },
      }),
      UID,
      BEACH_ID,
    );

    expect(updates).toEqual([{ savedBeaches: ["other-beach", BEACH_ID] }]);
  });

  it("is a no-op when the beach is already saved, rather than duplicating the entry", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await saveBeach(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: [BEACH_ID] }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, savedBeaches: [], ...changes };
        },
      }),
      UID,
      BEACH_ID,
    );

    expect(updates).toHaveLength(0);
  });
});
