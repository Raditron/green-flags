export interface DecodedAuthToken {
  uid: string;
  emailVerified: boolean;
}

/**
 * Verifies a Firebase ID token sent by an authenticated client. Implementations must reject
 * (throw) for a missing, malformed, expired, or otherwise invalid token — `requireAuth` treats
 * any rejection as "unauthenticated".
 */
export interface AuthTokenVerifier {
  verifyIdToken(idToken: string): Promise<DecodedAuthToken>;
}
