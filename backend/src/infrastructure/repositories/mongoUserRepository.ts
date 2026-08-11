import { Collection, Db } from "mongodb";
import { UserRecord, UserRepository } from "../../domain/ports/userRepository";

interface UserDocument {
  _id: string;
  emailVerified: boolean;
  savedBeaches: string[];
  createdAt: Date;
}

export class MongoUserRepository implements UserRepository {
  private readonly collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>("users");
  }

  async findOrCreate(uid: string, emailVerified: boolean): Promise<UserRecord> {
    const doc = await this.collection.findOneAndUpdate(
      { _id: uid },
      {
        $set: { emailVerified },
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
      savedBeaches: doc.savedBeaches,
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
      savedBeaches: doc.savedBeaches,
    };
  }
}
