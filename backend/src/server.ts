import "dotenv/config";
import { connectToDatabase } from "./infrastructure/db/mongoClient";
import { MongoHealthcheckRepository } from "./infrastructure/repositories/mongoHealthcheckRepository";
import { createApp } from "./presentation/app";

const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";
const FRONTEND_URL = process.env.FRONTEND_URL;

async function main(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const { db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const healthcheckRepository = new MongoHealthcheckRepository(db);
  const app = createApp(healthcheckRepository, FRONTEND_URL);

  app.listen(PORT, () => {
    console.log(`Green Flags API listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
