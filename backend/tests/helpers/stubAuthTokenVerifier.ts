import { AuthTokenVerifier, DecodedAuthToken } from "../../src/domain/ports/authTokenVerifier";

/** Maps fixed token strings to decoded claims, rejecting anything else — stands in for the Firebase Admin SDK in tests. */
export function stubAuthTokenVerifier(tokensByValue: Record<string, DecodedAuthToken>): AuthTokenVerifier {
  return {
    async verifyIdToken(idToken: string): Promise<DecodedAuthToken> {
      const decoded = tokensByValue[idToken];
      if (!decoded) {
        throw new Error("invalid token");
      }
      return decoded;
    },
  };
}
