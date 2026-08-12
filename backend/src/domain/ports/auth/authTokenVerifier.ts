export interface DecodedAuthToken {
  uid: string;
  emailVerified: boolean;
  /** Optional because a token isn't guaranteed to carry either claim (e.g. a stale/unrefreshed token). */
  email?: string;
  displayName?: string;
}

/**
 * Verifies a Firebase ID token sent by an authenticated client. Implementations must reject
 * (throw) for a missing, malformed, expired, or otherwise invalid token — `requireAuth` treats
 * any rejection as "unauthenticated".
 */
export interface AuthTokenVerifier {
  verifyIdToken(idToken: string): Promise<DecodedAuthToken>;
}
