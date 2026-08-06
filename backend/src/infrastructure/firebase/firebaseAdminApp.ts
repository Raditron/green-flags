import { App, cert, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";

/**
 * Parses the service account credential from a single env var (its full JSON, as issued by the
 * Firebase console) rather than three separate PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY vars — avoids
 * the private key's embedded newlines getting mangled by a dashboard env var UI (Render).
 */
export function initializeFirebaseAdminApp(serviceAccountJson: string): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
  return initializeApp({ credential: cert(serviceAccount) });
}
