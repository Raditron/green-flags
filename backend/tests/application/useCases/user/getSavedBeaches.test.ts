import { describe, expect, it } from "vitest";
import { getSavedBeaches } from "../../../../src/application/useCases/user/getSavedBeaches";
import { Beach, BeachAreas, BeachRepository } from "../../../../src/domain/ports/beach/beachRepository";
import { UserRepository } from "../../../../src/domain/ports/user/userRepository";

const UID = "uid-1";

const BEACH_A: Beach = {
  id: "beach-a",
  name: "Beach A",
  lat: 0,
  long: 0,
  onshoreWindDirectionDeg: 75,
  area: BeachAreas.Varna,
  isUnguarded: false,
};

const BEACH_B: Beach = {
  id: "beach-b",
  name: "Beach B",
  lat: 0,
  long: 0,
  onshoreWindDirectionDeg: 75,
  area: BeachAreas.Burgas,
  isUnguarded: false,
};

function buildFakeUserRepository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findOrCreate: async (uid, emailVerified) => ({ uid, emailVerified, savedBeaches: [] }),
    getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: [] }),
    update: async (uid, changes) => ({ uid, emailVerified: true, savedBeaches: [], ...changes }),
    ...overrides,
  };
}

function buildFakeBeachRepository(overrides: Partial<BeachRepository> = {}): BeachRepository {
  return {
    listBeaches: async () => [BEACH_A, BEACH_B],
    findBeachById: async (beachId) => [BEACH_A, BEACH_B].find((beach) => beach.id === beachId) ?? null,
    ...overrides,
  };
}

describe("getSavedBeaches", () => {
  it("resolves the user's saved beach ids to their full beach records, in order", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["beach-b", "beach-a"] }),
      }),
      buildFakeBeachRepository(),
      UID,
    );

    expect(beaches).toEqual([BEACH_B, BEACH_A]);
  });

  it("returns an empty list for a user with no saved beaches", async () => {
    const beaches = await getSavedBeaches(buildFakeUserRepository(), buildFakeBeachRepository(), UID);

    expect(beaches).toEqual([]);
  });

  it("silently drops saved ids that no longer resolve to a beach", async () => {
    const beaches = await getSavedBeaches(
      buildFakeUserRepository({
        getUserById: async (uid) => ({ uid, emailVerified: true, savedBeaches: ["beach-a", "deleted-beach"] }),
      }),
      buildFakeBeachRepository(),
      UID,
    );

    expect(beaches).toEqual([BEACH_A]);
  });
});
