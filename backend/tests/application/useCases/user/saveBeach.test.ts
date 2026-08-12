import { describe, expect, it } from "vitest";
import { saveBeach } from "../../../../src/application/useCases/user/saveBeach";
import { UserRecord, UserRepository } from "../../../../src/domain/ports/user/userRepository";

const UID = "uid-1";
const BEACH_ID = "kranevo-sunny-day";

function buildFakeUserRepository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findOrCreate: async (uid, claims) => ({
      uid,
      emailVerified: claims.emailVerified,
      email: claims.email ?? "",
      displayName: claims.displayName ?? "",
      savedBeaches: [],
    }),
    getUserById: async (uid) => ({ uid, emailVerified: true, email: "", displayName: "", savedBeaches: [] }),
    update: async (uid, changes) => ({
      uid,
      emailVerified: true,
      email: "",
      displayName: "",
      savedBeaches: [],
      ...changes,
    }),
    ...overrides,
  };
}

describe("saveBeach", () => {
  it("adds the beach id to a user with no saved beaches yet", async () => {
    const updates: Array<Partial<Omit<UserRecord, "uid">>> = [];
    await saveBeach(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, email: "", displayName: "", savedBeaches: [] }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, email: "", displayName: "", savedBeaches: [], ...changes };
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
        getUserById: async (uid) => ({
          uid,
          emailVerified: true,
          email: "",
          displayName: "",
          savedBeaches: ["other-beach"],
        }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, email: "", displayName: "", savedBeaches: [], ...changes };
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
        getUserById: async (uid) => ({
          uid,
          emailVerified: true,
          email: "",
          displayName: "",
          savedBeaches: [BEACH_ID],
        }),
        update: async (uid, changes) => {
          updates.push(changes);
          return { uid, emailVerified: true, email: "", displayName: "", savedBeaches: [], ...changes };
        },
      }),
      UID,
      BEACH_ID,
    );

    expect(updates).toHaveLength(0);
  });
});
