import "dotenv/config";
import { BeachMapImage } from "../../domain/ports/beachRepository";
import { connectToDatabase } from "../db/mongoClient";
import { fetchStaticMapPin } from "../googleMaps/staticMapClient";
import { BEACH_SEED_DATA } from "./beachSeedData";

interface BeachDocument {
  _id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  order: number;
  mapImage: BeachMapImage;
}

async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY environment variable is required");
  }

  const { client, db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const collection = db.collection<BeachDocument>("beaches");

  try {
    for (const beach of BEACH_SEED_DATA) {
      console.log(`Seeding ${beach.name}...`);
      const mapImage = await fetchStaticMapPin(beach.lat, beach.long, GOOGLE_MAPS_API_KEY);

      await collection.updateOne(
        { _id: beach.id },
        {
          $set: {
            name: beach.name,
            lat: beach.lat,
            long: beach.long,
            quirkNotes: beach.quirkNotes,
            order: beach.order,
            mapImage,
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
