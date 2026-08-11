import { Collection, Db } from "mongodb";
import { Beach, BeachAreas, BeachMapImage, BeachRepository } from "../../domain/ports/beach/beachRepository";

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
  isUnguarded?: boolean;
}

export class MongoBeachRepository implements BeachRepository {
  private readonly collection: Collection<BeachDocument>;

  constructor(db: Db) {
    this.collection = db.collection<BeachDocument>("beaches");
  }

  async listBeaches(): Promise<Beach[]> {
    const docs = await this.collection.find().sort({ order: 1 }).toArray();
    return docs.map(toBeach);
  }

  async findBeachById(beachId: string): Promise<Beach | null> {
    const doc = await this.collection.findOne({ _id: beachId });
    return doc ? toBeach(doc) : null;
  }
}

function toBeach(doc: BeachDocument): Beach {
  return {
    id: doc._id,
    name: doc.name,
    lat: doc.lat,
    long: doc.long,
    quirkNotes: doc.quirkNotes,
    mapImage: doc.mapImage,
    onshoreWindDirectionDeg: doc.onshoreWindDirectionDeg,
    area: doc.area,
    // Defaults false for existing/not-yet-curated documents that predate this field.
    isUnguarded: doc.isUnguarded ?? false,
  };
}
