import { describe, expect, it } from "vitest";
import { authenticateUser, InvalidAuthTokenError } from "../src/application/useCases/authenticateUser";
import { AuthTokenVerifier, DecodedAuthToken } from "../src/domain/ports/authTokenVerifier";
import { UserRecord, UserRepository } from "../src/domain/ports/userRepository";

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
    findOrCreate: async (uid, emailVerified) => ({ uid, emailVerified }),
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

    expect(user).toEqual<UserRecord>({ uid: "uid-1", emailVerified: true });
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
