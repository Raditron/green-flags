import "dotenv/config";
import { connectToDatabase } from "./infrastructure/db/mongoClient";
import { MongoHealthcheckRepository } from "./infrastructure/repositories/mongoHealthcheckRepository";
import { MongoBeachRepository } from "./infrastructure/repositories/mongoBeachRepository";
import { MongoPredictionRepository } from "./infrastructure/repositories/mongoPredictionRepository";
import { OpenMeteoForecastClient } from "./infrastructure/openMeteo/openMeteoForecastClient";
import { MeteoalarmStormWarningClient } from "./infrastructure/meteoalarm/meteoalarmStormWarningClient";
import { createApp } from "./presentation/app";

const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";
const FRONTEND_URL = process.env.FRONTEND_URL;
const BATCH_TRIGGER_SECRET = process.env.BATCH_TRIGGER_SECRET;

async function main(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  if (!BATCH_TRIGGER_SECRET) {
    throw new Error("BATCH_TRIGGER_SECRET environment variable is required");
  }

  const { db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const healthcheckRepository = new MongoHealthcheckRepository(db);
  const beachRepository = new MongoBeachRepository(db);
  const predictionRepository = new MongoPredictionRepository(db);
  const forecastProvider = new OpenMeteoForecastClient();
  const stormWarningProvider = new MeteoalarmStormWarningClient();

  const app = createApp(
    {
      healthcheckRepository,
      beachRepository,
      predictionRepository,
      forecastProvider,
      stormWarningProvider,
      batchTriggerSecret: BATCH_TRIGGER_SECRET,
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
