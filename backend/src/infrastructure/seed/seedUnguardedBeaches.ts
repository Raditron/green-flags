import "dotenv/config";
import { BeachAreas, BeachMapImage } from "../../domain/ports/beach/beachRepository";
import { connectToDatabase } from "../db/mongoClient";
import { BEACH_SEED_DATA } from "./beachSeedData";
import { UNGUARDED_BEACH_SEED_DATA } from "./unguardedBeachSeedData";

interface BeachDocument {
  _id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  order: number;
  mapImage?: BeachMapImage;
  onshoreWindDirectionDeg: number;
  area: BeachAreas;
  isUnguarded: boolean;
}

/**
 * Seeds/updates beaches from the Ministry of Tourism's unguarded-beach order (Заповед № Т-РД-16-221/
 * 13.07.2026 — see unguardedBeachSeedData.ts for provenance and the exact-match caveat). Two sources
 * feed the same upsert loop, kept separate so isUnguarded curation for the launch-list beaches lives
 * in one place (beachSeedData.ts) rather than duplicated here:
 *
 *  - beachSeedData.ts entries already flagged isUnguarded: true (Shabla, Elenite, Irakli, Rezovo —
 *    exact-matched official beaches — plus Durankulak, inferred unguarded) — re-upserted here so
 *    this script is self-sufficient even if `npm run seed` hasn't been (re-)run since those flags
 *    were added.
 *  - unguardedBeachSeedData.ts — official beaches with no corresponding launch-list entry.
 *
 * Independent from `npm run seed` (seedBeaches.ts): run either in any order, any number of times.
 */
async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const { client, db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const collection = db.collection<BeachDocument>("beaches");

  const beaches = [...BEACH_SEED_DATA.filter((beach) => beach.isUnguarded), ...UNGUARDED_BEACH_SEED_DATA];

  try {
    for (const beach of beaches) {
      console.log(`Seeding unguarded beach ${beach.name}...`);

      await collection.updateOne(
        { _id: beach.id },
        {
          $set: {
            name: beach.name,
            lat: beach.lat,
            long: beach.long,
            quirkNotes: beach.quirkNotes,
            order: beach.order,
            onshoreWindDirectionDeg: beach.onshoreWindDirectionDeg,
            area: beach.area,
            isUnguarded: beach.isUnguarded ?? true,
          },
        },
        { upsert: true }
      );
    }

    console.log(`Seeded ${beaches.length} unguarded beaches.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Failed to seed unguarded beaches", error);
  process.exit(1);
});
