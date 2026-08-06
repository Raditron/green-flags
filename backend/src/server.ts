import "dotenv/config";
import { buildDependencies } from "./composition";
import { createApp } from "./presentation/app";

const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";
const FRONTEND_URL = process.env.FRONTEND_URL;
const BATCH_TRIGGER_SECRET = process.env.BATCH_TRIGGER_SECRET;
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;

async function main(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  if (!BATCH_TRIGGER_SECRET) {
    throw new Error("BATCH_TRIGGER_SECRET environment variable is required");
  }
  if (!FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is required");
  }

  const dependencies = await buildDependencies({
    mongoUri: MONGODB_URI,
    mongoDbName: MONGODB_DB_NAME,
    batchTriggerSecret: BATCH_TRIGGER_SECRET,
    firebaseServiceAccount: FIREBASE_SERVICE_ACCOUNT,
  });

  const app = createApp(dependencies, FRONTEND_URL);

  app.listen(PORT, () => {
    console.log(`Green Flags API listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
