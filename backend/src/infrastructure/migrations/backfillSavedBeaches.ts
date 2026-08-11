import "dotenv/config";
import { connectToDatabase } from "../db/mongoClient";

interface UserDocument {
  _id: string;
  emailVerified: boolean;
  savedBeaches?: string[];
  createdAt: Date;
}

/**
 * One-time backfill for user docs created before the saved-beaches feature existed. Those docs
 * have no `savedBeaches` field at all, which crashes `saveBeach`/`unsaveBeach`/`getSavedBeaches`
 * with a TypeError the controller mislabels as "Database unavailable" (see saveBeach.ts).
 * `findOrCreate`'s `$setOnInsert` only sets the field on a brand-new doc, so it never repairs
 * existing ones — this script does that once, directly.
 */
async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "green-flags";

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const { client, db } = await connectToDatabase(MONGODB_URI, MONGODB_DB_NAME);
  const collection = db.collection<UserDocument>("users");

  try {
    const result = await collection.updateMany(
      { savedBeaches: { $exists: false } },
      { $set: { savedBeaches: [] } },
    );

    console.log(
      `Backfilled savedBeaches on ${result.modifiedCount} user doc(s) (matched ${result.matchedCount}).`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Failed to backfill savedBeaches", error);
  process.exit(1);
});
