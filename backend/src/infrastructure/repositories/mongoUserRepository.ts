import { Collection, Db } from "mongodb";
import { UserRecord, UserRepository } from "../../domain/ports/user/userRepository";

interface UserDocument {
  _id: string;
  emailVerified: boolean;
  email: string;
  displayName: string;
  savedBeaches: string[];
  createdAt: Date;
}

export class MongoUserRepository implements UserRepository {
  private readonly collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>("users");
  }

  async findOrCreate(
    uid: string,
    claims: { emailVerified: boolean; email?: string; displayName?: string },
  ): Promise<UserRecord> {
    // email/displayName are only included when the token actually carried them — the Mongo Node
    // driver (this project's MongoClient does not set ignoreUndefined: true) otherwise serializes
    // an undefined field as BSON null, which would null out a previously-stored value on a request
    // whose token happens to be missing that claim.
    const set: Partial<UserDocument> = { emailVerified: claims.emailVerified };
    if (claims.email !== undefined) {
      set.email = claims.email;
    }
    if (claims.displayName !== undefined) {
      set.displayName = claims.displayName;
    }

    const doc = await this.collection.findOneAndUpdate(
      { _id: uid },
      {
        $set: set,
        $setOnInsert: { savedBeaches: [], createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (!doc) {
      throw new Error("User upsert did not return a document");
    }

    return {
      uid: doc._id,
      emailVerified: doc.emailVerified,
      // Legacy docs created before email/displayName/savedBeaches existed have no such field —
      // $setOnInsert only backfills savedBeaches on a fresh insert, not on an existing doc, and
      // email/displayName are only ever conditionally $set above — so default here rather than
      // handing callers `undefined`.
      email: doc.email ?? "",
      displayName: doc.displayName ?? "",
      savedBeaches: doc.savedBeaches ?? [],
    };
  }
  async update(
    uid: string,
    changes: Partial<Omit<UserRecord, "uid">>,
  ): Promise<UserRecord> {
    const doc = await this.collection.findOneAndUpdate(
      { _id: uid },
      { $set: changes },
      { returnDocument: "after" },
    );

    if (!doc) {
      throw new Error(`User ${uid} not found`);
    }

    return {
      uid: doc._id,
      emailVerified: doc.emailVerified,
      email: doc.email ?? "",
      displayName: doc.displayName ?? "",
      savedBeaches: doc.savedBeaches,
    };
  }
  async getUserById(uid: string): Promise<UserRecord> {
    const doc = await this.collection.findOne({ _id: uid });

    if (!doc) {
      throw new Error(`User ${uid} not found`);
    }

    return {
      uid: doc._id,
      emailVerified: doc.emailVerified,
      email: doc.email ?? "",
      displayName: doc.displayName ?? "",
      savedBeaches: doc.savedBeaches,
    };
  }
}
