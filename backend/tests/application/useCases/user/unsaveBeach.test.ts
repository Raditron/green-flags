import { describe, expect, it } from "vitest";
import { unsaveBeach } from "../../../../src/application/useCases/user/unsaveBeach";
import { UserRecord, UserRepository } from "../../../../src/domain/ports/user/userRepository";

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

describe("unsaveBeach", () => {
  it("removes the beach id from the user's saved list", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await unsaveBeach(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["other-beach", BEACH_ID] }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, savedBeaches: [], ...changes };
        },
      }),
      UID,
      BEACH_ID,
    );

    expect(updates).toEqual([{ savedBeaches: ["other-beach"] }]);
  });

  it("is a no-op when the beach isn't saved, rather than erroring", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await unsaveBeach(
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

    expect(updates).toHaveLength(0);
  });

  it("is a no-op on a user with no saved beaches at all", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await unsaveBeach(
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

    expect(updates).toHaveLength(0);
  });
});
