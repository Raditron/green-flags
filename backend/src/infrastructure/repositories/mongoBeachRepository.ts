import { Collection, Db } from "mongodb";
import { Beach, BeachMapImage, BeachRepository } from "../../domain/ports/beachRepository";

interface BeachDocument {
  _id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  order: number;
  mapImage: BeachMapImage;
}

export class MongoBeachRepository implements BeachRepository {
  private readonly collection: Collection<BeachDocument>;

  constructor(db: Db) {
    this.collection = db.collection<BeachDocument>("beaches");
  }

  async listBeaches(): Promise<Beach[]> {
    const docs = await this.collection.find().sort({ order: 1 }).toArray();

    return docs.map((doc) => ({
      id: doc._id,
      name: doc.name,
      lat: doc.lat,
      long: doc.long,
      quirkNotes: doc.quirkNotes,
      mapImage: doc.mapImage,
    }));
  }
}
