import "dotenv/config";
import { connectToDatabase } from "./infrastructure/db/mongoClient";
import { MongoHealthcheckRepository } from "./infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "./infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "./infrastructure/repositories/mongoPredictionRepository";
import { MongoReportRepository } from "./infrastructure/repositories/mongoReportRepository";
import { MongoUserRepository } from "./infrastructure/repositories/mongoUserRepository";
import { OpenMeteoForecastClient } from "./infrastructure/openMeteo/openMeteoForecastClient";
import { MeteoalarmStormWarningClient } from "./infrastructure/meteoalarm/meteoalarmStormWarningClient";
import { initializeFirebaseAdminApp } from "./infrastructure/firebase/firebaseAdminApp";
import { FirebaseAdminAuthVerifier } from "./infrastructure/firebase/firebaseAdminAuthVerifier";
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

  const { db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const healthcheckRepository = new MongoHealthcheckRepository(db);
  const beachRepository = new MongoBeachRepository(db);
  const predictionRepository = new MongoPredictionRepository(db);
  const reportRepository = new MongoReportRepository(db);
  const userRepository = new MongoUserRepository(db);
  const forecastProvider = new OpenMeteoForecastClient();
  const stormWarningProvider = new MeteoalarmStormWarningClient();
  const firebaseApp = initializeFirebaseAdminApp(FIREBASE_SERVICE_ACCOUNT);
  const authTokenVerifier = new FirebaseAdminAuthVerifier(firebaseApp);

  const app = createApp(
    {
      healthcheckRepository,
      beachRepository,
      predictionRepository,
      reportRepository,
      forecastProvider,
      stormWarningProvider,
      batchTriggerSecret: BATCH_TRIGGER_SECRET,
      authTokenVerifier,
      userRepository,
    },
    FRONTEND_URL
  );

  app.listen(PORT, () => {
    console.log(`Green Flags API listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
