import "dotenv/config";
import { BeachMapImage } from "../../domain/ports/beachRepository";
import { connectToDatabase } from "../db/mongoClient";
import { BEACH_SEED_DATA } from "./beachSeedData";

interface BeachDocument {
  _id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  order: number;
  mapImage?: BeachMapImage;
}

// Google Maps Static API pin generation (ADR 0001) is disabled for now — no API key configured.
// Seeded beaches go out without a mapImage until it's re-enabled.
async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const { client, db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const collection = db.collection<BeachDocument>("beaches");

  try {
    for (const beach of BEACH_SEED_DATA) {
      console.log(`Seeding ${beach.name}...`);

      await collection.updateOne(
        { _id: beach.id },
        {
          $set: {
            name: beach.name,
            lat: beach.lat,
            long: beach.long,
            quirkNotes: beach.quirkNotes,
            order: beach.order,
          },
        },
        { upsert: true }
      );
    }

    console.log(`Seeded ${BEACH_SEED_DATA.length} beaches.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Failed to seed beaches", error);
  process.exit(1);
});
