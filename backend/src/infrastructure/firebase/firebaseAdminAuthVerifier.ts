import { App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { AuthTokenVerifier, DecodedAuthToken } from "../../domain/ports/auth/authTokenVerifier";

export class FirebaseAdminAuthVerifier implements AuthTokenVerifier {
  constructor(private readonly app: App) {}

  async verifyIdToken(idToken: string): Promise<DecodedAuthToken> {
    const decoded = await getAuth(this.app).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      emailVerified: decoded.email_verified ?? false,
      email: decoded.email,
      displayName: decoded.name,
    };
  }
}
