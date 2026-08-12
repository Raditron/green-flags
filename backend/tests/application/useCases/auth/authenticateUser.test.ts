import { describe, expect, it } from "vitest";
import { authenticateUser, InvalidAuthTokenError } from "../../../../src/application/useCases/auth/authenticateUser";
import { AuthTokenVerifier, DecodedAuthToken } from "../../../../src/domain/ports/auth/authTokenVerifier";
import { UserRecord, UserRepository } from "../../../../src/domain/ports/user/userRepository";

function buildFakeTokenVerifier(decoded: DecodedAuthToken | Error): AuthTokenVerifier {
  return {
    verifyIdToken: async () => {
      if (decoded instanceof Error) throw decoded;
      return decoded;
    },
  };
}

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

describe("authenticateUser", () => {
  it("returns the synced user record for a valid token", async () => {
    const user = await authenticateUser(
      buildFakeTokenVerifier({ uid: "uid-1", emailVerified: true }),
      buildFakeUserRepository(),
      "valid-token"
    );

    expect(user).toEqual<UserRecord>({ uid: "uid-1", emailVerified: true, email: "", displayName: "", savedBeaches: [] });
  });

  it("passes the decoded token's claims through to findOrCreate as a single object", async () => {
    const receivedClaims: Array<Parameters<UserRepository["findOrCreate"]>[1]> = [];

    await authenticateUser(
      buildFakeTokenVerifier({
        uid: "uid-1",
        emailVerified: true,
        email: "diver@example.com",
        displayName: "Diver Dan",
      }),
      buildFakeUserRepository({
        findOrCreate: async (uid, claims) => {
          receivedClaims.push(claims);
          return { uid, emailVerified: claims.emailVerified, email: "", displayName: "", savedBeaches: [] };
        },
      }),
      "valid-token"
    );

    expect(receivedClaims).toEqual([
      { emailVerified: true, email: "diver@example.com", displayName: "Diver Dan" },
    ]);
  });

  it("throws InvalidAuthTokenError when the token fails verification", async () => {
    await expect(
      authenticateUser(buildFakeTokenVerifier(new Error("bad token")), buildFakeUserRepository(), "garbage")
    ).rejects.toBeInstanceOf(InvalidAuthTokenError);
  });

  it("propagates repository failures as-is, not as an InvalidAuthTokenError", async () => {
    const dbError = new Error("connection refused");

    await expect(
      authenticateUser(
        buildFakeTokenVerifier({ uid: "uid-1", emailVerified: true }),
        buildFakeUserRepository({
          findOrCreate: async () => {
            throw dbError;
          },
        }),
        "valid-token"
      )
    ).rejects.toBe(dbError);
  });
});
