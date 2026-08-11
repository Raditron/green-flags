import { AuthTokenVerifier } from "../../../domain/ports/auth/authTokenVerifier";
import { UserRecord, UserRepository } from "../../../domain/ports/user/userRepository";

/** Thrown when the Firebase ID token itself is missing/invalid/expired, as distinct from a downstream infra failure. */
export class InvalidAuthTokenError extends Error {}

/** Verifies the caller's Firebase ID token, then lazily creates/syncs the mirrored `users` document so it stays current on every authenticated request. */
export async function authenticateUser(
  tokenVerifier: AuthTokenVerifier,
  userRepository: UserRepository,
  idToken: string
): Promise<UserRecord> {
  let decoded;
  try {
    decoded = await tokenVerifier.verifyIdToken(idToken);
  } catch {
    throw new InvalidAuthTokenError();
  }

  return userRepository.findOrCreate(decoded.uid, decoded.emailVerified);
}
